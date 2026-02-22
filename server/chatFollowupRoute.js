import express from 'express';

const router = express.Router();

// Schema for follow-up questions response
const FOLLOWUP_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['questions'],
  additionalProperties: false,
};

router.post('/chat-followup', async (req, res) => {
  try {
    const { interests, groupSize } = req.body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'interests array is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: return generic questions if no API key
      return res.json({
        questions: buildFallbackQuestions(interests),
      });
    }

    const systemPrompt = `You are helping plan an Amazing Race-style celebration event. Based on the user's selected activity interests, generate 2-3 SHORT, conversational follow-up questions to better understand their preferences. Each question should be one sentence, feel natural and friendly, and help tailor the experience. Do NOT repeat the interest categories back. Ask about specifics: difficulty level, preferences within the category, group dynamics, etc.`;

    const userPrompt = `The group has ${groupSize || 'some'} people and selected these interests: ${interests.join(', ')}.\n\nGenerate 2-3 short follow-up questions.`;

    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        instructions: systemPrompt,
        input: userPrompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'followup_questions',
            schema: FOLLOWUP_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    if (!openaiRes.ok) {
      console.error('OpenAI followup error:', openaiRes.status);
      return res.json({ questions: buildFallbackQuestions(interests) });
    }

    const data = await openaiRes.json();
    const textOutput = data.output?.find((item) => item.type === 'message');
    const content = textOutput?.content?.find((c) => c.type === 'output_text');

    if (!content?.text) {
      return res.json({ questions: buildFallbackQuestions(interests) });
    }

    const parsed = JSON.parse(content.text);
    return res.json({ questions: parsed.questions.slice(0, 3) });
  } catch (err) {
    console.error('Chat followup error:', err);
    return res.json({ questions: buildFallbackQuestions(req.body?.interests || []) });
  }
});

// Fallback questions when no API key or API fails
function buildFallbackQuestions(interests) {
  const questions = [];

  if (interests.includes('hiking') || interests.includes('parks')) {
    questions.push('How active is your group — prefer easy strolls or challenging trails?');
  }
  if (interests.includes('escape-rooms') || interests.includes('games')) {
    questions.push('Has the group done escape rooms or puzzle challenges before?');
  }
  if (interests.includes('food')) {
    questions.push('Any cuisine preferences or must-try local food spots?');
  }
  if (interests.includes('beach') || interests.includes('adventure')) {
    questions.push('Is everyone comfortable with water activities or higher-intensity challenges?');
  }
  if (interests.includes('nightlife')) {
    questions.push('Are you thinking chill lounge vibes or high-energy dance spots?');
  }
  if (interests.includes('museums') || interests.includes('historic') || interests.includes('arts')) {
    questions.push('Any particular era, style, or type of exhibit the group loves?');
  }
  if (interests.includes('wellness')) {
    questions.push('Would the group prefer active wellness (yoga, dance) or passive relaxation (spa, meditation)?');
  }
  if (interests.includes('shopping')) {
    questions.push('Shopping for souvenirs, fashion, or more of a browsing-and-snacking kind of trip?');
  }

  // Ensure at least 2 questions
  if (questions.length < 2) {
    questions.push('What\'s the general energy level of your group — laid-back or competitive?');
    questions.push('Is there a theme or inside joke you\'d love worked into the race?');
  }

  return questions.slice(0, 3);
}

export default router;
