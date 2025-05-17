import { NextResponse, NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// --- Zod Schema for Input Validation ---
const summarizeInputSchema = z.object({
  content: z.string().min(50, { message: "Content must be at least 50 characters long to summarize" }), // Require some minimum content
});

// --- AI Model Initialization ---
// Initialize the OpenAI provider using the AI SDK adapter
// Pointing to OpenRouter's OpenAI-compatible endpoint
const openAI = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// --- Supabase Client for Auth ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Summarize API Error: Supabase URL or Anon Key missing.");
  // We can't throw here as it's top-level, handle in POST
}
const supabase = createClient(supabaseUrl!, anonKey!);

// --- Main API Route Handler ---
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Authorization header missing or invalid.' } }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Summarize API: JWT verification error:", userError);
      return NextResponse.json({ error: { message: 'Not authenticated or invalid token.' } }, { status: 401 });
    }

    // Optional: Add role check if only parents should summarize
    // const { data: profileData, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('role')
    //   .eq('id', user.id)
    //   .single();
    // if (profileError || !profileData || profileData.role !== 'parent') {
    //    return NextResponse.json({ error: { message: 'Forbidden: Only parents can summarize curriculum.' } }, { status: 403 });
    // }


    // 2. Parse and Validate Input Body
    let requestBody;
    try {
        requestBody = await req.json();
    } catch (e) {
        return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });
    }

    const validationResult = summarizeInputSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error("Summarize input validation failed:", validationResult.error.flatten());
      return NextResponse.json(
        { error: { message: "Invalid input.", details: validationResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }
    const { content } = validationResult.data;

    // 3. Generate Summary using AI SDK
    const systemPrompt = `You are an expert summarizer. Provide a concise summary (around 100-200 words) of the following text, capturing the main points and key information. Focus on the core concepts relevant for educational context.`;

    const { text: summary } = await generateText({
      model: openAI('google/gemini-flash-1.5'), // Or another suitable model
      system: systemPrompt,
      prompt: `Summarize this content:\n\n${content}`,
      maxTokens: 300, // Limit summary length
    });

    // 4. Return the Summary
    return NextResponse.json({ summary }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing summarization request:", error);
    // Distinguish between AI errors and other errors if possible
    let errorMessage = "Failed to generate summary.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    return NextResponse.json({ error: { message: errorMessage } }, { status: 500 });
  }
}
