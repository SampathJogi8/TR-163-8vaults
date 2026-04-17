import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from './api';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import IssuesList from './pages/IssuesList';
import FileDetail from './pages/FileDetail';

const App = () => {
  const [view, setView] = useState('landing'); // landing | dashboard | issues | detail
  const [scanId, setScanId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previousView, setPreviousView] = useState('dashboard');

  const pageTransition = {
    initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit:    { opacity: 0, y: -10, filter: 'blur(10px)' },
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  };

  useEffect(() => {
    let interval;
    if (scanId && view === 'landing') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/scan/${scanId}/status`);
          setProgress(res.data.progress);
          setStatusMessage(res.data.message);

          if (res.data.status === 'complete') {
            clearInterval(interval);
            const resultsRes = await api.get(`/api/scan/${scanId}/results`);
            setResults({ ...resultsRes.data, scanId });
            setView('dashboard');
            window.scrollTo(0, 0);
          } else if (res.data.status === 'error') {
            clearInterval(interval);
            alert('Analysis Error: ' + res.data.message);
            setScanId(null);
            // Stay on landing or redirect? For now stay.
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [scanId, view]);

  const handleStartScan = (id) => {
    setScanId(id);
    setProgress(0);
    setStatusMessage('Checking status...');
  };

  const navigateToFileDetail = (filePathOrObj, originView) => {
    const fileObj = typeof filePathOrObj === 'string' 
      ? results.files.find(f => f.path === filePathOrObj)
      : filePathOrObj;
    
    setSelectedFile(fileObj);
    setPreviousView(originView || 'dashboard');
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleIssueFeedback = (issueId, status) => {
    setResults(prev => ({
      ...prev,
      issues: (prev?.issues || []).map(i => i.id === issueId ? { ...i, feedback: status } : i)
    }));
  };

  return (
    <div className="text-white selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" {...pageTransition}>
            <LandingPage 
              onStartScan={handleStartScan} 
              progress={progress} 
              statusMessage={statusMessage} 
            />
          </motion.div>
        )}
        
        {view === 'dashboard' && (
          <motion.div key="dashboard" {...pageTransition}>
            <Dashboard 
              results={results} 
              onFileClick={(file) => navigateToFileDetail(file, 'dashboard')}
              onNavigateToIssues={() => { setView('issues'); window.scrollTo(0, 0); }}
              onNewScan={() => { setResults(null); setScanId(null); setView('landing'); window.scrollTo(0, 0); }}
            />
          </motion.div>
        )}

        {view === 'issues' && (
          <motion.div key="issues" {...pageTransition}>
            <IssuesList 
              issues={results.issues} 
              onBack={() => setView('dashboard')}
              onFileClick={(file) => navigateToFileDetail(file, 'issues')}
              onIssueFeedback={handleIssueFeedback}
            />
          </motion.div>
        )}

        {view === 'detail' && (
          <motion.div key="detail" {...pageTransition}>
            <FileDetail 
              file={selectedFile}
              issues={(results?.issues || []).filter(i => {
                if (!i?.file || !selectedFile?.path) return false;
                const issueFile = i.file.replace(/\\/g, '/');
                const targetFile = selectedFile.path.replace(/\\/g, '/');
                return targetFile.endsWith(issueFile) || issueFile.endsWith(targetFile);
              })}
              onBack={() => setView(previousView)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
