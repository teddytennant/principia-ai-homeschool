// Remove direct OpenAI import, use AI SDK adapter instead
// import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Correct imports for Vercel AI SDK v3+
import { createOpenAI } from '@ai-sdk/openai'; // Import the adapter
import { streamText, CoreMessage } from 'ai'; // Import streamText and CoreMessage type
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import sss from 'shamirs-secret-sharing';
// Removed Mastery Engine related imports
// import { getContent } from '@/lib/content-unlocker';
// import { nextThreshold } from '@/lib/mgpd';
import { z } from 'zod'; // Import zod

// --- Zod Schemas for Input Validation ---
// Schema for general chat requests
const chatInputSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']), // Allow system role in history if needed
      content: z.string(),
    })
  ).optional().default([]), // History is optional, default to empty array
});

// --- AI Model Initialization ---
// Initialize the OpenAI provider using the AI SDK adapter
// Pointing to OpenRouter's OpenAI-compatible endpoint
const openAI = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// --- Default Settings ---
const defaultTeacherSettings = {
  isAiEnabled: true,
  aiOpenness: 50,
  gradeLevel: '8',
  curriculum: [],
  subjects: [{ id: 'general', name: 'General' }],
  additionalContext: '',
  subjectContext: {} // Add subjectContext field
};

// --- Helper Functions ---

// Define interface for teacher settings
interface TeacherSettings {
  isAiEnabled: boolean;
  aiOpenness: number;
  gradeLevel: string;
  curriculum: Array<{ name: string; content: string, subject?: string }>;
  subjects: Array<{ id: string; name: string }>;
  additionalContext: string;
  subjectContext?: Record<string, string>;
}

// Helper function to get teacher settings based on the authenticated student's creator
const getTeacherSettings = async (studentId: string): Promise<TeacherSettings> => {
  if (!studentId || studentId === 'default-student') {
    console.log("No valid student ID provided, using default settings.");
    return defaultTeacherSettings;
  }

  try {
    // 1. Fetch the student's profile to find the teacher (creator)
    const { data: studentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('created_by') // Get the teacher's ID
      .eq('id', studentId)
      .single();

    if (profileError || !studentProfile?.created_by) {
      console.error(`Error fetching student profile or teacher ID for student ${studentId}:`, profileError?.message || "No teacher ID found");
      console.log("Falling back to default settings.");
      return defaultTeacherSettings;
    }

    const teacherId = studentProfile.created_by;
    console.log(`Found teacher ID ${teacherId} for student ${studentId}. Fetching settings...`);

    // 2. Fetch the teacher's settings from the teacher_settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('teacher_settings') // Ensure this table exists
      .select('settings') // Select the JSONB column containing settings
      .eq('teacher_id', teacherId)
      .single();

    if (settingsError) {
      if (settingsError.code !== 'PGRST116') { // Ignore 'not found' error
          console.error(`Error fetching settings for teacher ${teacherId}:`, settingsError.message);
      }
      console.log(`No settings found or error fetching for teacher ${teacherId}, using default settings.`);
      return defaultTeacherSettings;
    }

    if (settingsData && settingsData.settings) {
      const settings = settingsData.settings as any;
      console.log(`Using settings from DB for teacher ${teacherId}`);
      return {
        isAiEnabled: settings.isAiEnabled ?? defaultTeacherSettings.isAiEnabled,
        aiOpenness: settings.aiOpenness ?? defaultTeacherSettings.aiOpenness,
        gradeLevel: settings.gradeLevel ?? defaultTeacherSettings.gradeLevel,
        curriculum: Array.isArray(settings.curriculum) ? settings.curriculum : defaultTeacherSettings.curriculum,
        subjects: Array.isArray(settings.subjects) ? settings.subjects : defaultTeacherSettings.subjects,
        additionalContext: settings.additionalContext ?? defaultTeacherSettings.additionalContext,
        subjectContext: typeof settings.subjectContext === 'object' ? settings.subjectContext : defaultTeacherSettings.subjectContext,
      };
    } else {
      console.log(`No settings data returned for teacher ${teacherId}, using default settings.`);
      return defaultTeacherSettings;
    }

  } catch (error) {
    console.error('Unexpected error in getTeacherSettings:', error);
    console.log("Falling back to default settings due to unexpected error.");
    return { ...defaultTeacherSettings };
  }
};


// Helper function to generate system prompt based on settings
const generateSystemPrompt = (subject: string, settings: TeacherSettings): string => {
  if (!settings.isAiEnabled) return "AI Assistant is disabled.";

  const teacherSubjects = settings.subjects || [{ id: 'general', name: 'General' }];
  const isSubjectTaught = teacherSubjects.some((s) => s.id === subject);
  const subjectObj = teacherSubjects.find((s) => s.id === subject);
  const subjectName = subjectObj ? subjectObj.name : subject;

  let systemPrompt = "You are Principia AI, a helpful learning assistant designed for school use.";

  const gradeLevel = settings.gradeLevel;
  if (gradeLevel) {
    const gradeMap: { [key: string]: string } = { 'k': "kindergarten students...", /* ... other grades ... */ 'higher_ed': "college/university students..." };
    const gradeText = gradeMap[gradeLevel] || `${gradeLevel}th grade students`;
    systemPrompt += ` You are assisting ${gradeText}, so adjust your language and concepts appropriately.`;
  }

  const aiOpenness = settings.aiOpenness ?? 50;
  if (aiOpenness < 20) systemPrompt += " Use a strongly Socratic approach...";
  else if (aiOpenness < 40) systemPrompt += " Use a mostly Socratic approach...";
  else if (aiOpenness < 60) systemPrompt += " Balance Socratic questioning with direct instruction...";
  else if (aiOpenness < 80) systemPrompt += " Provide mostly direct explanations...";
  else systemPrompt += " Provide direct answers and thorough explanations...";

  if (isSubjectTaught && subject !== 'general') {
    systemPrompt += ` Focus the discussion on the subject of ${subjectName}.`;
  }

  const subjectSpecificContext = settings.subjectContext?.[subject]?.trim();
  const generalContext = settings.additionalContext?.trim();

  if (subjectSpecificContext) systemPrompt += `\n\nADDITIONAL TEACHER INSTRUCTIONS FOR ${subjectName.toUpperCase()}:\n${subjectSpecificContext}`;
  else if (generalContext) systemPrompt += `\n\nADDITIONAL TEACHER INSTRUCTIONS:\n${generalContext}`;

  return systemPrompt;
};

// Helper function to format curriculum content for context
const formatCurriculumContext = (curriculum: Array<{ name: string; content: string, subject?: string }>, subject: string, teacherSubjects: Array<{ id: string; name: string }>): string => {
    if (!curriculum || curriculum.length === 0) return "";
    const isSubjectTaught = teacherSubjects.some((s) => s.id === subject);
    if (!isSubjectTaught && subject !== 'general') return "";
    const relevantCurriculum = curriculum.filter(item => !item.subject || item.subject === subject || item.subject === 'general');
    if (relevantCurriculum.length === 0) return "";
    let context = `\n\nRELEVANT CURRICULUM MATERIALS FOR ${subject.toUpperCase()}:\n\n`;
    relevantCurriculum.forEach((item, index) => {
        const contentPreview = item.content.length > 500 ? item.content.substring(0, 500) + "..." : item.content;
        context += `DOCUMENT ${index + 1}: ${item.name} ${item.subject ? `(Subject: ${item.subject})` : ''}\n${contentPreview}\n\n`;
    });
    context += "Use the above curriculum materials as context for your responses when relevant.\n";
    return context;
};

// Helper function to get student ID (handles potential errors)
const getStudentId = async (): Promise<string> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (user) return user.id;
    const cookieStore = await cookies(); // Use await here
    const studentId = cookieStore.get('studentId')?.value;
    if (studentId) return studentId;
    return 'default-student';
  } catch (err) {
    console.error("Error getting student ID:", err instanceof Error ? err.message : err);
    return 'default-student';
  }
};

// Function to check and increment message count (database RPC)
const checkAndIncrementMessageCount = async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
  const DAILY_LIMIT = 500;
  const today = new Date().toISOString().split('T')[0];

  try {
      const { data, error } = await supabase.rpc('increment_daily_message_count', {
        p_user_id: userId, p_date: today, p_limit: DAILY_LIMIT
      });
      if (error) throw error;
      if (typeof data !== 'number') throw new Error('Unexpected RPC return type');
      if (data > DAILY_LIMIT) return { allowed: false, message: `You have reached the daily message limit of ${DAILY_LIMIT}.` };
      return { allowed: true };
  } catch (rpcError) {
       console.error('Error calling/processing increment_daily_message_count RPC:', rpcError);
       return { allowed: false, message: 'Could not verify usage limits due to a server error.' };
  }
};

// --- Main API Route Handler ---

export async function POST(req: NextRequest) {
  let requestBody;
  try {
      requestBody = await req.json();
  } catch (e) {
      return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });
  }

  const chatId = req.headers.get('X-Chat-ID') || uuidv4();

  // --- General Chat Logic ---
  // Validate chat input
  const validationResult = chatInputSchema.safeParse(requestBody);
  if (!validationResult.success) {
    console.error("Chat input validation failed:", validationResult.error.flatten());
    return NextResponse.json(
      { error: { message: "Invalid chat input.", details: validationResult.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const { message, subject, history } = validationResult.data;

  const studentId = await getStudentId();
  if (studentId === 'default-student') {
    return NextResponse.json({ error: { message: 'User authentication required.' } }, { status: 401 });
  }

  // Rate Limiting Check
  const limitCheck = await checkAndIncrementMessageCount(studentId);
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: { message: limitCheck.message || 'Daily message limit reached.' } }, { status: 429 });
  }

  try {
    const settings = await getTeacherSettings(studentId);
    if (!settings.isAiEnabled) {
      return NextResponse.json({ error: { message: "The AI assistant is currently disabled by your teacher." } }, { status: 403 });
    }

    const systemPrompt = generateSystemPrompt(subject, settings);
    const curriculumContext = formatCurriculumContext(settings.curriculum, subject, settings.subjects);
    const fullSystemPrompt = systemPrompt + curriculumContext;

    const messages: CoreMessage[] = [
      { role: "system", content: fullSystemPrompt },
      ...history.map((msg: any) => ({ // Use any temporarily if exact type causes issues
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call the AI model via streamText
    const result = await streamText({
      model: openAI('google/gemini-flash-1.5'),
      messages: messages,
      onFinish: async ({ text, usage, finishReason }) => {
          console.log(`Stream finished for chat ID: ${chatId}. Reason: ${finishReason}`);
          console.log(`Final Text length: ${text.length}`);
          console.log(`Usage: Input Tokens: ${usage.promptTokens}, Output Tokens: ${usage.completionTokens}`);

          // Save messages asynchronously
          (async () => {
              try {
                  const { error: chatUpsertError } = await supabase
                      .from('chats')
                      .upsert({ id: chatId, user_id: studentId, subject: subject }, { onConflict: 'id' });
                  if (chatUpsertError) throw chatUpsertError;

                  const messagesToInsert = [
                      { chat_id: chatId, user_id: studentId, role: 'user', content: message },
                      { chat_id: chatId, user_id: studentId, role: 'assistant', content: text }
                  ];
                  const { error: msgInsertError } = await supabase.from('chat_messages').insert(messagesToInsert);
                  if (msgInsertError) throw msgInsertError;

              } catch (dbError) {
                   console.error(`Database error during chat history saving for chat ${chatId}:`, dbError);
              }
          })().catch(e => console.error("Error in async chat saving:", e));

          // TODO: Implement robust token usage tracking update here if needed
      },
    });

    const headers = new Headers();
    headers.append('X-Chat-ID', chatId);
    return result.toTextStreamResponse({ headers });

  } catch (error: any) {
    console.error("Error processing streaming chat request:", error);
    return NextResponse.json({ error: { message: "Failed to get response from AI assistant." } }, { status: 500 });
  }
}
