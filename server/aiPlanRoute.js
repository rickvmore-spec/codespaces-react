import express from 'express';
import { lookupZip } from './zipLookup.js';

const router = express.Router();

// JSON schema for strict structured output
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    budget: {
      type: 'object',
      properties: {
        estimated_total: { type: 'number' },
        per_person: { type: 'number' },
      },
      required: ['estimated_total', 'per_person'],
      additionalProperties: false,
    },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
            },
            required: ['name', 'address'],
            additionalProperties: false,
          },
          booking_required: { type: 'boolean' },
        },
        required: ['start', 'end', 'title', 'description', 'location', 'booking_required'],
        additionalProperties: false,
      },
    },
    shopping_list: {
      type: 'array',
      items: { type: 'string' },
    },
    host_message: { type: 'string' },
  },
  required: ['summary', 'budget', 'timeline', 'shopping_list', 'host_message'],
  additionalProperties: false,
};

function buildSystemPrompt(location) {
  return `You are an expert local event planner specializing in creating Amazing Race-inspired celebration experiences.

LOCATION CONTEXT (use ONLY this — do NOT fabricate):
- City: ${location.city}
- State: ${location.state}
- ZIP: ${location.zip}
- Coordinates: ${location.lat}, ${location.lng}

RULES:
1. Use only the provided location context when suggesting venues and activities.
2. Do NOT fabricate exact street addresses. Use general area descriptions (e.g., "Downtown ${location.city} area") or well-known venue names. If you include an address, clearly label it as approximate.
3. Keep all travel distances reasonable — no more than 20 minutes between consecutive stops.
4. Stay strictly within the stated budget range.
5. Create a realistic, practical timeline accounting for travel time, setup, and transitions.
6. Assume real-world constraints: some venues require advance booking, outdoor activities depend on weather, restaurants have capacity limits.
7. Build the experience as an Amazing Race-style adventure with themed challenges, pit stops, and surprises woven into the timeline.
8. Your output MUST match the provided JSON schema exactly. Return nothing but valid JSON.`;
}

function buildUserPrompt(params) {
  const { date, startTime, groupSize, budget, vibe, dietaryRestrictions } = params;

  const budgetDesc = {
    low: '$15-30 per person',
    medium: '$30-75 per person',
    high: '$75-150+ per person',
  };

  return `Plan an Amazing Race-inspired celebration event with these details:

- Date: ${date}
- Start time: ${startTime}
- Group size: ${groupSize} people
- Budget: ${budgetDesc[budget] || budget}
- Vibe: ${vibe}
${dietaryRestrictions ? `- Dietary restrictions: ${dietaryRestrictions}` : '- No dietary restrictions'}

Create a full event plan with 4-6 timeline stops. Include Amazing Race elements: challenges at stops, themed transitions, and a dramatic finale. Make it feel like a real race with clue reveals, detours, and a celebration at the final pit stop.`;
}

router.post('/ai-plan', async (req, res) => {
  try {
    const { zipCode, date, startTime, groupSize, budget, vibe, dietaryRestrictions } = req.body;

    // Validate required fields
    if (!zipCode || !date || !startTime || !groupSize || !budget || !vibe) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['zipCode', 'date', 'startTime', 'groupSize', 'budget', 'vibe'],
      });
    }

    // Resolve ZIP to location
    let location;
    try {
      location = await lookupZip(zipCode);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Verify API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY in your environment.' });
    }

    const systemPrompt = buildSystemPrompt(location);
    const userPrompt = buildUserPrompt({ date, startTime, groupSize, budget, vibe, dietaryRestrictions });

    // Call OpenAI Responses API with structured output
    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        instructions: systemPrompt,
        input: userPrompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'event_plan',
            schema: PLAN_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error('OpenAI API error:', openaiRes.status, errBody);
      return res.status(500).json({ error: 'Failed to generate plan. Please try again.' });
    }

    const openaiData = await openaiRes.json();

    // Extract the text content from the response
    const textOutput = openaiData.output?.find((item) => item.type === 'message');
    const content = textOutput?.content?.find((c) => c.type === 'output_text');

    if (!content?.text) {
      console.error('Unexpected OpenAI response structure:', JSON.stringify(openaiData));
      return res.status(500).json({ error: 'Unexpected response from AI. Please try again.' });
    }

    const plan = JSON.parse(content.text);

    // Attach location metadata
    plan._meta = {
      location,
      generatedAt: new Date().toISOString(),
      params: { date, startTime, groupSize, budget, vibe, dietaryRestrictions },
    };

    return res.json(plan);
  } catch (err) {
    console.error('AI plan generation error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

export default router;
