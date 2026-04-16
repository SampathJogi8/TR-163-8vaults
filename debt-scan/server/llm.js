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
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn('WARNING: DEEPSEEK_API_KEY is missing from environment.');
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

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key',
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
  } else if (provider === 'deepseek') {
    try {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
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

// Pre-flight Config Mapping
const getAvailableProviders = (requested) => {
  const config = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY
  };

  if (requested === 'auto') {
    // Priority shift: Gemini + DeepSeek first for massive reliability
    return ['gemini', 'deepseek', 'openrouter', 'anthropic', 'openai'].filter(p => config[p]);
  }
  return config[requested] ? [requested] : [];
};

async function analyzeChunk(chunk, standards = '', provider = 'auto') {
  const providersToTry = getAvailableProviders(provider);
  const failedProviders = new Set();
  
  if (providersToTry.length === 0) {
    console.warn(`[!] Infrastructure Crisis: No configured API keys for [${provider}].`);
  }

  let lastError = null;

  for (const p of providersToTry) {
    try {
      console.log(`[Neural Core] Analyzing ${chunk.filename} via [${p}]`);
      return await _performAnalysis(chunk, standards, p);
    } catch (err) {
      lastError = err;
      const msg = String(err.message || err).toLowerCase();
      const status = err.status || (err.response ? err.response.status : null);
      
      // Aggressive matching for ALL auth/quota errors
      const isRecoverable = 
        status === 401 || status === 402 || status === 403 || status === 429 ||
        msg.includes('quota') || 
        msg.includes('rate limit') || 
        msg.includes('credit') || 
        msg.includes('unauthorized') || 
        msg.includes('user not found') ||
        msg.includes('invalid api key') ||
        msg.includes('401') ||
        msg.includes('403') ||
        msg.includes('balance');

      if (isRecoverable && providersToTry.length > 1) {
        console.warn(`[Neural Core] Provider [${p}] rejected request: "${msg.substring(0, 50)}...". Switching focus.`);
        failedProviders.add(p);
        continue;
      }
      
      // Throw immediately if it's a structural error (e.g. malformed JSON, network failure NOT status-related)
      if (!isRecoverable) {
        console.error(`[Neural Core] Fatal Error on [${p}]:`, msg);
        throw err;
      }
    }
  }

  // --- Final "Neural Safety Net" Fallback ---
  console.warn("--- [SYSTEM PANIC] PRIMARY CORES EXHAUSTED. DEPLOYING EMERGENCY FALLBACK ---");
  
  // Only attempt fallback if OpenRouter hasn't already failed our 401/429 check
  if (process.env.OPENROUTER_API_KEY && !failedProviders.has('openrouter')) {
    try {
      const systemPrompt = `Analyze code for debt and quality. Return JSON array.`; 
      const userMessage = `File: ${chunk.filename}\nContent:\n${chunk.code}`;
      return await _performOpenRouterFreeFallback(standards, systemPrompt, userMessage);
    } catch (finalErr) {
      throw new Error(`${lastError.message} (Emergency Logic also collapsed)`);
    }
  }

  throw new Error(lastError ? lastError.message : "Infrastructure Collapse: All configured AI providers are non-responsive.");
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
