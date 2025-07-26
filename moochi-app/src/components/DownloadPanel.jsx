// src/components/DownloadPanel.jsx
import React from 'react';
import { supabase } from '../supabaseClient';

function DownloadPanel({ fromDate, toDate, setFromDate, setToDate, onClose, auditType }) {
  const exportAuditData = async () => {
    try {
      let query = supabase
        .from('audit_answers')
        .select(`
          audit_id,
          question_title,
          answer,
          sub_demand,
          audits (contact_id, call_date, analysis_type)
        `);

      if (auditType && auditType !== 'All') {
        query = query.eq('audits.analysis_type', auditType);
      }
      if (fromDate) query = query.gte('audits.call_date', fromDate);
      if (toDate) query = query.lte('audits.call_date', toDate);

      const { data, error } = await query;

      if (error) {
        alert('Error fetching audit data');
        console.error(error);
        return;
      }

      // Group answers by contact_id + call_date
      const grouped = {};
      for (const row of data) {
        const { audits, question_title, answer, sub_demand } = row;
        const key = `${audits.contact_id}_${audits.call_date}`;
        if (!grouped[key]) {
          grouped[key] = {
            contact_id: audits.contact_id,
            call_date: audits.call_date,
            analysis_type: audits.analysis_type,
            answers: {},
          };
        }
        grouped[key].answers[question_title] = sub_demand
          ? `${answer} (${sub_demand})`
          : answer;
      }

      // Determine all unique question titles (for headers)
      const allQuestions = new Set();
      data.forEach(row => allQuestions.add(row.question_title));
      const questionTitles = Array.from(allQuestions).sort();

      // Build CSV content
      const headers = ['Contact ID', 'Call Date', 'Analysis Type', ...questionTitles];
      const rows = Object.values(grouped).map(entry => {
        const values = questionTitles.map(q => `"${entry.answers[q] || ''}"`);
        return [`"${entry.contact_id}"`, `"${entry.call_date}"`, `"${entry.analysis_type}"`, ...values].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'audit_export.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed.');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow mt-4 space-y-4">
      <p className="font-semibold text-lg text-white">📥 Download Full Audit Data</p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm">From:</label>
        <input
          type="date"
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-500"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label className="text-sm">To:</label>
        <input
          type="date"
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-500"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
          onClick={exportAuditData}
        >
          ✅ Export to CSV
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
          onClick={onClose}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}

export default DownloadPanel;
