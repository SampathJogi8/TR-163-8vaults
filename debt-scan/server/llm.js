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
    'google/gemma-3-27b-it:free',
    'google/gemma-4-31b-it:free',
    'qwen/qwen3-coder:free',
    'meta-llama/llama-4-maverick:free',
    'google/gemma-3-12b-it:free',
    'mistralai/ministral-8b:free',
  ];
  
  let lastFallbackErr = null;
  for (const model of freeModels) {
    try {
      console.log(`[Analyzer] Trying free fallback model: ${model}`);
      const response = await openrouter.chat.completions.create({
        model: model,
        max_tokens: 1000,  // Free tier cap
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      });
      const content = response.choices[0].message.content;
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
      const issues = JSON.parse(jsonStr || '[]');
      console.log(`[Analyzer] Free fallback succeeded via ${model}`);
      return issues.map(i => ({ ...i, model_used: 'openrouter-free' }));
    } catch (fallbackErr) {
      console.warn(`[Analyzer] Free model ${model} failed: ${fallbackErr.message}`);
      lastFallbackErr = fallbackErr;
    }
  }
  return []; // All free models exhausted
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
    // Use free models first, then fall back to paid if credits exist
    const freeModels = [
      'google/gemma-3-27b-it:free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-4-maverick:free',
      'mistralai/ministral-8b:free',
    ];
    let lastOpenRouterErr = null;
    for (const model of freeModels) {
      try {
        const response = await openrouter.chat.completions.create({
          model: model,
          max_tokens: 1000,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
        });
        const content = response.choices[0].message.content;
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        if (!jsonStr) throw new Error('No JSON found in OpenRouter response');
        const issues = JSON.parse(jsonStr);
        console.log(`[Analyzer] OpenRouter succeeded via ${model}`);
        return issues;
      } catch (err) {
        console.warn(`[Analyzer] OpenRouter model ${model} failed: ${err.message}`);
        lastOpenRouterErr = err;
      }
    }
    throw lastOpenRouterErr || new Error('All OpenRouter free models failed');
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

// Local heuristic analysis when ALL APIs fail
// Generates real findings purely from AST metrics — no API key required.
function _localHeuristicFallback(chunk) {
  const issues = [];
  const m = chunk.metrics || {};
  const uid = () => `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

  // High cyclomatic complexity
  if (m.complexity > 15) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Major', category: 'TechnicalDebt',
      title: 'Very high cyclomatic complexity',
      description: `This module has a cyclomatic complexity of ${m.complexity}, well above the recommended threshold of 10. It will be difficult to test and maintain.`,
      fix: 'Break the module into smaller, single-responsibility functions. Extract nested conditionals into well-named helper functions.',
      model_used: 'local-parser',
    });
  } else if (m.complexity > 10) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Minor', category: 'TechnicalDebt',
      title: 'Elevated cyclomatic complexity',
      description: `Cyclomatic complexity is ${m.complexity}. Exceeds the healthy threshold of 10, increasing maintenance cost.`,
      fix: 'Simplify conditional logic and extract reusable functions to reduce branching paths.',
      model_used: 'local-parser',
    });
  }

  // Large file
  if (m.lineCount > 500) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Major', category: 'TechnicalDebt',
      title: 'Oversized module',
      description: `File has ${m.lineCount} lines. Modules over 300–400 lines are harder to review, test, and navigate.`,
      fix: 'Split into smaller, focused modules. Group related functions and export them from an index file.',
      model_used: 'local-parser',
    });
  } else if (m.lineCount > 300) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Minor', category: 'CodeSmell',
      title: 'Large file — consider splitting',
      description: `File has ${m.lineCount} lines, approaching the upper limit where readability suffers.`,
      fix: 'Consider extracting utility functions or grouping related logic into separate files.',
      model_used: 'local-parser',
    });
  }

  // Too many functions in one file
  if (m.functionCount > 20) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Minor', category: 'TechnicalDebt',
      title: 'Too many functions in one module',
      description: `${m.functionCount} functions detected in a single file. This is a strong signal of missing abstraction layers.`,
      fix: 'Apply the Single Responsibility Principle. Group related functions and move them to dedicated modules.',
      model_used: 'local-parser',
    });
  }

  // High import count
  if (m.importCount > 15) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Minor', category: 'CodeSmell',
      title: 'High number of dependencies',
      description: `${m.importCount} imports detected. A large number of dependencies increases coupling and bundle size.`,
      fix: 'Review each dependency — remove unused imports and consider consolidating related utilities.',
      model_used: 'local-parser',
    });
  }

  // Unparseable file
  if (m.isUnparseable) {
    issues.push({
      id: uid(), file: chunk.filename, line: 1,
      severity: 'Critical', category: 'TechnicalDebt',
      title: 'File failed to parse',
      description: 'The parser could not build an AST for this file due to severe syntax errors or corrupted content. No AI analysis was possible.',
      fix: 'Restore the file from version control or fix the syntax errors manually before re-running the audit.',
      model_used: 'local-parser',
    });
  }

  // If nothing flagged, add a generic note
  if (issues.length === 0) {
    issues.push({
      id: uid(), file: chunk.filename, line: null,
      severity: 'Minor', category: 'TechnicalDebt',
      title: 'Static metrics within acceptable range',
      description: 'No structural red flags detected by local parser. AI-based analysis was unavailable — results may be incomplete.',
      fix: 'Re-run the scan with a valid API key to get full AI-assisted issue detection.',
      model_used: 'local-parser',
    });
  }

  console.log(`[Analyzer] Local heuristic generated ${issues.length} issue(s) for ${chunk.filename}`);
  return issues;
}

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
        const issues = await _performAnalysis(chunk, standards, p);
        if (Array.isArray(issues)) {
          return issues.map(i => ({ ...i, model_used: p }));
        }
        return issues;
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
        fix: "Perform a structural audit of the file content. Check for non-printable characters or mismatched bracket hierarchies.",
        model_used: "local-parser"
     }];
  }
  // --- Emergency: OpenRouter free models ---
  if (process.env.OPENROUTER_API_KEY && !failedProviders.has('openrouter')) {
    try {
      rotationLogs.push('Entering emergency free-model fallback via OpenRouter');
      const shortPrompt = `You are a code reviewer. Analyze this code chunk and return a JSON array of code quality issues. Each issue: {"id":"uuid","file":"filename","line":1,"severity":"Minor","category":"CodeSmell","title":"short","description":"1 sentence","fix":"suggestion"}. Return ONLY valid JSON array.`;
      const shortMsg = `File: ${chunk.filename}\n\n${chunk.code.substring(0, 1500)}`;
      const freeResult = await _performOpenRouterFreeFallback(standards, shortPrompt, shortMsg);
      if (freeResult && freeResult.length > 0) return freeResult;
    } catch (finalErr) {
      rotationLogs.push(`OpenRouter emergency failed: ${finalErr.message}`);
    }
  }

  // --- Absolute last resort: local heuristic analysis ---
  console.warn('[Analyzer] All APIs exhausted. Running local heuristic analysis.');
  return _localHeuristicFallback(chunk);
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
