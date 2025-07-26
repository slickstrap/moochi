// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Groq } from 'groq-sdk';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Initialize Groq with your API key
const groq = new Groq({
  apiKey: 'MyAPI',
});

// ✅ POST /analyze — Accepts transcript and prompt, returns structured JSON
app.post('/analyze', async (req, res) => {
  const { callDate, contactId, transcript, prompt } = req.body;

  console.log('📥 Incoming request body:', {
    callDate,
    contactId,
    transcript,
    prompt: prompt?.slice(0, 60) + '...' // log partial prompt only
  });

  // ✅ Validate required fields
  const isValidPrompt = typeof prompt === 'string' && prompt.trim().length > 0;
  const isValidTranscript = typeof transcript === 'string' && transcript.trim().length > 0;

  if (!isValidTranscript || !isValidPrompt) {
    console.warn('⚠️ Validation failed:', {
      hasTranscript: isValidTranscript,
      hasPrompt: isValidPrompt,
      promptType: typeof prompt,
    });

    return res.status(400).json({ output: 'Missing or invalid transcript or prompt.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: `
You are a structured data extraction bot that audits call transcripts using a dynamic configuration.
Your job is to:

- Extract structured information based on a given prompt
- Match transcript content to the schema provided (e.g., demands, sub-demands, reasons, etc.)
- Output strictly valid JSON as per the user's configuration

⚠️ Rules:
- Do NOT include any explanations, summaries, or markdown
- Do NOT add commentary
- Only return valid JSON

Output only JSON. Do not wrap in code blocks.
          `.trim(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const output = completion.choices?.[0]?.message?.content?.trim();

    if (!output) {
      console.error('⚠️ No valid content returned from Groq.');
      return res.status(500).json({ output: 'No valid response from Groq model.' });
    }

    res.json({ output });

  } catch (error) {
    console.error('❌ Groq API error:\n', error?.response?.data || error.message || error);
    res.status(500).json({ output: 'Something went wrong during AI processing.' });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
