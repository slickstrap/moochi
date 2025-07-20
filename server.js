import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Groq } from 'groq-sdk';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Groq client setup with API key
const groq = new Groq({
  apiKey: 'API Key',
});

// ✅ POST endpoint
app.post('/analyze', async (req, res) => {
  const { callDate, contactId, transcript, analysisType } = req.body;

  // 🚨 Basic validation (prevents blank submissions from crashing the AI call)
  if (!transcript || !analysisType) {
    return res.status(400).json({ output: 'Missing transcript or analysis type.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful analyst who analyzes customer service call transcripts based on a selected analysis type.',
        },
        {
          role: 'user',
          content: `Call Date: ${callDate}
Contact ID: ${contactId}
Transcript: ${transcript}
Analysis Type: ${analysisType}

Please analyze accordingly.`,
        },
      ],
    });

    const output = completion.choices[0]?.message?.content ?? 'No response from AI.';
    res.json({ output });

  } catch (error) {
    console.error('❌ Groq API error in /analyze route:\n', error?.response?.data || error.message || error);
    res.status(500).json({ output: 'Something went wrong during AI processing.' });
  }
});

// ✅ Server startup
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
