import evaluationData from '@/evaluation-questions.json'

export type Category = string

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export type Option = {
  id: string
  text: string
  score: number
  risk_level: RiskLevel
  analysis: string
}

export type Question = {
  id: number
  question: string
  category: Category
  options: Option[]
}

export type ScoreRange = {
  min: number
  max: number
  category: string
  risk_level: RiskLevel
  description: string
  recommendations: string[]
}

export type ScoringFramework = {
  score_ranges: ScoreRange[]
}

// Load questions from evaluation-questions.json
export const questions: Question[] = evaluationData.audit_questions as Question[]
export const scoringFramework: ScoringFramework = evaluationData.scoring_framework as ScoringFramework

// Get unique categories from the questions
const uniqueCategories = Array.from(new Set(questions.map(q => q.category)))

export const categoryNames: Record<string, string> = uniqueCategories.reduce((acc, category) => {
  acc[category] = category
  return acc
}, {} as Record<string, string>)

// Calculate max score per category based on questions in each category
export const maxScorePerCategory: Record<string, number> = uniqueCategories.reduce((acc, category) => {
  const categoryQuestions = questions.filter(q => q.category === category)
  // Each question has a max score of 100 (the highest option score)
  const maxScore = categoryQuestions.reduce((sum, q) => {
    const maxOptionScore = Math.max(...q.options.map(opt => opt.score))
    return sum + maxOptionScore
  }, 0)
  acc[category] = maxScore
  return acc
}, {} as Record<string, number>)

// Calculate total max score
export const maxTotalScore = Object.values(maxScorePerCategory).reduce((sum, score) => sum + score, 0)

// Helper function to get score range information based on total score
export function getScoreRangeInfo(totalScore: number): ScoreRange | undefined {
  return scoringFramework.score_ranges.find(
    range => totalScore >= range.min && totalScore <= range.max
  )
}
