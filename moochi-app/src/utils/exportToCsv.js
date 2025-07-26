// src/utils/exportToCsv.js

export function exportToCsv(filename, selectedQuestion, optionSummary) {
    if (!optionSummary || optionSummary.length === 0) return;
  
    let csv = `${selectedQuestion},Count,Percent\n`;
  
    optionSummary.forEach(item => {
      csv += `"${item.answer}",${item.count},${item.percent}%\n`;
      if (item.sub && item.sub.length > 0) {
        item.sub.forEach(sub => {
          csv += `"↳ ${sub.label}",${sub.count},${sub.percent}%\n`;
        });
      }
    });
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  