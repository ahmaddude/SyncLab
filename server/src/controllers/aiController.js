const Groq = require('groq-sdk');
const Task = require('../models/Task');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

exports.generateTasks = async (req, res) => {
  try {
    const { description, projectId } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
      return res.status(500).json({ message: 'Groq API key not configured. Add GROQ_API_KEY to server/.env' });
    }

    const existingTasks = await Task.find({ project: projectId })
      .select('title description status priority')
      .limit(20);

    const existingContext = existingTasks.length > 0
      ? `\n\nExisting tasks in this project (avoid duplicating these):\n${existingTasks.map((t) => `- ${t.title} [${t.status}]`).join('\n')}`
      : '';

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a senior project manager AI. Given a feature description, break it down into specific, actionable development tasks.

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "title": "Clear, concise task title (max 100 chars)",
      "description": "Detailed description of what needs to be done (max 500 chars)",
      "priority": "low|medium|high|urgent"
    }
  ]
}

Rules:
- Generate 5-15 tasks that cover the full scope
- Be specific and technical
- Order tasks roughly by dependency (foundational tasks first)
- Assign priorities realistically: most tasks are medium, critical path = high/urgent, nice-to-haves = low
- Each task should be independently completable in 1-4 hours
- Do NOT include tasks that already exist in the project${existingContext}`,
        },
        {
          role: 'user',
          content: `Break down this feature into tasks:\n\n${description}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      return res.status(500).json({ message: 'Invalid response from AI' });
    }

    const tasks = parsed.tasks.map((t) => ({
      title: String(t.title || '').slice(0, 200),
      description: String(t.description || '').slice(0, 2000),
      priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium',
    }));

    res.json({ tasks });
  } catch (error) {
    console.error('AI generate tasks error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate tasks' });
  }
};

const TRANSFORM_PROMPTS = {
  summarize: 'Summarize the following text concisely, preserving the key points and meaning. Keep it under 40% of the original length.',
  expand: 'Expand the following text with more detail, examples, and depth. Make it roughly 2x longer while maintaining the original tone and meaning.',
  rewrite: 'Rewrite the following text to be clearer, more professional, and better structured. Preserve the meaning but improve readability.',
  fix_grammar: 'Fix all grammar, spelling, punctuation, and capitalization errors in the following text. Only fix errors — do not change the content, style, or meaning.',
  generate: 'Based on the following context, generate relevant content that fits naturally. Match the tone and style of the provided text.',
};

exports.transformText = async (req, res) => {
  try {
    const { text, action, prompt } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text is required' });
    }

    if (!action || !TRANSFORM_PROMPTS[action]) {
      return res.status(400).json({ message: 'Valid action is required: summarize, expand, rewrite, fix_grammar, generate' });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
      return res.status(500).json({ message: 'Groq API key not configured. Add GROQ_API_KEY to server/.env' });
    }

    const systemPrompt = TRANSFORM_PROMPTS[action];
    const userContent = action === 'generate'
      ? `Context:\n${text}\n\n${prompt ? `Additional instructions: ${prompt}` : 'Generate 1-3 paragraphs of relevant content.'}`
      : text;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: action === 'fix_grammar' ? 0.2 : 0.7,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error('AI transform error:', error);
    res.status(500).json({ message: error.message || 'Failed to transform text' });
  }
};
