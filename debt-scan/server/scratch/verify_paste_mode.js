const axios = require('axios');

async function testPasteMode() {
  const codeSnippet = `
function handleData(data) {
  // Vulnerable to division by zero
  const ratio = 100 / data.value;
  
  // Logic smell: hardcoded secret
  const apiKey = "sk-1234567890abcdef";
  
  return ratio;
}
  `;

  console.log('--- [Neural Paste] Verification Protocol ---');
  try {
    const res = await axios.post('http://localhost:3001/api/analyze', {
      type: 'paste',
      pastedCode: codeSnippet,
      provider: 'auto',
      language: 'javascript'
    });

    const { scanId } = res.data;
    console.log(`✅ Scan Initialized: ${scanId}`);

    // Poll for completion
    let status = 'processing';
    while (status === 'processing') {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await axios.get(`http://localhost:3001/api/scan/${scanId}/status`);
      status = statusRes.data.status;
      console.log(`   Progress: ${statusRes.data.progress}% - ${statusRes.data.message}`);
    }

    if (status === 'complete') {
      const resultRes = await axios.get(`http://localhost:3001/api/scan/${scanId}/results`);
      console.log('✅ Audit Complete!');
      console.log(`   Score: ${resultRes.data.overallScore}%`);
      console.log(`   Issues Found: ${resultRes.data.issues.length}`);
      resultRes.data.issues.forEach(i => {
        console.log(`   - [${i.severity}] ${i.title}: ${i.description}`);
      });
    } else {
      console.log('❌ Audit failed or errored.');
    }

  } catch (err) {
    console.error('❌ Verification Failed:', err.message);
  }
}

testPasteMode();
