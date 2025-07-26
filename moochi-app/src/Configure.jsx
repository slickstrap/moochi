// src/Configure.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function Configure() {
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionTitle, setQuestionTitle] = useState('');
  const [type, setType] = useState('options');
  const [options, setOptions] = useState([{ label: '', sub: [] }]);
  const [charLimit, setCharLimit] = useState(128);
  const [customPrompt, setCustomPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');

  useEffect(() => {
    loadLatestConfig();
    loadHistory();
  }, []);

  const resetQuestionForm = () => {
    setQuestionTitle('');
    setOptions([{ label: '', sub: [] }]);
    setCharLimit(128);
    setCustomPrompt('');
    setType('options');
    setEditingIndex(null);
  };

  const resetAllFields = () => {
    setSelectedAnalysisId('');
    setAnalysisTitle('');
    setQuestions([]);
    setOriginalQuestions([]);
    resetQuestionForm();
  };

  const loadLatestConfig = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('saved_configs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data?.length) {
      setSelectedAnalysisId(data[0].id);
      setQuestions(data[0].config);
      setOriginalQuestions(data[0].config);
      setAnalysisTitle(data[0].title);
    }
  };

  const loadHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('saved_configs')
      .select('id, title')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setHistory(data);
  };

  const handleSelectAnalysis = async (id) => {
    if (!id) {
      resetAllFields();
      return;
    }

    setSelectedAnalysisId(id);
    const { data } = await supabase
      .from('saved_configs')
      .select('config, title')
      .eq('id', id)
      .single();

    if (data) {
      setQuestions(data.config);
      setOriginalQuestions(data.config);
      setAnalysisTitle(data.title);
      resetQuestionForm();
    }
  };

  const handleSaveConfiguration = async () => {
    if (!analysisTitle.trim()) {
      setSaveMessage('❌ Please enter an Analysis Type title.');
      return;
    }

    if (selectedAnalysisId && JSON.stringify(questions) === JSON.stringify(originalQuestions)) {
      setSaveMessage('⚠️ No changes detected. Nothing saved.');
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return setSaving(false);

    await supabase.from('saved_configs')
      .delete()
      .eq('user_id', session.user.id)
      .eq('title', analysisTitle);

    const { error } = await supabase.from('saved_configs').insert({
      user_id: session.user.id,
      config: questions,
      title: analysisTitle,
    });

    if (!error) {
      setSaveMessage('✅ Saved!');
      setOriginalQuestions(questions);
      loadHistory();
    } else {
      console.error(error);
      setSaveMessage('❌ Failed to save.');
    }

    setSaving(false);
  };

  const handleAddOrUpdateQuestion = () => {
    const newQuestion = {
      question_title: questionTitle,
      type,
      options: type === 'options' ? options : null,
      character_limit: type === 'sentence' ? charLimit : null,
      prompt: customPrompt || null
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions((prev) => [...prev, newQuestion]);
    }

    resetQuestionForm();
  };

  const handleEditQuestion = (index) => {
    const q = questions[index];
    setQuestionTitle(q.question_title);
    setType(q.type);
    setOptions(q.options || [{ label: '', sub: [] }]);
    setCharLimit(q.character_limit || 128);
    setCustomPrompt(q.prompt || '');
    setEditingIndex(index);
  };

  const handleDeleteLocal = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) resetQuestionForm();
  };

  const handleOptionChange = (index, value) => {
    const newOpts = [...options];
    newOpts[index].label = value;
    setOptions(newOpts);
  };

  const handleAddSubOption = (index) => {
    const newOpts = [...options];
    newOpts[index].sub.push('');
    setOptions(newOpts);
  };

  const handleSubOptionChange = (i, j, value) => {
    const newOpts = [...options];
    newOpts[i].sub[j] = value;
    setOptions(newOpts);
  };

  const toggleExpand = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">⚙️ Configure AI Analysis</h1>

      {history.length > 0 && (
        <div className="mb-6">
          <label className="block mb-1 font-medium">Select Analysis Type</label>
          <select
            className="w-full p-2 rounded bg-gray-700"
            value={selectedAnalysisId}
            onChange={(e) => handleSelectAnalysis(e.target.value)}
          >
            <option value="">➕ New Analysis Type</option>
            {history.map(entry => (
              <option key={entry.id} value={entry.id}>{entry.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-xl space-y-4">
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700"
            placeholder="Analysis Type Title"
            value={analysisTitle}
            onChange={(e) => setAnalysisTitle(e.target.value)}
            disabled={!!selectedAnalysisId}
          />

          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700"
            placeholder="Question Title"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
          />

          <select
            className="w-full p-2 rounded bg-gray-700"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="options">Multiple Choice</option>
            <option value="sentence">Short Answer</option>
          </select>

          {type === 'options' && (
            <>
              {options.map((opt, i) => (
                <div key={i} className="mb-3">
                  <input
                    className="w-full p-2 mb-1 rounded bg-gray-700"
                    placeholder="Main Option"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                  {opt.sub.map((s, j) => (
                    <input
                      key={j}
                      className="w-full p-2 mb-1 ml-4 rounded bg-gray-800"
                      placeholder="Sub-demand"
                      value={s}
                      onChange={(e) => handleSubOptionChange(i, j, e.target.value)}
                    />
                  ))}
                  <button className="text-sm text-blue-400 hover:underline" onClick={() => handleAddSubOption(i)}>➕ Add Sub</button>
                </div>
              ))}
              <button
                className="mt-2 bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 text-sm"
                onClick={() => setOptions([...options, { label: '', sub: [] }])}
              >
                ➕ Add Main Option
              </button>
            </>
          )}

          {type === 'sentence' && (
            <div>
              <label className="block font-medium mb-1">Character Limit</label>
              <input
                type="number"
                className="w-full p-2 rounded bg-gray-700"
                value={charLimit}
                onChange={(e) => setCharLimit(Number(e.target.value))}
              />
            </div>
          )}

          <textarea
            className="w-full p-2 rounded bg-gray-700"
            placeholder="Optional custom prompt for this question"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />

          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
              onClick={handleAddOrUpdateQuestion}
            >
              {editingIndex !== null ? '✏️ Update Question' : '➕ Add to List'}
            </button>

            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
              onClick={handleSaveConfiguration}
              disabled={saving}
            >
              💾 Save Analysis Type
            </button>
          </div>

          {saveMessage && <p className="text-sm mt-2 text-green-400">{saveMessage}</p>}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">📋 Questions ({questions.length})</h2>
          <ul className="space-y-2 max-h-[75vh] overflow-y-auto pr-2">
            {questions.map((q, i) => (
              <li key={i} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{q.question_title}</strong> ({q.type})
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleEditQuestion(i)} className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600">✏️</button>
                    <button onClick={() => toggleExpand(i)} className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-500">
                      {expandedIndex === i ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDeleteLocal(i)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">🗑</button>
                  </div>
                </div>
                {expandedIndex === i && (
                  <div className="mt-2 text-sm">
                    {q.type === 'options' && q.options && (
                      <ul className="list-disc ml-4">
                        {q.options.map((opt, idx) => (
                          <li key={idx}>
                            {opt.label}
                            {opt.sub?.length > 0 && (
                              <ul className="ml-4 list-circle text-xs">
                                {opt.sub.map((s, j) => <li key={j}>{s}</li>)}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === 'sentence' && <p>Limit: {q.character_limit} chars</p>}
                    {q.prompt && <p className="mt-2 italic text-gray-300">Prompt: {q.prompt}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Configure;
