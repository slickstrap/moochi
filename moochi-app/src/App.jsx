import { useState } from 'react';

function App() {
  const [callDate, setCallDate] = useState('');
  const [contactId, setContactId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [output, setOutput] = useState('');

  const handleAnalyze = async () => {
    if (!transcript || !analysisType) {
      setOutput("Please enter a transcript and select an analysis type.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callDate, contactId, transcript, analysisType }),
      });

      const data = await response.json();
      setOutput(data.output || "No response from server.");
    } catch (error) {
      console.error(error);
      setOutput('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-center">🎧 Moochi Transcript Analyzer</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Call Date</label>
            <input
              type="date"
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-4 py-2"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact ID</label>
            <input
              type="text"
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-4 py-2"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transcript</label>
            <textarea
              rows="6"
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-4 py-2"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste call transcript here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Analysis Type</label>
            <select
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-4 py-2"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Demand Detection">Demand Detection</option>
              <option value="Root Cause">Root Cause</option>
              <option value="Escalation Risk">Escalation Risk</option>
            </select>
          </div>

          <div className="text-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
              onClick={handleAnalyze}
            >
              Analyze Transcript
            </button>
          </div>

          {output && (
            <div className="bg-gray-700 border border-gray-600 rounded-md p-4 mt-4 text-sm whitespace-pre-wrap font-mono">
              {output}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
