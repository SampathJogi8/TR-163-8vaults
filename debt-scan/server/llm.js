const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Credentials validation
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY is missing from environment.');
}
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is missing from environment.');
}
if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is missing from environment.');
}
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is missing from environment.');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/sampathjogipusala/8Vault", 
    "X-Title": "DebtScan",
  }
});

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_LLM_CALLS || '5');

async function _performOpenRouterFreeFallback(standards, systemPrompt, userMessage) {
  const freeModels = [
    'google/gemma-4-31b-it:free',
    'qwen/qwen3-coder:free',
    'google/gemma-3-12b-it:free'
  ];
  
  let lastFallbackErr = null;
  for (const model of freeModels) {
    try {
      console.log(`Trying free fallback: ${model}`);
      const response = await openrouter.chat.completions.create({
        model: model,
        max_tokens: 2000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      });
      const content = response.choices[0].message.content;
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
      return JSON.parse(jsonStr || '[]');
    } catch (fallbackErr) {
      console.warn(`Fallback ${model} failed:`, fallbackErr.message);
      lastFallbackErr = fallbackErr;
    }
  }
  return []; // Return empty if absolutely all free models fail
}

async function _performAnalysis(chunk, standards, provider) {
  const systemPrompt = `
You are an expert code reviewer specializing in code quality, security, and technical debt analysis.
Your job is to analyze the provided code chunk and return a JSON array of issues found.

Each issue must follow this exact schema:
{
  "id": "<uuid>",
  "file": "<filename>",
  "line": <line number or null>,
  "severity": "Critical" | "Major" | "Minor",
  "category": "Security" | "CodeSmell" | "TechnicalDebt" | "Performance" | "Naming",
  "title": "<short title, max 10 words>",
  "description": "<plain English explanation, 1-3 sentences>",
  "fix": "<concrete code fix or refactoring suggestion>"
}

Return ONLY a valid JSON array. If no issues found, return [].
`;

  const userMessage = `
Filename: ${chunk.filename}
Language: ${chunk.language}
Lines ${chunk.startLine}-${chunk.endLine}
Code:
${chunk.code}

${standards ? `Compliance Standards:\n${standards}` : ''}
`;

  if (provider === 'anthropic') {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      const content = response.content[0].text;
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
      return JSON.parse(jsonStr || '[]');
    } catch (err) {
      throw err;
    }
  } else if (provider === 'gemini') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
      const prompt = `${systemPrompt}\n\n${userMessage}`;
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
      return JSON.parse(jsonStr || '[]');
    } catch (err) {
      throw err;
    }
  } else if (provider === 'openrouter') {
    try {
      const response = await openrouter.chat.completions.create({
        model: "anthropic/claude-3.7-sonnet",
        max_tokens: 2000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      });
      const content = response.choices[0].message.content;
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
      return JSON.parse(jsonStr || '[]');
    } catch (err) {
      throw err;
    }
  } else {
    // OpenAI primary
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0].message.content;
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : (parsed.issues || []);
      } catch (e) {
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        return JSON.parse(jsonStr || '[]');
      }
    } catch (err) {
      throw err;
    }
  }
}

async function analyzeChunk(chunk, standards = '', provider = 'auto') {
  const providersToTry = provider === 'auto' 
    ? ['openrouter', 'gemini', 'anthropic', 'openai']
    : [provider];

  let lastError = null;

  for (const p of providersToTry) {
    try {
      console.log(`Analyzing ${chunk.filename} (Try: ${p})`);
      return await _performAnalysis(chunk, standards, p);
    } catch (err) {
      lastError = err;
      const msg = err.message.toLowerCase();
      const isQuotaError = msg.includes('quota') || 
                           msg.includes('rate limit') || 
                           msg.includes('credit') || 
                           msg.includes('429') || 
                           msg.includes('402') ||
                           msg.includes('credits');

      if (isQuotaError && (providersToTry.length > 1 || provider !== 'auto')) {
        console.warn(`Provider [${p}] failed due to limits. Rotating...`);
        continue;
      }
      throw err;
    }
  }

  // Final "Panic" Fallback (Neural Safety Net)
  console.warn("--- ALL PRIMARY PROVIDERS EXHAUSTED. INITIATING NEURAL SAFETY NET ---");
  try {
    const systemPrompt = `Analyze code for debt and quality. Return JSON array.`; 
    const userMessage = `File: ${chunk.filename}\nContent:\n${chunk.code}`;
    return await _performOpenRouterFreeFallback(standards, systemPrompt, userMessage);
  } catch (finalErr) {
    throw new Error(`${lastError.message} (Safety Net also failed: ${finalErr.message})`);
  }
}

async function analyzeAllChunks(chunks, standards = '', provider = 'auto', onProgress) {
  const results = [];
  const total = chunks.length;
  let completed = 0;

  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT) {
    if (i > 0 && provider === 'gemini') {
      await new Promise(resolve => setTimeout(resolve, 5000)); 
    }

    const batch = chunks.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.allSettled(
      batch.map(chunk => analyzeChunk(chunk, standards, provider))
    );

    for (const res of batchResults) {
      if (res.status === 'fulfilled') {
        results.push(...res.value);
      } else {
        throw new Error(`Analysis failed at batch ${Math.floor(i / MAX_CONCURRENT) + 1}: ${res.reason.message}`);
      }
      completed++;
    }

    if (onProgress) {
      onProgress(Math.floor((completed / total) * 100));
    }
  }

  return results;
}

module.exports = { analyzeAllChunks };
