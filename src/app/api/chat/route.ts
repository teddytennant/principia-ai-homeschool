import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Ensure the API key is loaded from environment variables
if (!process.env.OPENROUTER_API_KEY) {
  console.error('ERROR: Missing environment variable OPENROUTER_API_KEY');
  // Return an error response immediately if the key is missing server-side
  return NextResponse.json({ error: 'Server configuration error: API key missing.' }, { status: 500 });
}

// Placeholder values - ideally load from env vars
const YOUR_SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Example: Use NEXT_PUBLIC_APP_URL or default
const YOUR_SITE_NAME = "Principia AI"; // Example site name

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("API route received POST request"); // Log request entry
  try {
    const body = await req.json();
    const { message, subject } = body;
    console.log("Request body:", { message, subject }); // Log parsed body

    if (!message || !subject) {
        console.error('Validation Error: Missing message or subject', body);
        return NextResponse.json({ error: 'Message and subject are required' }, { status: 400 });
    }

    // Simple system prompt based on subject
    let systemPrompt = "You are Principia AI, a helpful Socratic learning assistant designed for school use. Guide the student with questions rather than giving direct answers. Encourage critical thinking.";
    if (subject && subject !== 'general') {
        systemPrompt += ` Focus the discussion on the subject of ${subject}.`;
    }
    systemPrompt += " Avoid giving the final answer directly. Instead, ask leading questions to help the student arrive at the answer themself.";
    console.log("Using System Prompt:", systemPrompt); // Log the system prompt

    // Call OpenRouter API with Llama 4 Maverick
    console.log("Calling OpenRouter API (Llama 4 Maverick Free)...");
    const completion = await openrouter.chat.completions.create({
      model: "meta-llama/llama-4-maverick:free", // Updated model
      messages: [
        { role: "system", content: systemPrompt },
        // TODO: Include previous message history
        { role: "user", content: message }, // Llama 4 might support complex content types, but we send simple text for now
      ],
      temperature: 0.7,
      // Add optional headers for OpenRouter ranking
      extra_headers: {
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
      }
    });
    console.log("OpenRouter API response received."); // Log successful API call

    const assistantResponse = completion.choices[0]?.message?.content;

    if (!assistantResponse) {
      // Log the full completion object if response content is missing
      console.error('OpenRouter Error: No response content received. Full completion:', JSON.stringify(completion, null, 2));
      return NextResponse.json({ error: 'Failed to get valid response content from AI model' }, { status: 500 });
    }

    console.log("Sending response back to client.");
    return NextResponse.json({ content: assistantResponse });

  } catch (error) {
    // Log the specific error object
    console.error('API Route Exception:', error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Details:', { status: error.status, message: error.message, code: error.code, type: error.type });
      errorMessage = `AI API Error (${error.status}): ${error.message}`;
      statusCode = error.status ?? 500;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return a more informative error if possible, otherwise generic
    return NextResponse.json({ error: `An error occurred: ${errorMessage}` }, { status: statusCode });
  }
}
