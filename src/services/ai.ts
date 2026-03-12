import type { Question } from '../types';

const SYSTEM_PROMPT = `
You are an expert quiz generator. Your task is to analyze the provided text and strictly output ONLY a valid JSON object with a "questions" array.
Each question MUST follow this JSON structure:
{
  "questions": [
    {
      "id": "A unique string ID",
      "text": "The question text",
      "type": "multiple-choice", // Common format for multiple-choice/written
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0, // 0-3
      "writtenAnswerReference": "The comprehensive reference answer for written/essay grading"
    }
  ]
}

Ensure you generate 3-5 high-quality questions per chunk of context.
Return ONLY the JSON object, without any markdown formatting.
`;

export async function generateQuestionsChunk(text: string, apiKey: string): Promise<Question[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Cost efficient model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate questions from the following text:\n\n${text}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API Error: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions;
    }
    if (Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error('Invalid JSON format received from AI');
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw error;
  }
}

export async function gradeWrittenAnswer(question: string, reference: string, userAnswer: string, apiKey: string): Promise<{ score: number, feedback: string }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert strict and encouraging grader. You will be provided with a Question, a Reference Answer, and the User\'s Answer. Grade the user answer from 0 to 100 based on how well it covers the key points of the reference answer. Output strict JSON: { "score": number, "feedback": "Brief feedback" } without markdown tags.'
        },
        { 
          role: 'user', 
          content: `Question: ${question}\n\nReference Answer: ${reference}\n\nUser Answer: ${userAnswer}` 
        }
      ],
      temperature: 0.0,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to grade answer`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}
