import evaluationData from '@/evaluation-questions.json'

export type Option = {
  id: string
  text: string
  aws_resources: string[]
}

export type Question = {
  id: number
  question: string
  category?: string  // Kept in JSON for documentation purposes, but not used in logic
  options: Option[]
}

export const questions: Question[] = evaluationData.audit_questions as Question[]
