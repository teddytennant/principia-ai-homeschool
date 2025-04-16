import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Placeholder values - ideally load from env vars

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Helper function to get teacher settings from cookies
const getTeacherSettings = async () => {
  try {
    const cookieStore = await cookies();
    const settingsCookie = cookieStore.get('teacherSettings');
    
    if (settingsCookie) {
      try {
        const parsedSettings = JSON.parse(settingsCookie.value);
        
        // Ensure the parsed settings have the expected structure
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
    return {
      isAiEnabled: true,
      aiOpenness: 50,
      gradeLevel: '8',
      curriculum: [],
      subjects: [{ id: 'general', name: 'General' }],
      additionalContext: ''
    };
  } catch (error) {
    console.error('Error parsing teacher settings:', error);
    // Return default settings if there's an error
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

// Helper function to generate system prompt based on settings
const generateSystemPrompt = (subject: string, settings: unknown) => {
  // Check if AI is enabled
  if (!settings.isAiEnabled) {
    return "The AI assistant is currently disabled by your teacher. Please try again later or contact your teacher for assistance.";
  }

  // Check if the requested subject is one that the teacher teaches
  const teacherSubjects = settings.subjects || [{ id: 'general', name: 'General' }];
  const isSubjectTaught = subject === 'general' || teacherSubjects.some((s: { id: string }) => s.id === subject || s.id === 'general');
  
  // If the subject is not taught by the teacher, default to general
  const effectiveSubject = isSubjectTaught ? subject : 'general';
  const subjectName = effectiveSubject === 'general' ? 'General' : 
    teacherSubjects.find((s: { id: string, name: string }) => s.id === effectiveSubject)?.name || effectiveSubject;

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
    systemPrompt += " Use a strongly Socratic approach. Primarily ask guiding questions and avoid giving direct answers. Focus on helping students discover answers themselves through critical thinking.";
  } else if (aiOpenness < 40) {
    systemPrompt += " Use a mostly Socratic approach. Favor questions but offer hints when students are struggling. Guide students toward answers rather than providing them directly.";
  } else if (aiOpenness < 60) {
    systemPrompt += " Balance Socratic questioning with direct instruction. Mix questions with explanations to help students understand concepts while still encouraging critical thinking.";
  } else if (aiOpenness < 80) {
    systemPrompt += " Provide mostly direct explanations but encourage reflection. Offer clear answers and explanations, but still ask questions to check understanding and promote deeper thinking.";
  } else {
    systemPrompt += " Provide direct answers and thorough explanations. Focus on clarity and completeness in your responses, while still maintaining an educational tone.";
  }
  
  // Add subject-specific context
  if (effectiveSubject && effectiveSubject !== 'general') {
    systemPrompt += ` Focus the discussion on the subject of ${subjectName}.`;
  }
  
  // Add teacher's additional context if available
  if (settings.additionalContext && settings.additionalContext.trim()) {
    systemPrompt += `\n\nADDITIONAL TEACHER INSTRUCTIONS:\n${settings.additionalContext.trim()}`;
  }
  
  return systemPrompt;
};

// Helper function to format curriculum content for context
const formatCurriculumContext = (curriculum: unknown[]) => {
  if (!curriculum || curriculum.length === 0) {
    return "";
  }
  
  // Combine curriculum content with clear separators
  let context = "\n\nRELEVANT CURRICULUM MATERIALS:\n\n";
  
  curriculum.forEach((item, index) => {
    context += `DOCUMENT ${index + 1}: ${item.name}\n${item.content}\n\n`;
  });
  
  context += "Use the above curriculum materials as context for your responses when relevant.\n";
  
  return context;
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
    const curriculumContext = formatCurriculumContext(settings.curriculum);
    const fullSystemPrompt = systemPrompt + curriculumContext;
    
    console.log("Using System Prompt:", fullSystemPrompt); // Log the system prompt

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
