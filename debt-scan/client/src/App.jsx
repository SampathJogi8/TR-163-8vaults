import React, { useState, useEffect } from 'react';
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

  const navigateToFileDetail = (filePathOrObj) => {
    const fileObj = typeof filePathOrObj === 'string' 
      ? results.files.find(f => f.path === filePathOrObj)
      : filePathOrObj;
    
    setSelectedFile(fileObj);
    setView('detail');
    window.scrollTo(0, 0);
  };

  return (
    <div className="text-white selection:bg-purple-500/30">
      {view === 'landing' && (
        <LandingPage 
          onStartScan={handleStartScan} 
          progress={progress} 
          statusMessage={statusMessage} 
        />
      )}
      
      {view === 'dashboard' && (
        <Dashboard 
          results={results} 
          onFileClick={navigateToFileDetail}
          onNavigateToIssues={() => { setView('issues'); window.scrollTo(0, 0); }}
        />
      )}

      {view === 'issues' && (
        <IssuesList 
          issues={results.issues} 
          onBack={() => setView('dashboard')}
          onFileClick={navigateToFileDetail}
        />
      )}

      {view === 'detail' && (
        <FileDetail 
          file={selectedFile}
          issues={results.issues.filter(i => {
            if (!i?.file || !selectedFile?.path) return false;
            const issueFile = i.file.replace(/\\/g, '/');
            const targetFile = selectedFile.path.replace(/\\/g, '/');
            return targetFile.endsWith(issueFile) || issueFile.endsWith(targetFile);
          })}
          onBack={() => setView('dashboard')}
        />
      )}
    </div>
  );
};

export default App;
