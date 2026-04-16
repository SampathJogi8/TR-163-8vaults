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
if (!process.env.XAI_API_KEY) {
  console.warn('WARNING: XAI_API_KEY is missing from environment.');
}

console.log('Code Analysis Engine initializing with:', {
  gemini: !!process.env.GEMINI_API_KEY,
  deepseek: !!process.env.DEEPSEEK_API_KEY,
  grok: !!process.env.XAI_API_KEY,
  openai: !!process.env.OPENAI_API_KEY
});

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

const grok = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY || 'dummy-key',
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
You are an elite Security Auditor and Static Analysis Expert.
Your job is to analyze the provided code chunk and return a JSON array of issues.

CRITICAL DIRECTIVE:
If the code appears corrupted, obfuscated, contains binary junk, or has severe syntax errors (Structural Integrity: COMPROMISED), you MUST flag this as at least one 'Critical' issue with category 'Security' or 'TechnicalDebt'. Explain that the file is structurally compromised.

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

Return ONLY a valid JSON array. If no legitimate issues are found AND structural integrity is Valid, return [].
`;

  const integrityStatus = chunk.metrics?.isUnparseable ? 'COMPROMISED (Severe Syntax/Parser Errors Detected)' : 'Valid';
  const userMessage = `
Filename: ${chunk.filename}
Language: ${chunk.language}
Structural Integrity: ${integrityStatus}
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
      try {
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        if (!jsonStr) throw new Error("No JSON array found in response");
        return JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error(`[Analyzer] JSON Parse Failure on Anthropic. Content snippet: ${content.substring(0, 100)}...`);
        throw new Error(`Invalid JSON Payload: ${parseErr.message}`);
      }
    } catch (err) {
      throw err;
    }
  } else if (provider === 'gemini') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
      const prompt = `${systemPrompt}\n\n${userMessage}`;
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      try {
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        if (!jsonStr) throw new Error("No JSON array found in response");
        return JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error(`[Analyzer] JSON Parse Failure on Gemini. Content snippet: ${content.substring(0, 100)}...`);
        throw new Error(`Invalid JSON Payload: ${parseErr.message}`);
      }
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
  } else if (provider === 'grok') {
    try {
      const response = await grok.chat.completions.create({
        model: "grok-3",
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
      try {
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        if (!jsonStr) throw new Error("No JSON found in OpenRouter response");
        return JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error(`[Analyzer] JSON Parse Failure on OpenRouter. Content: ${content.substring(0, 100)}`);
        throw new Error(`Invalid JSON Payload: ${parseErr.message}`);
      }
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
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    grok: !!process.env.XAI_API_KEY
  };

  if (requested === 'auto') {
    // Priority shift: Gemini + DeepSeek + Grok for absolute resilience
    return ['gemini', 'deepseek', 'grok', 'openrouter', 'anthropic', 'openai'].filter(p => config[p]);
  }
  return config[requested] ? [requested] : [];
};

async function analyzeChunk(chunk, standards = '', provider = 'auto') {
  const providersToTry = getAvailableProviders(provider);
  const failedProviders = new Set();
  const rotationLogs = [];
  
  if (providersToTry.length === 0) {
    rotationLogs.push(`Infrastructure Crisis: No API keys configured for ${provider}`);
  }

  let lastError = null;

  for (const p of providersToTry) {
    let retries = 0;
    while (retries <= 3) {
      try {
        console.log(`[Analyzer] Processing ${chunk.filename} via [${p}] (Attempt ${retries + 1})`);
        return await _performAnalysis(chunk, standards, p);
      } catch (err) {
        lastError = err;
        const msg = String(err.message || err).toLowerCase();
        const status = err.status || (err.response ? err.response.status : null);
        const is429 = status === 429 || msg.includes('429') || msg.includes('rate limit');
        
        if (is429 && retries < 3) {
          retries++;
          console.warn(`[Analyzer] Rate limit on [${p}]. Backing off for ${retries * 5}s before retry...`);
          await new Promise(r => setTimeout(r, 5000 * retries));
          continue; // Re-attempt same provider
        }
        break; // Exit retry loop, proceed to rotation
      }
    }

    const err = lastError;
    const msg = String(err.message || err).toLowerCase();
    const status = err.status || (err.response ? err.response.status : null);
    
    const isRecoverable = status === 401 || status === 402 || status === 403 || status === 400 ||
      msg.includes('quota') || msg.includes('credit') || msg.includes('unauthorized') || 
      msg.includes('user not found') || msg.includes('invalid api key') || msg.includes('balance') ||
      msg.includes('model not found') || msg.includes('invalid model') || msg.includes('429');

    rotationLogs.push(`${p}: ${msg.substring(0, 100)}`);

    if (isRecoverable && providersToTry.length > 1) {
      console.warn(`[Analyzer] Provider [${p}] fallback initiated. Rotating...`);
      failedProviders.add(p);
      continue;
    }
      
      if (!isRecoverable) {
        // LOCAL FALLBACK: If structural integrity is compromised, we can return a local finding
        if (chunk.metrics?.isUnparseable) {
          console.warn(`[Analyzer] Fatal on [${p}] but structural integrity is COMPROMISED. Using local diagnostic.`);
          return [{
            id: `local-fail-${Date.now()}`,
            file: chunk.filename,
            line: 1,
            severity: "Critical",
            category: "TechnicalDebt",
            title: "Syntax Error",
            description: "The source module is structurally unparseable (Possible binary junk, obfuscation, or extreme syntax failure). Manual review REQUIRED.",
            fix: "Verify file encoding and restore from known-good source state. Ensure the file is not corrupted binary data incorrectly labeled with a source extension."
          }];
        }
        console.error(`[Analyzer] Fatal Error on [${p}]:`, msg);
        throw err;
      }
    }

  // --- Final "Neural Safety Net" Fallback ---
  if (chunk.metrics?.isUnparseable) {
     console.warn(`[Analyzer] Primary cores exhausted but file is compromised. Forcing local finding.`);
     return [{
        id: `local-fallback-${Date.now()}`,
        file: chunk.filename,
        line: 1,
        severity: "Critical",
        category: "TechnicalDebt",
        title: "Parser Failure",
        description: "The file could not be parsed due to severe syntax errors or corrupted data. Static analysis cannot proceed for this module.",
        fix: "Perform a structural audit of the file content. Check for non-printable characters or mismatched bracket hierarchies."
     }];
  }
  console.warn("--- [CRITICAL] ALL API PROVIDERS FAILED ---");
  
  if (process.env.OPENROUTER_API_KEY && !failedProviders.has('openrouter')) {
    try {
      rotationLogs.push("Entering Free model fallback via OpenRouter");
      const systemPrompt = `Analyze code for debt and quality. Return JSON array.`; 
      const userMessage = `File: ${chunk.filename}\nContent:\n${chunk.code}`;
      return await _performOpenRouterFreeFallback(standards, systemPrompt, userMessage);
    } catch (finalErr) {
      rotationLogs.push(`Emergency Protocol failed: ${finalErr.message}`);
    }
  }

  const chainOfFailure = rotationLogs.join(" -> ");
  throw new Error(`All API requests failed. Failure Chain: ${chainOfFailure}`);
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
