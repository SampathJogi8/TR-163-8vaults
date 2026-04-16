# DebtScan: Automated Code Review & Technical Debt Analyzer

DebtScan is an LLM-powered web application that analyzes codebases for code smells, security vulnerabilities, and technical debt. It provides a visual dashboard with health heatmaps, prioritized remediation reports, and specific refactoring suggestions powered by Claude AI.

## Features
- **Multi-Input Support**: Analyze public GitHub repositories or local ZIP file uploads.
- **Visual Dashboard**: Comprehensive debt scoring (0-100) with color-coded health indicators.
- **Deep Neural Analysis**: Context-aware issue detection using Claude-3.5-Sonnet.
- **Multi-Language Metrics**: Built-in support for JavaScript, TypeScript, Python, and Java.
- **Prioritized Reports**: Issues categorized by severity (Critical, Major, Minor) and type (Security, Performance, Naming, etc.).

## Prerequisites
- Node.js 18+
- Python 3.9+ (with `javalang` installed: `pip install javalang`)
- Anthropic API Key

## Setup Instructions

### 1. Clone & Install
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment
Create a `.env` file in the `server` directory:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3001
MAX_CONCURRENT_LLM_CALLS=5
```

### 3. Run the Application
In separate terminal windows:

**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
cd client
npm start
```

The app will be available at `http://localhost:3000`.

## Testing with Sample Repos
1. **GitHub URL**: Paste `https://github.com/facebook/react` (or a smaller public repo for faster results).
2. **ZIP Upload**: Compress a small project folder and upload it.
3. **Custom Standards**: Paste "Always use functional components" or "Ensure all inputs are sanitized" to see AI-driven enforcement.

## Architecture
- **Frontend**: React SPA with Tailwind CSS for high-fidelity dark mode UI.
- **Backend**: Express.js orchestrating the analysis pipeline.
- **Analysis Engine**:
  - `analyzer.js`: File walker, smart chunker, and metric extractor.
  - `llm.js`: Batch processor for Claude API calls.
  - `scorer.js`: Normalization and scoring logic.
- **Parsers**: Python-based AST analysis for Java and Python files.
