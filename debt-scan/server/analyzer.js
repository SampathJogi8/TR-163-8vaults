const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const parser = require('@babel/parser');
const crypto = require('crypto');

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', 'vendor'];
const SUPPORTED_EXTENSIONS = ['.py', '.js', '.ts', '.java'];

async function walk(dir, fileList = []) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        await walk(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function chunkFile(content, filename, language) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = [];
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    currentChunk.push(lines[i]);
    
    // Simple boundary detection: if line ends with } and we are over 100 lines, chunk it
    // Or if we strictly hit 120 lines
    const isOverSoftLimit = currentChunk.length >= 100 && lines[i].trim().endsWith('}');
    const isHardLimit = currentChunk.length >= 120;

    if (isOverSoftLimit || isHardLimit || i === lines.length - 1) {
      chunks.push({
        filename,
        language,
        startLine,
        endLine: i + 1,
        code: currentChunk.join('\n')
      });
      currentChunk = [];
      startLine = i + 2;
    }
  }
  return chunks;
}

function getJSMetrics(content) {
  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'classProperties', 'decorators-legacy']
    });
    
    let functionCount = 0;
    const traverse = (node) => {
      if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ClassMethod'].includes(node.type)) {
        functionCount++;
      }
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };
    traverse(ast);
    return { functionCount };
  } catch (e) {
    return { functionCount: (content.match(/function|=>/g) || []).length };
  }
}

function getPythonJavaMetrics(filePath, language) {
  const scriptPath = language === 'python' ? 'parsers/python_parser.py' : 'parsers/java_parser.py';
  try {
    const output = execSync(`python3 "${path.join(__dirname, scriptPath)}" "${filePath}"`).toString();
    return JSON.parse(output);
  } catch (e) {
    console.warn(`System python3 not available for ${language}. Using heuristic fallback.`);
    // Heuristic fallback for when python3 is missing (common on serverless)
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    return {
      functionCount: (content.match(/def\s+\w+|public\s+\w+|private\s+\w+/g) || []).length,
      maxNesting: Math.max(...lines.map(l => (l.match(/^\s*/)[0].length / 4)), 0)
    };
  }
}

function computeMetrics(filePath, content) {
  const ext = path.extname(filePath);
  const lineCount = content.split('\n').length;
  
  // Max nesting depth (simplified: max indent levels)
  const nestingLevels = content.split('\n').map(l => {
    const match = l.match(/^(\s*)/);
    return match ? Math.floor(match[0].length / 2) : 0;
  });
  const maxNesting = Math.max(...nestingLevels, 0);

  let metrics = { lineCount, maxNesting };

  if (ext === '.js' || ext === '.ts') {
    Object.assign(metrics, getJSMetrics(content));
  } else if (ext === '.py') {
    Object.assign(metrics, getPythonJavaMetrics(filePath, 'python'));
  } else if (ext === '.java') {
    Object.assign(metrics, getPythonJavaMetrics(filePath, 'java'));
  }

  // Duplication score: hash 6-line windows
  const lines = content.split('\n');
  const windowHashes = {};
  let duplicateWindows = 0;
  for (let i = 0; i < lines.length - 5; i++) {
    const window = lines.slice(i, i + 6).join('\n').trim();
    if (window.length < 20) continue; // Ignore very short windows
    const hash = crypto.createHash('md5').update(window).digest('hex');
    if (windowHashes[hash]) {
      duplicateWindows++;
    } else {
      windowHashes[hash] = true;
    }
  }
  metrics.duplicationScore = duplicateWindows;

  return metrics;
}

module.exports = { walk, chunkFile, computeMetrics };
