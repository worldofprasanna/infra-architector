import evaluationData from '@/evaluation-questions.json'

// ============================================================================
// NEW TYPE DEFINITIONS (Architecture-focused)
// ============================================================================

export type Option = {
  id: string
  text: string
  aws_resources: string[]
}

export type Question = {
  id: number
  question: string
  category?: string  // Optional: for grouping/display purposes
  options: Option[]
}

// Load questions from evaluation-questions.json
export const questions: Question[] = evaluationData.audit_questions as Question[]

// Get unique categories from the questions (for display purposes)
const uniqueCategories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)))

export const categoryNames: Record<string, string> = uniqueCategories.reduce((acc, category) => {
  if (category) {
    acc[category] = category
  }
  return acc
}, {} as Record<string, string>)
