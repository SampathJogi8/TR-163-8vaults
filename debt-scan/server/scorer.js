function computeFileScore(issues) {
  const weights = {
    'Critical': 25,
    'Major': 10,
    'Minor': 3
  };

  let rawScore = issues.reduce((acc, issue) => {
    return acc + (weights[issue.severity] || 0);
  }, 0);

  return Math.min(100, rawScore);
}

function normalizeScores(files) {
  if (files.length === 0) return files;
  
  const maxScore = Math.max(...files.map(f => f.rawScore), 0);
  
  return files.map(file => {
    // If we want to normalize so the worst file is 100 as per spec:
    const normalizedScore = maxScore > 0 ? Math.round((file.rawScore / maxScore) * 100) : 0;
    
    let color = 'green';
    if (normalizedScore > 60) color = 'red';
    else if (normalizedScore > 30) color = 'amber';

    return { ...file, score: normalizedScore, color };
  });
}

function computeRepoStats(files, issues) {
  const totalScore = files.reduce((acc, f) => acc + f.score, 0);
  const overallScore = files.length > 0 ? Math.round(totalScore / files.length) : 0;

  const severityCounts = {
    Critical: issues.filter(i => i.severity === 'Critical').length,
    Major: issues.filter(i => i.severity === 'Major').length,
    Minor: issues.filter(i => i.severity === 'Minor').length,
  };

  const categoryCounts = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  return {
    overallScore,
    severityCounts,
    categoryCounts,
    totalIssues: issues.length,
    filesAnalyzed: files.length
  };
}

module.exports = { computeFileScore, normalizeScores, computeRepoStats };
