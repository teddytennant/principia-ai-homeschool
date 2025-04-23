import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import sss from 'shamirs-secret-sharing';

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
  
  // Combine curriculum content with clear separators, limiting content length
  let context = `\n\nRELEVANT CURRICULUM MATERIALS FOR ${subject.toUpperCase()}:\n\n`;
  
  relevantCurriculum.forEach((item, index) => {
    // Limit content to first 500 characters to prevent overwhelming the AI
    const contentPreview = item.content.length > 500 ? item.content.substring(0, 500) + "..." : item.content;
    context += `DOCUMENT ${index + 1}: ${item.name} ${item.subject ? `(Subject: ${item.subject})` : ''}\n${contentPreview}\n\n`;
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
    console.error('ERROR: Missing critical environment configuration for AI service');
    // Return a generic error response to avoid exposing server configuration details
    return NextResponse.json({ error: 'Server error occurred. Please try again later.' }, { status: 500 });
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

    // Enhanced input sanitization to prevent injection attacks or malicious content.
    // This uses a comprehensive set of regex patterns to strip potentially harmful content from 'message' and 'subject'.
    // Note: This is still a temporary measure and should be replaced with a robust library like sanitize-html or DOMPurify (server-side compatible) for production use.
    const sanitizeInput = (input: string): string => {
      if (!input) return '';
      // Remove HTML tags and inline scripts
      let sanitized = input.replace(/<[^>]*>/g, '');
      // Remove JavaScript event handlers and script content
      sanitized = sanitized.replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '');
      sanitized = sanitized.replace(/javascript\s*:[^'"]*/gi, '');
      // Remove potentially malicious attributes
      sanitized = sanitized.replace(/style\s*=\s*['"][^'"]*['"]/gi, '');
      // Remove special characters except basic punctuation and whitespace
      sanitized = sanitized.replace(/[^\w\s.,!?()-]/g, '');
      // Prevent SQL injection by removing common SQL keywords and patterns (basic protection)
      sanitized = sanitized.replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|WHERE|FROM|JOIN|INNER|OUTER|LEFT|RIGHT|--|;)\b/gi, '');
      // Prevent command injection by removing shell commands and special characters
      sanitized = sanitized.replace(/[`$|&;()<>]/g, '');
      // Limit consecutive whitespace to single space
      sanitized = sanitized.replace(/\s+/g, ' ');
      return sanitized.trim();
    };

    const sanitizedSubject = sanitizeInput(subject);
    // Use sanitizedMessage and sanitizedSubject for further processing.
    // This enhanced sanitization provides better protection but is not a complete solution for production environments.

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
    const systemPrompt = generateSystemPrompt(sanitizedSubject, settings);
    
// Add curriculum context if available
    const curriculumContext = formatCurriculumContext(settings.curriculum, subject, settings.subjects || [{ id: 'general', name: 'General' }]);
    const fullSystemPrompt = systemPrompt + curriculumContext;
    
    console.log("Using System Prompt:", fullSystemPrompt); // Log the system prompt

    // Rough estimate of input text for token limit check (before API call)
    const inputTextForCheck = fullSystemPrompt + message + JSON.stringify(chatHistory);
    
    // Log the size of curriculum data for debugging
    console.log("Curriculum data size:", settings.curriculum.length, "items");
    if (settings.curriculum.length > 0) {
      settings.curriculum.forEach((item: { name: string; content: string }, index: number) => {
        console.log(`Curriculum item ${index + 1}: ${item.name}, Content length: ${item.content.length} characters`);
      });
    }
    console.log("Additional context length:", settings.additionalContext.length, "characters");

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
      console.error('AI Service Error: No response content received from service.');
      return NextResponse.json({ error: 'Server error occurred. Please try again later.' }, { status: 500 });
    }

    // --- BEGIN PROGRESSIVE DISCLOSURE ENGINE ---
    // Inputs: assistantResponse (string), mastery_score (from body), curriculum_tag (from subject)
    const { mastery_score = 0, curriculum_tag = subject, student_id: studentIdOverride } = body;
    const studentId = studentIdOverride || await getStudentId();

    // 1. Tokenize the assistant response (simple whitespace split for demo; replace with real tokenizer for production)
    const tokens = assistantResponse.split(/(\s+)/); // keep whitespace tokens for correct reconstruction

    // 2. Generate a random AES key
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16); // 128-bit IV

    // 3. Encrypt each token separately
    const ciphertexts = tokens.map(token => {
      const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
      let encrypted = cipher.update(token, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    });

    // 4. Split the AES key into 3 shards (2 of 3 needed to reconstruct)
    const shards = sss.split(aesKey, { shares: 3, threshold: 2 });
    // Convert shards to base64 for transport
    const shardsBase64 = shards.map(shard => shard.toString('base64'));

    // 5. Determine which shards to release based on mastery_score
    const unlocked_shards = [];
    if (mastery_score >= 0.10) unlocked_shards.push(1);
    if (mastery_score >= 0.50) unlocked_shards.push(2);
    if (mastery_score >= 0.75) unlocked_shards.push(3);
    // Only send the shards the student is eligible for
    const released_shards = unlocked_shards.map(idx => ({ idx, shard: shardsBase64[idx-1] }));

    // 6. Log every shard release in Supabase Merkle log
    // Fetch previous hash for this student+curriculum_tag
    let prev_hash = null;
    let lastLog = null;
    try {
      const { data: logs, error: logErr } = await supabase
        .from('shard_release_log')
        .select('*')
        .eq('student_id', studentId)
        .eq('curriculum_tag', curriculum_tag)
        .order('timestamp', { ascending: false })
        .limit(1);
      if (!logErr && logs && logs.length > 0) {
        prev_hash = logs[0].merkle_hash;
        lastLog = logs[0];
      }
    } catch (err) { console.warn('Merkle log fetch error', err); }

    const now = new Date().toISOString();
    for (const idx of unlocked_shards) {
      // Merkle hash: hash of (student_id + curriculum_tag + idx + now + prev_hash)
      const dataToHash = `${studentId}|${curriculum_tag}|${idx}|${now}|${prev_hash || ''}`;
      const merkle_hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      // Insert log
      await supabase.from('shard_release_log').insert({
        student_id: studentId,
        curriculum_tag,
        released_shard: idx,
        merkle_hash,
        prev_hash,
        timestamp: now
      });
      prev_hash = merkle_hash;
    }

    // 7. Return ciphertext, unlocked_shards, and curriculum_tag
    return NextResponse.json({
      ciphertext: ciphertexts,
      iv: iv.toString('base64'),
      unlocked_shards: released_shards, // [{idx, shard}]
      curriculum_tag,
      tokens_length: tokens.length
    });
    // --- END PROGRESSIVE DISCLOSURE ENGINE ---

    // Save chat messages to Supabase
    // (old logic moved below progressive disclosure)
    // const studentId = await getStudentId();
    const chatId = req.headers.get('X-Chat-ID') || uuidv4(); // Use a chat ID from header if provided, else generate new
    const userMessage = { role: "user", content: message };
    const aiMessage = { role: "assistant", content: assistantResponse };

    try {
      const { error: userMsgError } = await supabase.from('chat_messages').insert({
        chat_id: chatId,
        student_id: studentId,
        role: userMessage.role,
        content: userMessage.content,
        subject: subject,
      });
      if (userMsgError) {
        console.error('Error saving user message to Supabase:', userMsgError.message);
      }

      const { error: aiMsgError } = await supabase.from('chat_messages').insert({
        chat_id: chatId,
        student_id: studentId,
        role: aiMessage.role,
        content: aiMessage.content,
        subject: subject,
      });
      if (aiMsgError) {
        console.error('Error saving AI message to Supabase:', aiMsgError.message);
      }

      // Save chat metadata if it's a new chat
      if (req.headers.get('X-Chat-ID') === null) {
        const { error: chatError } = await supabase.from('chats').insert({
          id: chatId,
          student_id: studentId,
          title: message.length > 30 ? message.substring(0, 27) + '...' : message,
          subject: subject,
          last_updated: new Date().toISOString(),
        });
        if (chatError) {
          console.error('Error saving chat metadata to Supabase:', chatError.message);
        }
      } else {
        const { error: chatError } = await supabase.from('chats').update({
          last_updated: new Date().toISOString(),
        }).eq('id', chatId);
        if (chatError) {
          console.error('Error updating chat metadata in Supabase:', chatError.message);
        }
      }
    } catch (err) {
      console.error('Error saving chat data to Supabase:', err);
    }

    console.log("Sending response back to client with chat ID:", chatId);
    return NextResponse.json({ message: assistantResponse, chatId: chatId });

  } catch (error) {
    // Log the specific error object
    console.error('API Route Exception:', error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
      console.error('AI Service API Error: Status', error.status || 'unknown', 'occurred');
      errorMessage = 'AI service error. Please try again later.';
      statusCode = error.status ?? 500;
    } else if (error instanceof Error) {
      errorMessage = 'Server error occurred. Please try again later.';
    }

    // Return a generic error to avoid exposing internal details
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
