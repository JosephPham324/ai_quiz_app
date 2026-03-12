export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'written';
  options?: string[]; // 4 options for multiple choice
  correctOptionIndex?: number;
  writtenAnswerReference?: string;
}

export interface QuestionBank {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}
