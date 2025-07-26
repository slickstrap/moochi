// src/utils/exportAuditAnswersToCsv.js
import { supabase } from '../supabaseClient';

export async function exportAuditAnswersToCsv(fromDate, toDate, auditType) {
  let query = supabase.from('audit_answers').select('*');

  if (fromDate) query = query.gte('call_date', fromDate);
  if (toDate) query = query.lte('call_date', toDate);
  if (auditType && auditType !== 'All') query = query.eq('analysis_type', auditType);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    alert('No data found or failed to fetch audit answers.');
    return;
  }

  // Group answers by contact_id and call_date
  const grouped = {};
  data.forEach(({ contact_id, call_date, question_title, answer, sub_demand }) => {
    const key = `${contact_id}|${call_date}`;
    if (!grouped[key]) {
      grouped[key] = {
        contact_id,
        call_date,
        sub_demand,
        answers: {}
      };
    }
    grouped[key].answers[question_title] = answer;
  });

  // Collect unique questions for columns
  const allQuestions = Array.from(
    new Set(data.map(row => row.question_title))
  );

  // Build CSV
  const headers = ['contact_id', 'call_date', ...allQuestions];
  let csv = headers.join(',') + '\n';

  Object.values(grouped).forEach(row => {
    const values = [row.contact_id, row.call_date];
    allQuestions.forEach(q => {
      values.push(`"${row.answers[q] || ''}"`);
    });
    csv += values.join(',') + '\n';
  });

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `audit_export_${Date.now()}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
