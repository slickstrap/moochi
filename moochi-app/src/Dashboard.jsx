// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import DownloadPanel from './components/DownloadPanel';
import StatsCard from './components/StatsCards';
import OptionBreakdown from './components/OptionBreakdownPanel';



function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState('weekly');
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalAudits, setTotalAudits] = useState(0);
  const [auditType, setAuditType] = useState('All');
  const [auditTypes, setAuditTypes] = useState([]);
  const [optionSummary, setOptionSummary] = useState([]);
  const [questionOptions, setQuestionOptions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);

  const loadAuditTypes = async () => {
    const { data, error } = await supabase.from('saved_configs').select('title, config');
    if (!error && data) {
      const titles = data.map(d => d.title);
      setAuditTypes(['All', ...titles]);

      const allOptions = [];
      data.forEach(({ title, config }) => {
        const parsed = Array.isArray(config) ? config : JSON.parse(config);
        parsed.forEach(q => {
          if (q.type === 'options') {
            allOptions.push({ analysis_type: title, question_title: q.question_title });
          }
        });
      });
      setQuestionOptions(allOptions);
    }
  };

  const loadData = async () => {
    setLoading(true);
    let groupBy = 'week_commencing';
    if (interval === 'daily') groupBy = 'call_date';
    if (interval === 'monthly') groupBy = "TO_CHAR(call_date, 'YYYY-MM')";
    if (interval === 'quarterly') groupBy = "TO_CHAR(call_date, 'YYYY') || '-Q' || CEIL(EXTRACT(MONTH FROM call_date) / 3)";
    if (interval === 'yearly') groupBy = "TO_CHAR(call_date, 'YYYY')";

    const { data: rows, error } = await supabase.rpc('get_demand_summary', { group_by_expr: groupBy });
    if (!error) setData(rows || []);
    setLoading(false);
  };

  const loadTotalAudits = async () => {
    let query = supabase.from('audits').select('*', { count: 'exact', head: true });
    if (fromDate) query = query.gte('call_date', fromDate);
    if (toDate) query = query.lte('call_date', toDate);
    if (auditType !== 'All') query = query.eq('analysis_type', auditType);
    const { count, error } = await query;
    if (!error && count !== null) setTotalAudits(count);
  };

  const loadOptionDistribution = async () => {
    if (!selectedQuestion) return;

    let query = supabase.from('audit_answers').select('answer, sub_demand');
    if (auditType !== 'All') query = query.eq('analysis_type', auditType);
    if (fromDate) query = query.gte('call_date', fromDate);
    if (toDate) query = query.lte('call_date', toDate);
    query = query.eq('question_title', selectedQuestion);

    const { data, error } = await query;
    if (error || !data) {
      setOptionSummary([]);
      return;
    }

    const counts = {};
    const subCounts = {};

    data.forEach(({ answer, sub_demand }) => {
      const main = answer || 'Unknown';
      counts[main] = (counts[main] || 0) + 1;

      if (sub_demand && sub_demand.trim() !== '') {
        if (!subCounts[main]) subCounts[main] = {};
        subCounts[main][sub_demand] = (subCounts[main][sub_demand] || 0) + 1;
      }
    });

    const summary = Object.entries(counts)
      .map(([answer, count]) => {
        const sub = subCounts[answer] || {};
        const subTotal = Object.values(sub).reduce((a, b) => a + b, 0);
        const subList = Object.entries(sub)
          .map(([label, c]) => ({
            label,
            count: c,
            percent: ((c / subTotal) * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count);

        return {
          answer,
          count,
          percent: ((count / data.length) * 100).toFixed(1),
          sub: subList
        };
      })
      .sort((a, b) => b.count - a.count);

    setOptionSummary(summary);
  };

  useEffect(() => {
    loadAuditTypes();
  }, []);

  useEffect(() => {
    loadData();
    loadTotalAudits();
  }, [interval, fromDate, toDate, auditType]);

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Filter Panel */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm">View By:</label>
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-500"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>

        <label className="text-sm ml-4">Audit Type:</label>
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-500"
          value={auditType}
          onChange={(e) => setAuditType(e.target.value)}
        >
          {auditTypes.map((type, idx) => (
            <option key={idx} value={type}>{type}</option>
          ))}
        </select>

        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          onClick={() => setShowDownloadPanel(!showDownloadPanel)}
        >
          ⬇️ Download CSV
        </button>
      </div>

      {showDownloadPanel && (
        <DownloadPanel
         fromDate={fromDate}
         toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
        onClose={() => setShowDownloadPanel(false)}
        auditType={auditType}
        />

      )}

      {/* Stats */}
      <StatsCard totalAudits={totalAudits} />


      <OptionBreakdown
        auditType={auditType}
        fromDate={fromDate}
         toDate={toDate}
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        questionOptions={questionOptions}
        optionSummary={optionSummary}
        loadOptionDistribution={loadOptionDistribution}
        />



    </div>
  );
}

export default Dashboard;
