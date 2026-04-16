const path = require('path');
const dotenv = require('dotenv');

// Load environment variables as early as possible
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');
const unzipper = require('unzipper');
const fs = require('fs-extra');

const { walk, chunkFile, computeMetrics } = require('./analyzer');
const { analyzeAllChunks } = require('./llm');
const { computeFileScore, normalizeScores, computeRepoStats } = require('./scorer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;
const TEMP_BASE_DIR = path.join(__dirname, 'tmp');
fs.ensureDirSync(TEMP_BASE_DIR);

// In-memory store for scans
// { scanId: { status, progress, message, results, startTime } }
const scans = new Map();

app.get('/', (req, res) => {
  res.json({ message: "DebtScan API is running!", status: "healthy" });
});

app.post('/api/analyze', async (req, res) => {
  console.log('Received analysis request:', { ...req.body, zipBase64: req.body.zipBase64 ? '[REDACTED]' : undefined });
  const { type, url, zipBase64, language: forcedLang, standards, provider } = req.body;
  const scanId = uuidv4();
  const repoDir = path.join(TEMP_BASE_DIR, scanId);

  scans.set(scanId, {
    status: 'processing',
    progress: 0,
    message: 'Initializing...',
    startTime: Date.now()
  });

  res.json({ scanId, status: 'processing' });

  // Background analysis
  (async () => {
    try {
      await fs.ensureDir(repoDir);

      if (type === 'github') {
        updateScan(scanId, 5, 'Cloning repository...');
        try {
          await simpleGit().clone(url, repoDir, ['--depth', '1']);
        } catch (err) {
          throw new Error('Repository not found or private. Only public repos supported.');
        }
      } else if (type === 'zip') {
        updateScan(scanId, 5, 'Unzipping files...');
        const buffer = Buffer.from(zipBase64, 'base64');
        await fs.writeFile(path.join(TEMP_BASE_DIR, `${scanId}.zip`), buffer);
        await fs.createReadStream(path.join(TEMP_BASE_DIR, `${scanId}.zip`))
          .pipe(unzipper.Extract({ path: repoDir }))
          .promise();
      }

      updateScan(scanId, 15, 'Parsing files...');
      const allFiles = await walk(repoDir);
      
      // Filter and limit to top 20 by line count if > 10,000 lines total
      let processedFiles = [];
      let totalLines = 0;
      for (const f of allFiles) {
        const content = await fs.readFile(f, 'utf-8');
        const lines = content.split('\n').length;
        processedFiles.push({ path: f, content, lines });
        totalLines += lines;
      }

      if (totalLines > 10000) {
        processedFiles.sort((a, b) => b.lines - a.lines);
        processedFiles = processedFiles.slice(0, 20);
      }

      const chunks = [];
      const fileDataList = [];

      for (const fileObj of processedFiles) {
        const relativePath = path.relative(repoDir, fileObj.path);
        const language = forcedLang || detectLanguage(fileObj.path);
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

      updateScan(scanId, 30, 'Running LLM analysis...');
      const issues = await analyzeAllChunks(chunks, standards, provider, (prog) => {
        updateScan(scanId, 30 + Math.floor(prog * 0.6), `Analyzing chunks: ${prog}%`);
      });

      // Post-processing
      updateScan(scanId, 95, 'Finalizing report...');
      
      // Deduplicate issues by (file + line + title)
      const uniqueIssues = [];
      const seen = new Set();
      for (const issue of issues) {
        const key = `${issue.file}-${issue.line}-${issue.title}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueIssues.push(issue);
        }
      }

      // Compute scores
      fileDataList.forEach(file => {
        const fileIssues = uniqueIssues.filter(i => i.file === file.path);
        file.rawScore = computeFileScore(fileIssues);
        file.issueCount = fileIssues.length;
      });

      const normalizedFiles = normalizeScores(fileDataList);
      const stats = computeRepoStats(normalizedFiles, uniqueIssues);
      const durationMs = Date.now() - scans.get(scanId).startTime;

      scans.set(scanId, {
        status: 'complete',
        progress: 100,
        message: 'Analysis complete',
        results: {
          overallScore: stats.overallScore,
          files: normalizedFiles,
          issues: uniqueIssues,
          stats: stats,
          durationMs
        }
      });

    } catch (err) {
      console.error(err);
      scans.set(scanId, {
        status: 'error',
        message: err.message,
        progress: 0
      });
    } finally {
      // Cleanup happens via periodic scheduler or explicit DELETE
    }
  })();
});

app.get('/api/scan/:scanId/status', (req, res) => {
  const scan = scans.get(req.params.scanId);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json({ status: scan.status, progress: scan.progress, message: scan.message });
});

app.get('/api/scan/:scanId/results', (req, res) => {
  const scan = scans.get(req.params.scanId);
  if (!scan || scan.status !== 'complete') return res.status(404).json({ error: 'Results not ready' });
  res.json(scan.results);
});

app.delete('/api/scan/:scanId', async (req, res) => {
  const scanId = req.params.scanId;
  scans.delete(scanId);
  const repoDir = path.join(TEMP_BASE_DIR, scanId);
  const zipPath = path.join(TEMP_BASE_DIR, `${scanId}.zip`);
  await fs.remove(repoDir).catch(() => {});
  await fs.remove(zipPath).catch(() => {});
  res.json({ success: true });
});

function updateScan(id, progress, message) {
  const scan = scans.get(id);
  if (scan) {
    scan.progress = progress;
    scan.message = message;
  }
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.py') return 'python';
  if (ext === '.js' || ext === '.ts') return 'javascript';
  if (ext === '.java') return 'java';
  return 'javascript';
}

// Cleanup task: remove scans older than 10 mins
setInterval(async () => {
  const now = Date.now();
  for (const [id, scan] of scans.entries()) {
    if (now - scan.startTime > 10 * 60 * 1000) {
      scans.delete(id);
      await fs.remove(path.join(TEMP_BASE_DIR, id)).catch(() => {});
      await fs.remove(path.join(TEMP_BASE_DIR, `${id}.zip`)).catch(() => {});
    }
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
