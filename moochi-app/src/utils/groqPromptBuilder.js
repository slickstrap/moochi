export function generateGroqPrompt(configObj, transcript) {
    if (
      !configObj ||
      typeof configObj !== 'object' ||
      !Array.isArray(configObj.questions) ||
      configObj.questions.length === 0
    ) {
      console.error('❌ Invalid config structure (expected { questions: [] }):', configObj);
      throw new Error('Invalid config structure passed to generateGroqPrompt');
    }
  
    const formattedQuestions = configObj.questions.map((q, index) => {
      const title = q.title?.replace(/"/g, '\\"') || `Untitled Question ${index + 1}`;
      const prompt = q.prompt ? `\n    "prompt": "${q.prompt.replace(/"/g, '\\"')}",` : '';
  
      if (q.type === 'options') {
        const optionsFormatted = (q.options || []).map(opt => {
          const subFormatted = (opt.subDemands || [])
            .map(sub => `        "${sub.replace(/"/g, '\\"')}"`)
            .join(', ') || '        "None"';
  
          return `      {
          "label": "${opt.label.replace(/"/g, '\\"')}",
          "sub_demands": [${subFormatted}]
        }`;
        }).join(',\n') || '      { "label": "None", "sub_demands": [] }';
  
        return `  {
      "title": "${title}",${prompt}
      "type": "options",
      "options": [\n${optionsFormatted}\n    ]
    }`;
      }
  
      if (q.type === 'sentence') {
        const limit = q.charLimit || 128;
        return `  {
      "title": "${title}",${prompt}
      "type": "sentence",
      "char_limit": ${limit}
    }`;
      }
  
      return `  {
      "title": "${title}",${prompt}
      "type": "unknown"
    }`;
    }).join(',\n');
  
    return `
  You are a Moochi AI Auditor. Use the configuration to analyze the transcript and respond in JSON format.
  
  Configuration:
  [
  ${formattedQuestions}
  ]
  
  Transcript:
  """
  ${transcript}
  """
  
  Strictly respond in this format:
  {
    "questions": [
      {
        "title": "Question text...",
        "answer": "Selected option or written answer",
        "sub_demand": "Sub-category (if applicable)",
        "description": "128-character summary if question is sentence type"
      }
    ]
  }
  
  Do NOT write paragraphs, markdown, or explanations. Only respond in pure JSON.
  `.trim();
  }
  