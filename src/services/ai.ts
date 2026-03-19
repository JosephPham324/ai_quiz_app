import type { Question, EvaluationResult, GenerationOptions } from "../types";

const BASE_JSON_FORMAT = `
Each question MUST follow this JSON structure:
{
  "questions": [
    {
      "id": "A unique string ID",
      "text": "The question text",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "writtenAnswerReference": "The comprehensive reference answer for written/essay grading"
    }
  ]
}
Return ONLY the JSON object, without any markdown formatting.
The question and answer language must match the language of the input text.
`;

const COMPLEXITY_PROMPTS: Record<string, string> = {
  brief: `You are an expert quiz generator. Analyze the provided text and generate concise questions that test core ideas and key concepts. Keep question text short and focused. Answer options should be brief and to the point. Written answer references should be concise summaries of the main idea.`,
  elaborate: `You are an expert quiz generator. Analyze the provided text and generate in-depth questions with detailed, longer answer choices. Each multiple-choice option should be a thorough explanation (1-2 sentences each) so the learner gains knowledge even by reading the options. Written answer references should be comprehensive and cover nuances.`,
  practical: `You are an expert quiz generator. Analyze the provided text and generate questions about PRACTICAL APPLICATIONS of the concepts described. Instead of asking what the text says, ask how these concepts would be applied in real-world scenarios, problem-solving situations, or practical use cases. Written answer references should describe practical implementations.`,
};

function buildSystemPrompt(complexity: string): string {
  const complexityInstruction = COMPLEXITY_PROMPTS[complexity] || COMPLEXITY_PROMPTS.brief;
  return `${complexityInstruction}

Strictly output ONLY a valid JSON object with a "questions" array.
${BASE_JSON_FORMAT}
Ensure you generate 3-5 high-quality questions per chunk of context.`;
}

export async function generateQuestionsChunk(
  text: string,
  apiKey: string,
  options?: GenerationOptions,
): Promise<Question[]> {
  const model = options?.model || "gpt-4.1-nano";
  const complexity = options?.complexity || "brief";
  const systemPrompt = buildSystemPrompt(complexity);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
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
