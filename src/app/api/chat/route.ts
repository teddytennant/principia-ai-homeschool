import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

// Placeholder values - ideally load from env vars

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Helper function to get teacher settings, first trying Supabase based on student-teacher relationship, then falling back to cookies
const getTeacherSettings = async () => {
  try {
    // First, try to get student ID to find associated teacher
    const studentId = await getStudentId();
    if (studentId !== 'default-student') {
      // Fetch teacher ID from teacher_student_relationships table
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('teacher_student_relationships')
        .select('teacher_id, status')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .limit(1);

      if (relationshipError) {
        console.error("Error fetching teacher-student relationship from Supabase:", relationshipError.message);
      } else if (relationshipData && relationshipData.length > 0) {
        const teacherId = relationshipData[0].teacher_id;
        // Fetch teacher settings from a hypothetical teacher_settings table
        const { data: teacherSettingsData, error: teacherSettingsError } = await supabase
          .from('teacher_settings')
          .select('settings')
          .eq('teacher_id', teacherId)
          .limit(1);

        if (teacherSettingsError) {
          console.error("Error fetching teacher settings from Supabase:", teacherSettingsError.message);
        } else if (teacherSettingsData && teacherSettingsData.length > 0 && teacherSettingsData[0].settings) {
          const settings = teacherSettingsData[0].settings;
          console.log("Using teacher settings from Supabase for teacher ID:", teacherId);
          return {
            isAiEnabled: settings.isAiEnabled ?? true,
            aiOpenness: settings.aiOpenness ?? 50,
            gradeLevel: settings.gradeLevel ?? '8',
            curriculum: Array.isArray(settings.curriculum) ? settings.curriculum : [],
            subjects: Array.isArray(settings.subjects) ? settings.subjects : [{ id: 'general', name: 'General' }],
            additionalContext: settings.additionalContext ?? ''
          };
        }
      }
    }

    // Fallback to cookies if Supabase lookup fails or no relationship found
    const cookieStore = await cookies();
    const settingsCookie = cookieStore.get('teacherSettings');
    
    if (settingsCookie) {
      try {
        const parsedSettings = JSON.parse(settingsCookie.value);
        
        // Ensure the parsed settings have the expected structure
        console.log("Using teacher settings from cookies");
        return {
          isAiEnabled: parsedSettings.isAiEnabled ?? true,
          aiOpenness: parsedSettings.aiOpenness ?? 50,
          gradeLevel: parsedSettings.gradeLevel ?? '8',
          curriculum: Array.isArray(parsedSettings.curriculum) ? parsedSettings.curriculum : [],
          subjects: Array.isArray(parsedSettings.subjects) ? parsedSettings.subjects : [{ id: 'general', name: 'General' }],
          additionalContext: parsedSettings.additionalContext ?? ''
        };
      } catch (e) {
        console.error('Error parsing settings cookie:', e);
        // Return default settings if parsing fails
        console.log("Falling back to default settings due to cookie parsing error");
        return {
          isAiEnabled: true,
          aiOpenness: 50,
          gradeLevel: '8',
          curriculum: [],
          subjects: [{ id: 'general', name: 'General' }],
          additionalContext: ''
        };
      }
    }
    
    // Default settings if no cookie exists
    console.log("No teacher settings found, using default settings");
    return {
      isAiEnabled: true,
      aiOpenness: 50,
      gradeLevel: '8',
      curriculum: [],
      subjects: [{ id: 'general', name: 'General' }],
      additionalContext: ''
    };
  } catch (error) {
    console.error('Error getting teacher settings:', error);
    // Return default settings if there's an error
    console.log("Error occurred, falling back to default settings");
    return {
      isAiEnabled: true,
      aiOpenness: 50,
      gradeLevel: '8',
      curriculum: [],
      subjects: [{ id: 'general', name: 'General' }],
      additionalContext: ''
    };
  }
};

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

// Helper function to generate system prompt based on settings
const generateSystemPrompt = (subject: string, settings: TeacherSettings) => {
  // Check if AI is enabled
  if (!settings.isAiEnabled) {
    return "The AI assistant is currently disabled by your teacher. Please try again later or contact your teacher for assistance.";
  }

  // Check if the requested subject is one that the teacher teaches
  const teacherSubjects = settings.subjects || [{ id: 'general', name: 'General' }];
  const isSubjectTaught = teacherSubjects.some((s) => s.id === subject);
  const subjectObj = teacherSubjects.find((s) => s.id === subject);
  const subjectName = subjectObj ? subjectObj.name : subject;

  // Base prompt
  let systemPrompt = "You are Principia AI, a helpful learning assistant designed for school use.";
  
  // Add grade level context
  const gradeLevel = settings.gradeLevel;
  if (gradeLevel) {
    if (gradeLevel === 'k') {
      systemPrompt += " You are assisting kindergarten students, so use simple language and concepts appropriate for 5-6 year olds.";
    } else if (gradeLevel === 'higher_ed') {
      systemPrompt += " You are assisting college/university students, so you can use advanced concepts and terminology.";
    } else {
      systemPrompt += ` You are assisting ${gradeLevel}th grade students, so adjust your language and concepts appropriately for their age group.`;
    }
  }
  
  // Adjust teaching style based on openness setting
  const aiOpenness = settings.aiOpenness || 50;
  if (aiOpenness < 20) {
    systemPrompt += " Use a strongly Socratic approach. Primarily ask guiding questions and avoid giving direct answers. Focus on helping students discover answers themselves through critical thinking. Do not include phrases like 'Pause for student response' or guide towards specific ideas like ethics or morality. Keep responses concise.";
  } else if (aiOpenness < 40) {
    systemPrompt += " Use a mostly Socratic approach. Favor questions but offer hints when students are struggling. Guide students toward answers rather than providing them directly. Do not include phrases like 'Pause for student response' or guide towards specific ideas like ethics or morality. Keep responses concise.";
  } else if (aiOpenness < 60) {
    systemPrompt += " Balance Socratic questioning with direct instruction. Mix questions with explanations to help students understand concepts while still encouraging critical thinking. Do not include phrases like 'Pause for student response' or guide towards specific ideas like ethics or morality. Keep responses concise.";
  } else if (aiOpenness < 80) {
    systemPrompt += " Provide mostly direct explanations but encourage reflection. Offer clear answers and explanations, but still ask questions to check understanding and promote deeper thinking. Do not include phrases like 'Pause for student response' or guide towards specific ideas like ethics or morality. Keep responses concise.";
  } else {
    systemPrompt += " Provide direct answers and thorough explanations. Focus on clarity and completeness in your responses, while still maintaining an educational tone. Do not include phrases like 'Pause for student response' or guide towards specific ideas like ethics or morality. Keep responses concise.";
  }
  
  // Add subject-specific context only if the teacher teaches this subject
  if (isSubjectTaught && subject !== 'general') {
    systemPrompt += ` Focus the discussion on the subject of ${subjectName}.`;
  }
  
  // Add teacher's additional context if available, prioritizing subject-specific context
  if (settings.subjectContext && settings.subjectContext[subject] && settings.subjectContext[subject].trim()) {
    systemPrompt += `\n\nADDITIONAL TEACHER INSTRUCTIONS FOR ${subjectName.toUpperCase()}:\n${settings.subjectContext[subject].trim()}`;
  } else if (settings.additionalContext && settings.additionalContext.trim()) {
    systemPrompt += `\n\nADDITIONAL TEACHER INSTRUCTIONS:\n${settings.additionalContext.trim()}`;
  }
  
  return systemPrompt;
};

// Helper function to format curriculum content for context, only if subject matches
const formatCurriculumContext = (curriculum: Array<{ name: string; content: string, subject?: string }>, subject: string, teacherSubjects: Array<{ id: string; name: string }>) => {
  if (!curriculum || curriculum.length === 0) {
    return "";
  }
  
  // Check if the teacher teaches this specific subject
  const isSubjectTaught = teacherSubjects.some((s) => s.id === subject);
  if (!isSubjectTaught) {
    return "";
  }
  
  // Filter curriculum by subject if specified, otherwise include all for the subject
  const relevantCurriculum = curriculum.filter(item => !item.subject || item.subject === subject || item.subject === 'general');
  
  if (relevantCurriculum.length === 0) {
    return "";
  }
  
  // Combine curriculum content with clear separators
  let context = `\n\nRELEVANT CURRICULUM MATERIALS FOR ${subject.toUpperCase()}:\n\n`;
  
  relevantCurriculum.forEach((item, index) => {
    context += `DOCUMENT ${index + 1}: ${item.name} ${item.subject ? `(Subject: ${item.subject})` : ''}\n${item.content}\n\n`;
  });
  
  context += "Use the above curriculum materials as context for your responses when relevant.\n";
  
  return context;
};

// Placeholder for student token usage tracking (in a real scenario, this would be a database)
const studentTokenUsage: { [studentId: string]: { inputTokens: number; outputTokens: number; totalCost: number } } = {};

// Helper function to calculate token count from a string (rough estimate)
const countTokens = (text: string): number => {
  // Rough estimation: 1 token per 4 characters
  return Math.ceil(text.length / 4);
};

// Helper function to get student ID from cookies or auth
const getStudentId = async (): Promise<string> => {
  try {
    // First, try to get student ID from auth user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user for student ID:", error.message);
    } else if (user) {
      console.log("Using student ID from auth:", user.id);
      return user.id;
    }
    
    // Fallback to cookies if auth fails
    const cookieStore = await cookies();
    const studentId = cookieStore.get('studentId')?.value || 'default-student';
    console.log("Using student ID from cookies or default:", studentId);
    return studentId;
  } catch (err) {
    console.error("Error getting student ID:", err);
    return 'default-student';
  }
};

// Helper function to check and update token usage for a student
const checkAndUpdateTokenUsage = async (inputText: string, outputText: string): Promise<{ allowed: boolean; message?: string }> => {
  const studentId = await getStudentId();
  const inputTokens = countTokens(inputText);
  const outputTokens = countTokens(outputText);
  
  // Cost calculation: $0.1 per million input tokens, $0.4 per million output tokens
  const inputCost = (inputTokens / 1000000) * 0.1;
  const outputCost = (outputTokens / 1000000) * 0.4;
  const requestCost = inputCost + outputCost;
  
  // Initialize or update student usage
  if (!studentTokenUsage[studentId]) {
    studentTokenUsage[studentId] = { inputTokens: 0, outputTokens: 0, totalCost: 0 };
  }
  
  const currentUsage = studentTokenUsage[studentId];
  const newTotalCost = currentUsage.totalCost + requestCost;
  
  // Check against limit of $0.50 per student
  if (newTotalCost > 0.5) {
    return { allowed: false, message: `Token limit exceeded. You've reached the maximum cost of $0.50 per student. Current cost would be $${newTotalCost.toFixed(4)}.` };
  }
  
  // Update usage if within limit
  currentUsage.inputTokens += inputTokens;
  currentUsage.outputTokens += outputTokens;
  currentUsage.totalCost = newTotalCost;
  
  console.log(`Student ${studentId} token usage: Input=${currentUsage.inputTokens}, Output=${currentUsage.outputTokens}, Cost=$${currentUsage.totalCost.toFixed(4)}`);
  return { allowed: true };
};

export async function POST(req: NextRequest) {
  // Move API Key check inside the function
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('ERROR: Missing environment variable OPENROUTER_API_KEY');
    // Return an error response immediately if the key is missing server-side
    return NextResponse.json({ error: 'Server configuration error: API key missing.' }, { status: 500 });
  }
  console.log("API route received POST request"); // Log request entry
  try {
    const body = await req.json();
    // Destructure history along with message and subject
    const { message, subject, history } = body; 
    // Add basic validation for history (optional, but good practice)
    const chatHistory = Array.isArray(history) ? history : []; 
    console.log("Request body:", { message, subject, history: chatHistory }); // Log parsed body, including history

    if (!message || !subject) {
        console.error('Validation Error: Missing message or subject', body);
        return NextResponse.json({ error: 'Message and subject are required' }, { status: 400 });
    }

    // Enforce a character limit of 2000 for the message
    const characterLimit = 2000;
    if (message.length > characterLimit) {
        console.error('Validation Error: Message exceeds character limit', { length: message.length, limit: characterLimit });
        return NextResponse.json({ error: 'Your message is too long. Please keep it under 2000 characters.' }, { status: 400 });
    }

    // Get teacher settings from cookies
    const settings = await getTeacherSettings();
    console.log("Teacher settings:", settings);

    // Check if AI is disabled
    if (!settings.isAiEnabled) {
      return NextResponse.json({ 
        content: "The AI assistant is currently disabled by your teacher. Please try again later or contact your teacher for assistance." 
      });
    }

    // Generate system prompt based on settings
    const systemPrompt = generateSystemPrompt(subject, settings);
    
// Add curriculum context if available
    const curriculumContext = formatCurriculumContext(settings.curriculum, subject, settings.subjects || [{ id: 'general', name: 'General' }]);
    const fullSystemPrompt = systemPrompt + curriculumContext;
    
    console.log("Using System Prompt:", fullSystemPrompt); // Log the system prompt

    // Rough estimate of input text for token limit check (before API call)
    const inputTextForCheck = fullSystemPrompt + message + JSON.stringify(chatHistory);
    
    // Call OpenRouter API with Gemini 2.0 Flash
    console.log("Calling OpenRouter API (Gemini 2.0 Flash)...");
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5", // Updated to Gemini 2.0 Flash
      messages: [
        { role: "system", content: fullSystemPrompt },
        // Spread the received chat history here
        ...chatHistory, 
        // Add the latest user message
        { role: "user", content: message },
      ],
      temperature: 0.7,
      // Removed extra_headers due to TypeScript type conflicts.
      // These headers are optional for OpenRouter ranking.
    });
    console.log("OpenRouter API response received."); // Log successful API call

    const assistantResponse = completion.choices[0]?.message?.content;

    if (!assistantResponse) {
      // Log the full completion object if response content is missing
      console.error('OpenRouter Error: No response content received. Full completion:', JSON.stringify(completion, null, 2));
      return NextResponse.json({ error: 'Failed to get valid response content from AI model' }, { status: 500 });
    }

    // Check token usage and cost limit after receiving response
    const tokenCheck = await checkAndUpdateTokenUsage(inputTextForCheck, assistantResponse);
    if (!tokenCheck.allowed) {
      return NextResponse.json({ error: tokenCheck.message || 'Token limit exceeded for this student.' }, { status: 402 });
    }

    console.log("Sending response back to client.");
    return NextResponse.json({ message: assistantResponse });

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
