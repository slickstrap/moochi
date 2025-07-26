import React from 'react';

function OptionBreakdown({
  auditType,
  questionOptions,
  selectedQuestion,
  setSelectedQuestion,
  loadOptionDistribution,
  optionSummary
}) {
  return (
    <div className="bg-gray-900 mt-6 p-4 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold">Option Question Breakdown</h2>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm">Select Option Question:</label>
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-500"
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
        >
          <option value="">-- Select a Question --</option>
          {questionOptions
            .filter(q => auditType === 'All' || q.analysis_type === auditType)
            .map((q, idx) => (
              <option key={idx} value={q.question_title}>
                {q.question_title} ({q.analysis_type})
              </option>
            ))}
        </select>
        <button
          className="bg-blue-700 hover:bg-blue-800 px-4 py-1 text-sm rounded"
          onClick={loadOptionDistribution}
        >
          Show Breakdown
        </button>
      </div>

      {optionSummary.length > 0 && (
        <table className="w-full text-sm text-left mt-4 table-fixed">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th className="py-2 w-2/5">{selectedQuestion}</th>
              <th className="py-2 text-right w-1/5">Count</th>
              <th className="py-2 text-right w-1/5">Percent</th>
            </tr>
          </thead>
          <tbody>
            {optionSummary.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-gray-800 font-semibold">
                  <td className="py-1">{item.answer}</td>
                  <td className="py-1 text-right">{item.count}</td>
                  <td className="py-1 text-right">{item.percent}%</td>
                </tr>
                {item.sub.length > 0 &&
                  item.sub.map((sub, sIdx) => (
                    <tr key={sIdx} className="text-sm text-gray-400 border-b border-gray-800">
                      <td className="py-1 pl-6">↳ {sub.label}</td>
                      <td className="py-1 text-right">{sub.count}</td>
                      <td className="py-1 text-right">{sub.percent}%</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OptionBreakdown;
