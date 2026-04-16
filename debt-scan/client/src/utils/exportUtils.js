import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export const generatePDF = async (results, heatmapRef, chartRef) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Branding & Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DebtScan Audit Report', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Audit ID: ${(results.scanId || 'N/A').substring(0, 12).toUpperCase()}`, 15, 28);
  doc.text(`Timestamp: ${new Date().toLocaleString()}`, 15, 34);
  
  doc.setTextColor(150, 150, 150);
  doc.text('CLASSIFIED: INTERNAL AUDIT ONLY', pageWidth - 15, 20, { align: 'right' });

  // Summary Grid
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Neural Audit Summary', 15, 55);
  
  const summaryData = [
    ['Ecosystem Health', `${100 - results.overallScore}%`, 'Severity Totals', ''],
    ['Debt Rating', `${results.overallScore}/100`, 'Critical', results.stats.severityCounts.Critical],
    ['Files Analyzed', results.stats.filesAnalyzed, 'Major', results.stats.severityCounts.Major],
    ['Scan Duration', `${(results.durationMs / 1000).toFixed(2)}s`, 'Minor', results.stats.severityCounts.Minor]
  ];

  doc.autoTable({
    startY: 65,
    head: [['Metric', 'Value', 'Severity Type', 'Count']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] }, // Accent color
    margin: { horizontal: 15 }
  });

  // Hotspots
  let yPos = doc.lastAutoTable.finalY + 15;
  doc.text('2. Technical Debt Hotspots', 15, yPos);
  
  const hotspotData = results.files
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(f => [f.path, f.score, f.issueCount, f.lineCount]);

  doc.autoTable({
    startY: yPos + 8,
    head: [['Module Path', 'Risk Score', 'Issues', 'Lines']],
    body: hotspotData,
    theme: 'striped',
    margin: { horizontal: 15 }
  });

  // Snapshots (If refs provided)
  if (heatmapRef?.current || chartRef?.current) {
    doc.addPage();
    doc.text('3. Visual Intelligence Diagnostics', 15, 20);
    
    let chartY = 30;
    
    if (heatmapRef?.current) {
      const canvas = await html2canvas(heatmapRef.current, { backgroundColor: '#050505' });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 15, chartY, imgWidth, imgHeight);
      chartY += imgHeight + 20;
    }

    if (chartRef?.current) {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#050505' });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 15, chartY, imgWidth, imgHeight);
    }
  }

  // Findings Table
  doc.addPage();
  doc.text('4. Full Audit Log & Remediation Protocols', 15, 20);
  
  const detailedFindings = results.issues.map(i => [
    i.severity.toUpperCase(),
    i.category,
    i.file,
    i.title,
    i.description
  ]);

  doc.autoTable({
    startY: 30,
    head: [['Severity', 'Category', 'File', 'Title', 'Description']],
    body: detailedFindings,
    theme: 'striped',
    headStyles: { fillColor: [10, 10, 10] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 25 },
      1: { width: 30 },
      2: { width: 35 },
      3: { fontStyle: 'bold', width: 40 },
    },
    margin: { horizontal: 15 }
  });

  // Page numbering
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`DebtScan_Full_Audit_${(results.scanId || 'export').substring(0, 8)}.pdf`);
};

export const generateXLS = (results) => {
  const wb = XLSX.utils.book_new();

  // Tab 1: Executive Overview
  const overviewData = [
    ['DebtScan Audit Intelligence Report'],
    ['Scan ID', results.scanId],
    ['Timestamp', new Date().toLocaleString()],
    [''],
    ['Key Performance Metrics'],
    ['Overall Ecosystem Health', `${100 - results.overallScore}%`],
    ['Neural Debt Rating', results.overallScore],
    ['Total Issues Found', results.stats.totalIssues],
    ['Scan Duration', `${(results.durationMs / 1000).toFixed(2)}s`],
    [''],
    ['Severity Breakdown'],
    ['Critical', results.stats.severityCounts.Critical],
    ['Major', results.stats.severityCounts.Major],
    ['Minor', results.stats.severityCounts.Minor]
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Executive Overview');

  // Tab 2: Module Health Index
  const moduleHeaders = [['Module Path', 'Risk Score', 'Issue Count', 'Line Count', 'Max Nesting', 'Duplication Windows']];
  const moduleRows = results.files.map(f => [
    f.path,
    f.score,
    f.issueCount,
    f.lineCount,
    f.metrics.maxNesting,
    f.metrics.duplicationScore
  ]);
  const wsModules = XLSX.utils.aoa_to_sheet([...moduleHeaders, ...moduleRows]);
  XLSX.utils.book_append_sheet(wb, wsModules, 'Module Health');

  // Tab 3: Detailed Findings
  const findingsHeaders = [['Severity', 'Category', 'File', 'Line', 'Title', 'Issue Description', 'Remediation Protocol']];
  const findingsRows = results.issues.map(i => [
    i.severity,
    i.category,
    i.file,
    i.line || 'N/A',
    i.title,
    i.description,
    i.fix
  ]);
  const wsFindings = XLSX.utils.aoa_to_sheet([...findingsHeaders, ...findingsRows]);
  XLSX.utils.book_append_sheet(wb, wsFindings, 'Detailed Findings');

  XLSX.writeFile(wb, `DebtScan_Spreadsheet_Audit_${(results.scanId || 'export').substring(0, 8)}.xlsx`);
};

export const generateJSON = (results) => {
    const reportData = {
      auditTimestamp: new Date().toISOString(),
      summary: results.stats,
      overallScore: 100 - results.overallScore,
      duration: `${(results.durationMs / 1000).toFixed(2)}s`,
      files: results.files,
      findings: results.issues
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DebtScan_Raw_Audit_${(results.scanId || 'export').substring(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
