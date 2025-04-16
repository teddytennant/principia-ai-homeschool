import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing curriculum content' }, { status: 400 });
    }

    const prompt = `Summarize the following curriculum content in under 100 words, focusing on the key topics, objectives, and context so students can understand what it covers.\n\nContent:\n${content}`;

    const completion = await openrouter.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      messages: [
        { role: 'system', content: 'You are an expert curriculum summarizer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200, // Should be less than 100 words
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
    }
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
