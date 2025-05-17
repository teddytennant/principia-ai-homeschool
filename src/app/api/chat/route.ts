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
// Re-enable MGPD imports
import { getTier, MGPD_THRESHOLDS } from '@/lib/mgpd'; // Import getTier and thresholds
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


// Helper function to fetch mastery score
const getMasteryScore = async (studentId: string, subjectId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('student_mastery')
      .select('mastery_score')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'not found' error
      console.error(`Error fetching mastery score for student ${studentId}, subject ${subjectId}:`, error.message);
      return 0.0; // Default to lowest score on error
    }
    return data?.mastery_score ?? 0.0; // Return score or default 0.0 if not found
  } catch (err) {
    console.error('Unexpected error in getMasteryScore:', err);
    return 0.0;
  }
};


// Helper function to generate system prompt based on settings AND mastery tier
const generateSystemPrompt = (subject: string, settings: TeacherSettings, masteryTier: number): string => {
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
  else if (generalContext) systemPrompt += `\n\nADDITIONAL PARENT INSTRUCTIONS:\n${generalContext}`; // Changed Teacher to Parent

  // Add MGPD instructions based on tier
  systemPrompt += "\n\nMASTERY-GUIDED INSTRUCTIONS:";
  switch (masteryTier) {
      case 0: // Below HINTS threshold
          systemPrompt += ` The student is just beginning with this topic (${subjectName}). Focus on providing hints and asking guiding questions. Avoid giving direct answers or full examples initially. Encourage exploration and critical thinking.`;
          break;
      case 1: // Below EXAMPLES threshold
          systemPrompt += ` The student has some basic understanding of ${subjectName}. You can start introducing simple examples alongside hints and questions. Still avoid revealing full solutions directly.`;
          break;
      case 2: // Below SOLUTIONS threshold
          systemPrompt += ` The student has a moderate grasp of ${subjectName}. You can provide more detailed examples and partial solutions. Guide them towards completing the solution themselves.`;
          break;
      case 3: // Above SOLUTIONS threshold
          systemPrompt += ` The student has demonstrated good understanding of ${subjectName}. You can provide direct answers, full solutions, and discuss more complex aspects of the topic. Challenge them with advanced questions.`;
          break;
      default:
          systemPrompt += " Assess the student's understanding and respond appropriately."; // Fallback
  }

  return systemPrompt;
};

// Helper function to format curriculum content for context
const formatCurriculumContext = (curriculum: Array<{ name: string; content: string, subject?: string }>, subject: string, teacherSubjects: Array<{ id: string; name: string }>): string => {
    if (!curriculum || curriculum.length === 0) return "";
    const isSubjectTaught = teacherSubjects.some((s) => s.id === subject);
    if (!isSubjectTaught && subject !== 'general') return "";
    const relevantCurriculum = curriculum.filter(item => !item.subject || item.subject === subject || item.subject === 'general');
    if (relevantCurriculum.length === 0) return "";
    let context = `\n\nRELEVANT CURRICULUM SUMMARIES FOR ${subject.toUpperCase()}:\n\n`; // Changed title
    relevantCurriculum.forEach((item, index) => {
        // Use the full item.content, as it now contains the summary generated during upload
        context += `SUMMARY OF DOCUMENT ${index + 1}: ${item.name} ${item.subject ? `(Subject: ${item.subject})` : ''}\n${item.content}\n\n`; // Use item.content directly
    });
    context += "Use the above curriculum summaries as context for your responses when relevant.\n"; // Updated instruction
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
      return NextResponse.json({ error: { message: "The AI assistant is currently disabled by the parent." } }, { status: 403 }); // Changed teacher to parent
    }

    // Fetch mastery score and determine tier
    const masteryScore = await getMasteryScore(studentId, subject);
    const masteryTier = getTier(masteryScore);
    console.log(`Student ${studentId}, Subject ${subject}: Mastery Score = ${masteryScore}, Tier = ${masteryTier}`);

    // Generate system prompt including MGPD instructions
    const systemPrompt = generateSystemPrompt(subject, settings, masteryTier);
    const curriculumContext = formatCurriculumContext(settings.curriculum, subject, settings.subjects);
    const fullSystemPrompt = systemPrompt + curriculumContext;

    // TODO: Implement logic to update mastery score based on interaction analysis after response.
    // This might involve calling another service or function.

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

           // Save messages and update mastery score asynchronously
           (async () => {
               try {
                   // 1. Save Chat Messages
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

                   // 2. Update Mastery Score (Placeholder Logic)
                   // TODO: Replace this placeholder with actual mastery assessment logic.
                   // This might involve calling another AI model or service to evaluate the interaction.
                   try {
                       const currentScore = await getMasteryScore(studentId, subject);
                       // Simple heuristic: Increase score slightly, max 1.0
                       const scoreIncrement = 0.02; // Adjust as needed
                       const newScore = Math.min(currentScore + scoreIncrement, 1.0);

                       if (newScore > currentScore) { // Only update if score increased
                           const { error: rpcError } = await supabase.rpc('upsert_student_mastery', {
                               p_student_id: studentId,
                               p_subject_id: subject,
                               p_new_score: newScore
                           });
                           if (rpcError) {
                               console.error(`Error updating mastery score via RPC for student ${studentId}, subject ${subject}:`, rpcError.message);
                           } else {
                               console.log(`Updated mastery score for student ${studentId}, subject ${subject} to ${newScore}`);
                           }
                       }
                   } catch (masteryUpdateError) {
                       console.error(`Error during mastery score update for student ${studentId}, subject ${subject}:`, masteryUpdateError);
                   }

               } catch (dbError) {
                   console.error(`Database error during chat history saving or mastery update for chat ${chatId}:`, dbError);
               }
           })().catch(e => console.error("Error in async chat saving/mastery update:", e));

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
