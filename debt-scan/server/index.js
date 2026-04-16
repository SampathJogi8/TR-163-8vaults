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

app.get('/api/health', (req, res) => {
  res.json({ message: "DebtScan API is running!", status: "healthy", environment: "vercel" });
});

app.post('/api/analyze', async (req, res) => {
  const { type, url, zipBase64, language: forcedLang, standards, provider } = req.body;
  const scanId = uuidv4();
  const repoDir = path.join(TEMP_BASE_DIR, scanId);

  // Initialize in Supabase instead of memory
  await supabase.from('scans').insert([{
    id: scanId,
    status: 'processing',
    progress: 5,
    message: 'Initializing environment...',
    repo_url: type === 'github' ? url : 'Uploaded ZIP'
  }]);

  res.json({ scanId, status: 'processing' });

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
    }

    await updateScan(scanId, 25, 'Calculating structural metrics...');
    const allFiles = await walk(repoDir);
    
    let processedFiles = [];
    let totalLines = 0;
    for (const f of allFiles) {
      const content = await fs.readFile(f, 'utf-8');
      const lines = content.split('\n').length;
      processedFiles.push({ path: f, content, lines });
      totalLines += lines;
    }

    // Limit analysis on Vercel to stay within standard limits
    if (totalLines > 10000) {
      processedFiles.sort((a, b) => b.lines - a.lines);
      processedFiles = processedFiles.slice(0, 15);
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

    await updateScan(scanId, 40, 'Generating neural audit...');
    const issues = await analyzeAllChunks(chunks, standards, provider, async (prog) => {
      await updateScan(scanId, 40 + Math.floor(prog * 0.5), `Analyzing chunks: ${prog}%`);
    });

    await updateScan(scanId, 95, 'Finalizing report...');
    
    const uniqueIssues = [];
    const seen = new Set();
    for (const issue of issues) {
      const key = `${issue.file}-${issue.line}-${issue.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueIssues.push(issue);
      }
    }

    fileDataList.forEach(file => {
      const fileIssues = uniqueIssues.filter(i => i.file === file.path);
      file.rawScore = computeFileScore(fileIssues);
      file.issueCount = fileIssues.length;
    });

    const normalizedFiles = normalizeScores(fileDataList);
    const stats = computeRepoStats(normalizedFiles, uniqueIssues);

    await supabase.from('scans').update({
      status: 'complete',
      progress: 100,
      message: 'Audit complete',
      overall_score: stats.overallScore,
      results: {
        overallScore: stats.overallScore,
        files: normalizedFiles,
        issues: uniqueIssues,
        stats: stats
      }
    }).eq('id', scanId);

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
  const { data, error } = await supabase.from('scans').select('results').eq('id', req.params.scanId).single();
  if (error || !data || !data.results) return res.status(404).json({ error: 'Results not ready' });
  res.json(data.results);
});

async function updateScan(id, progress, message) {
  await supabase.from('scans').update({ progress, message }).eq('id', id);
}

module.exports = app;
