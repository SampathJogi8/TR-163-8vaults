const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const { supabase } = require('./supabaseClient');

const { walk, chunkFile, computeMetrics } = require('./analyzer');
const { analyzeAllChunks } = require('./llm');
const { computeFileScore, normalizeScores, computeRepoStats } = require('./scorer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Vercel only allows writing to /tmp
const TEMP_BASE_DIR = '/tmp/debtscan';
fs.ensureDirSync(TEMP_BASE_DIR);

/**
 * SHIELD: Selects the most critical files for audit based on heuristics
 * rather than simple line-count capping.
 */
function selectPriorityFiles(allFiles, maxLines = 15000, maxFiles = 40) {
  const priorityKeywords = ['auth', 'security', 'config', 'api', 'route', 'controller', 'model', 'util'];
  
  const mapped = allFiles.map(f => {
    const name = path.basename(f).toLowerCase();
    let weight = 0;
    if (priorityKeywords.some(kw => name.includes(kw))) weight += 10;
    if (name.endsWith('.js') || name.endsWith('.ts')) weight += 5;
    return { path: f, weight };
  });

  // Sort by weight desc, then lines desc (implied in later processing)
  return mapped.sort((a, b) => b.weight - a.weight).slice(0, maxFiles).map(m => m.path);
}

app.get('/api/health', (req, res) => {
  res.json({ message: "DebtScan API is running!", status: "healthy", environment: "vercel" });
});

app.post('/api/analyze', async (req, res) => {
  const { type, url, zipBase64, language: forcedLang, standards, provider } = req.body;
  const scanId = uuidv4();
  const repoDir = path.join(TEMP_BASE_DIR, scanId);
  const startTime = Date.now();
  console.log(`Starting scan ${scanId} for ${url || 'ZIP'}`);

  try {
    const { error: insertError } = await supabase.from('scans').insert([{
      id: scanId,
      status: 'processing',
      progress: 5,
      message: 'Initializing environment...',
      repo_url: type === 'github' ? url : type === 'zip' ? 'Uploaded ZIP' : 'Pasted Code'
    }]);

    if (insertError) {
      console.error(`[DB Error] Insert failed:`, insertError);
      return res.status(500).json({ error: `Database initialization failed: ${insertError.message}` });
    }

    res.json({ scanId, status: 'processing' });
  } catch (setupErr) {
    console.error(`[Setup Error] Critical failure:`, setupErr);
    return res.status(500).json({ error: `Server setup failure: ${setupErr.message}` });
  }

  // Background analysis logic for serverless
  // NOTE: On Vercel Hobby, this process might be killed after the response.
  // For production stability, larger repos should be processed via specialized 
  // polling or background job queues.
  try {
    await fs.ensureDir(repoDir);

    if (type === 'github') {
      await updateScan(scanId, 10, 'Cloning repository...');
      try {
        await simpleGit().clone(url, repoDir, ['--depth', '1']);
      } catch (err) {
        throw new Error('Repository clone failed. Ensure repository is public.');
      }
    } else if (type === 'zip') {
      await updateScan(scanId, 10, 'Unzipping files...');
      const buffer = Buffer.from(zipBase64, 'base64');
      const zipFile = path.join(TEMP_BASE_DIR, `${scanId}.zip`);
      await fs.writeFile(zipFile, buffer);
      await fs.createReadStream(zipFile)
        .pipe(unzipper.Extract({ path: repoDir }))
        .promise();
    } else if (type === 'paste') {
      await updateScan(scanId, 10, 'Processing code buffer...');
      const { pastedCode } = req.body;
      const ext = forcedLang === 'python' ? '.py' : forcedLang === 'java' ? '.java' : '.js';
      const filepath = path.join(repoDir, `pasted_module${ext}`);
      await fs.writeFile(filepath, pastedCode);
    }

    await updateScan(scanId, 25, 'Calculating structural metrics...');
    const allFiles = await walk(repoDir);
    
    // SCALE: Use priority selection instead of hard 15-file slice
    const prioritizedPaths = selectPriorityFiles(allFiles);
    
    let processedFiles = [];
    let totalLines = 0;
    for (const f of prioritizedPaths) {
      const content = await fs.readFile(f, 'utf-8');
      const lines = content.split('\n').length;
      processedFiles.push({ path: f, content, lines });
      totalLines += lines;
      
      // Safety ceiling to prevent Vercel timeout/OOM
      if (totalLines > 20000) break;
    }

    const chunks = [];
    const fileDataList = [];

    for (const fileObj of processedFiles) {
      const relativePath = path.relative(repoDir, fileObj.path);
      const language = forcedLang || (relativePath.endsWith('.py') ? 'python' : relativePath.endsWith('.java') ? 'java' : 'javascript');
      const metrics = computeMetrics(fileObj.path, fileObj.content);
      
      fileDataList.push({
        path: relativePath,
        lineCount: fileObj.lines,
        metrics,
        rawScore: 0
      });

      const fileChunks = chunkFile(fileObj.content, relativePath, language);
      fileChunks.forEach(c => c.metrics = metrics);
      chunks.push(...fileChunks);
    }

    await updateScan(scanId, 40, 'Starting AI analysis...');
    const issues = await analyzeAllChunks(chunks, standards, provider,
      async (prog) => {
        await updateScan(scanId, 40 + Math.floor(prog * 0.5), `Analyzing: ${prog}%`);
      },
      async (providerName, event) => {
        // event: 'start' | 'rotate' | 'fallback'
        const msgs = {
          start:    `provider:${providerName}:Scanning with ${providerName}`,
          rotate:   `provider:${providerName}:Switched to ${providerName}`,
          fallback: `provider:${providerName}:Fallback → ${providerName}`,
        };
        await updateScan(scanId, null, msgs[event] || `provider:${providerName}:Using ${providerName}`);
      }
    );

    console.log(`Finalizing scan ${scanId} with ${issues.length} total issues`);
    await updateScan(scanId, 95, 'Finalizing report...');
    
    // Safety check for empty or malformed issues
    const safeIssues = Array.isArray(issues) ? issues : [];
    const uniqueIssues = [];
    const seen = new Set();
    
    for (let i = 0; i < safeIssues.length; i++) {
      const issue = safeIssues[i];
      if (!issue || typeof issue !== 'object') continue;
      
      // Generate a stable unique ID if not present or to ensure system-wide uniqueness
      const compositeKey = `${issue.file || 'f'}-${issue.line || 0}-${issue.title || 't'}`;
      if (!seen.has(compositeKey)) {
        seen.add(compositeKey);
        uniqueIssues.push({
          ...issue,
          id: issue.id || `iss-${Buffer.from(compositeKey).toString('base64').substring(0, 12)}`
        });
      }
    }

    console.log(`Deduplicated to ${uniqueIssues.length} unique issues. Scoring files...`);

    // Prioritize and cap results to prevent DB payload errors
    const prioritizedIssues = uniqueIssues.sort((a, b) => {
      const order = { 'Critical': 0, 'Major': 1, 'Minor': 2 };
      return (order[a.severity] || 0) - (order[b.severity] || 0);
    }).slice(0, 250); // Cap at 250 most important issues

    if (uniqueIssues.length > 250) {
      console.log(`Truncated ${uniqueIssues.length} issues to top 250 for database stability.`);
    }

    fileDataList.forEach(file => {
      const fileIssues = uniqueIssues.filter(i => i.file === file.path);
      file.rawScore = computeFileScore(fileIssues);
      file.issueCount = fileIssues.length;
    });

    const normalizedFiles = normalizeScores(fileDataList);
    const stats = computeRepoStats(normalizedFiles, uniqueIssues);

    console.log(`Final update for scan ${scanId}...`);
    const { error: finalError } = await supabase.from('scans').update({
      status: 'complete',
      progress: 100,
      message: 'Audit complete',
      overall_score: stats.overallScore,
      files: normalizedFiles,
      issues: prioritizedIssues, // Use optimized list
      stats: stats,
      duration_ms: Date.now() - startTime
    }).eq('id', scanId);

    if (finalError) {
      throw new Error(`DB Final Update Failed: ${finalError.message}`);
    }
    console.log(`Scan ${scanId} marked complete.`);

  } catch (err) {
    console.error('Scan Error:', err.message);
    await supabase.from('scans').update({
      status: 'error',
      message: err.message,
      progress: 0
    }).eq('id', scanId);
  } finally {
    // Cleanup /tmp for this scan
    await fs.remove(repoDir).catch(() => {});
    await fs.remove(path.join(TEMP_BASE_DIR, `${scanId}.zip`)).catch(() => {});
  }
});

app.get('/api/scan/:scanId/status', async (req, res) => {
  const { data, error } = await supabase.from('scans').select('*').eq('id', req.params.scanId).single();
  if (error || !data) return res.status(404).json({ error: 'Scan not found' });
  res.json({ status: data.status, progress: data.progress, message: data.message });
});

app.get('/api/scan/:scanId/results', async (req, res) => {
  const { data, error } = await supabase.from('scans')
    .select('files, issues, stats, overall_score, duration_ms')
    .eq('id', req.params.scanId)
    .single();

  if (error || !data || !data.files) return res.status(404).json({ error: 'Results not ready' });
  res.json({
    files: data.files,
    issues: data.issues,
    stats: data.stats,
    overallScore: data.overall_score,
    durationMs: data.duration_ms || 0
  });
});

async function updateScan(id, progress, message) {
  const update = { message };
  if (progress !== null && progress !== undefined) update.progress = progress;
  await supabase.from('scans').update(update).eq('id', id);
}

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`DebtScan Server running on port ${PORT}`);
  });
}

module.exports = app;
