import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { generateGroqPrompt } from './utils/groqPromptBuilder';

export default function Analyze() {
  const [callDate, setCallDate] = useState('');
  const [contactId, setContactId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [output, setOutput] = useState('');
  const [user, setUser] = useState(null);
  const [analysisTypes, setAnalysisTypes] = useState([]);
  const [selectedAnalysisTitle, setSelectedAnalysisTitle] = useState('');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndTypes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from('saved_configs')
          .select('id, title')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error) setAnalysisTypes(data || []);
      }
    };

    fetchUserAndTypes();
  }, []);

  const handleAnalysisTypeChange = async (e) => {
    const title = e.target.value;
    setSelectedAnalysisTitle(title);
    setConfig(null);

    if (!title || !user) return;

    const { data, error } = await supabase
      .from('saved_configs')
      .select('config')
      .eq('user_id', user.id)
      .eq('title', title)
      .single();

    if (!error && data?.config) {
      const normalized = data.config.map(q => ({
        title: q.question_title || q.title || `Untitled`,
        type: q.type,
        prompt: q.prompt || '',
        options: (q.options || []).map(opt => ({
          label: opt.label,
          subDemands: opt.sub || []
        })),
        charLimit: q.character_limit || q.charLimit || 128
      }));
      setConfig(normalized);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript || !config) {
      setOutput("⚠️ Please enter a transcript and select an analysis type.");
      return;
    }

    let prompt;
    try {
      prompt = generateGroqPrompt({ questions: config }, transcript);
    } catch (err) {
      console.error("❌ Failed to generate prompt:", err);
      setOutput("⚠️ Error while building prompt.");
      return;
    }

    const payload = {
      callDate,
      contactId,
      transcript,
      prompt,
    };

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setOutput(data.output || "⚠️ No output received.");
    } catch (error) {
      console.error(error);
      setOutput("❌ Network error while contacting the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!output || !contactId || !callDate || !selectedAnalysisTitle) {
      alert("❗ Please fill in all required fields and analyze a transcript.");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (e) {
      alert("❗ Invalid output JSON format.");
      return;
    }

    const { data: existing, error: existingErr } = await supabase
      .from('audits')
      .select('id')
      .eq('contact_id', contactId)
      .maybeSingle();

    if (existing) {
      alert("⚠️ This contact ID already exists in the database.");
      return;
    }

    const { data: insertAudit, error: auditInsertErr } = await supabase
      .from('audits')
      .insert({
        contact_id: contactId,
        call_date: callDate,
        analysis_type: selectedAnalysisTitle
      })
      .select()
      .single();

    if (auditInsertErr) {
      console.error('❌ Error inserting audit:', auditInsertErr);
      alert('❌ Failed to save audit metadata.');
      return;
    }

    const audit_id = insertAudit.id;

    const answers = [];
    for (const q of parsed.questions || []) {
      if (!q.title) continue;
      const base = {
        audit_id,
        question_title: q.title,
        answer: q.answer || '',
        description: q.description || '',
        sub_demand: q.sub_demand || '',
      };
      answers.push(base);
    }

    const { error: answersError } = await supabase.from('audit_answers').insert(answers);

    if (answersError) {
      console.error('❌ Failed to save audit answers:', answersError);
      alert('❌ Failed to save audit answers.');
    } else {
      alert('✅ Audit saved successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-center">🎧 Moochi Transcript Analyzer</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Call Date</label>
            <input type="date" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2" value={callDate} onChange={e => setCallDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact ID</label>
            <input type="text" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2" value={contactId} onChange={e => setContactId(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transcript</label>
            <textarea rows="6" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2" value={transcript} onChange={e => setTranscript(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Analysis Type</label>
            <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2" value={selectedAnalysisTitle} onChange={handleAnalysisTypeChange}>
              <option value="">Select...</option>
              {analysisTypes.map(({ id, title }) => (
                <option key={id} value={title}>{title}</option>
              ))}
            </select>
          </div>

          <button onClick={handleAnalyze} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold">
            {loading ? 'Analyzing...' : '🚀 Analyze Transcript'}
          </button>

          {output && (
            <>
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">📊 Output</h2>
                {(() => {
                  let parsed;
                  try {
                    parsed = JSON.parse(output);
                  } catch (e) {
                    return (
                      <pre className="whitespace-pre-wrap bg-red-800 p-4 rounded text-sm text-red-200">
                        ⚠️ Failed to parse JSON: {e.message}
                      </pre>
                    );
                  }

                  return (
                    <div className="space-y-6 bg-gray-800 p-4 rounded-md border border-gray-700 text-white text-sm">
                      {parsed.questions?.map((q, idx) => (
                        <div key={idx} className="space-y-1">
                          <strong className="text-green-400">{q.title}:</strong>
                          {q.answer && q.answer !== 'None' && <p className="ml-4 break-words">{q.answer}</p>}
                          {q.sub_demand && q.sub_demand !== 'None' && (
                            <>
                              <strong className="text-green-300 ml-2">Sub Demand:</strong>
                              <p className="ml-6 break-words">{q.sub_demand}</p>
                            </>
                          )}
                          {q.description && q.description !== 'None' && (
                            <>
                              <strong className="text-green-300 ml-2">Description:</strong>
                              <p className="ml-6 whitespace-pre-wrap break-words">{q.description}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <button onClick={handleSaveAudit} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">
                💾 Save Audit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
