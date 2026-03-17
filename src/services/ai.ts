import type { Question, EvaluationResult } from "../types";

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
The question and answer language must match the language of the input text. If the text is in English, generate questions in English; if it's in Spanish, generate questions in Spanish, etc.
`;

export async function generateQuestionsChunk(text: string, apiKey: string): Promise<Question[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate questions from the following text:\n\n${text}` },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
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
    throw new Error("Invalid JSON format received from AI");
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw error;
  }
}

export async function gradeWrittenAnswer(question: string, reference: string, userAnswer: string, apiKey: string): Promise<EvaluationResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            'You are an expert strict and encouraging grader. You will be provided with a Question, a Reference Answer, and the User\'s Answer. Grade the user answer from 0 to 100 based on how well it covers the key points of the reference answer. Output strict JSON: { "score": number, "feedback": "Brief feedback" } without markdown tags.',
        },
        {
          role: "user",
          content: `Question: ${question}\n\nReference Answer: ${reference}\n\nUser Answer: ${userAnswer}`,
        },
      ],
      temperature: 0.0,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to grade answer`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

export async function evaluatePracticalExample(
  question: string,
  referenceAnswer: string,
  userExample: string,
  apiKey: string,
): Promise<EvaluationResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            'You are an expert at evaluating practical applications of theoretical concepts. You will be provided with a Question, its Reference Answer, and a Practical Example provided by a student. Evaluate if the student\'s example correctly applies the concepts from the question and reference answer. Grade from 0 to 100. Output strict JSON: { "score": number, "feedback": "Brief feedback" } without markdown tags.',
        },
        {
          role: "user",
          content: `Question: ${question}\n\nReference Answer: ${referenceAnswer}\n\nStudent's Practical Example: ${userExample}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to evaluate practical example`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

export async function generateAIExample(
  question: string,
  referenceAnswer: string,
  apiKey: string,
  programmingLanguage?: string,
): Promise<{ example: string }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are an expert educator. Provide a clear, concise, and highly relevant practical example that illustrates the concept in the provided question and answer. Use plain text or code snippets. ${programmingLanguage ? `The code examples MUST be written in ${programmingLanguage}.` : "Prioritize code examples if the question is technical."} Ensure the example directly applies the key points from the reference answer.`,
        },
        {
          role: "user",
          content: `Question: ${question}\n\nReference Answer: ${referenceAnswer}`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate example`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return { example: content || "No example generated." };
}
