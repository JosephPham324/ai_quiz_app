export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'written';
  options?: string[]; // 4 options for multiple choice
  correctOptionIndex?: number;
  writtenAnswerReference?: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
}

export interface QuestionBank {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}

export type QuestionComplexity = 'brief' | 'elaborate' | 'practical';

export interface ModelOption {
  id: string;
  name: string;
  inputCost: string;   // per 1M tokens
  outputCost: string;  // per 1M tokens
}

export interface GenerationOptions {
  model: string;
  complexity: QuestionComplexity;
}
