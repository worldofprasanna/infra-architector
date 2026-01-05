/**
 * TEMPLATE SELECTOR - Simple & Efficient
 *
 * Selects the best AWS architecture template based on user's answers.
 * Uses a straightforward scoring system - counts matching resources.
 */

import { Question, Option } from '@/data/questions'
import { AWS_TEMPLATES, AwsTemplate } from './templates'

export type TemplateMatch = {
  templateId: string
  template: AwsTemplate
  matchScore: number
  matchPercentage: number
  matchedResources: string[]
  userResources: string[]
}

// ============================================================================
// MAIN TEMPLATE SELECTION FUNCTION
// ============================================================================

/**
 * Select the best template based on user's answers
 *
 * Algorithm:
 * 1. Collect all aws_resources from user's selected answers
 * 2. For each template, calculate match score
 * 3. Return template with highest score
 */
export function selectTemplate(
  answers: Record<number, string>,
  questions: Question[]
): TemplateMatch {
  // Step 1: Collect all aws_resources from user's answers
  const userResources = collectUserResources(answers, questions)

  // Step 2: Score each template
  const templateScores = scoreAllTemplates(userResources)

  // Step 3: Find best match
  const bestMatch = templateScores.reduce((best, current) =>
    current.matchScore > best.matchScore ? current : best
  )

  return bestMatch
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Collect all aws_resources from user's selected answers
 */
function collectUserResources(
  answers: Record<number, string>,
  questions: Question[]
): string[] {
  const resources: string[] = []

  questions.forEach((question) => {
    const selectedOptionId = answers[question.id]
    if (!selectedOptionId) return

    const selectedOption = question.options.find(
      (opt) => opt.id === selectedOptionId
    )

    if (selectedOption && selectedOption.aws_resources) {
      resources.push(...selectedOption.aws_resources)
    }
  })

  // Return unique resources
  return Array.from(new Set(resources))
}

/**
 * Score all templates against user's resources
 */
function scoreAllTemplates(userResources: string[]): TemplateMatch[] {
  const matches: TemplateMatch[] = []

  Object.values(AWS_TEMPLATES).forEach((template) => {
    const match = scoreTemplate(template, userResources)
    matches.push(match)
  })

  return matches
}

/**
 * Score a single template against user's resources
 *
 * Scoring Logic:
 * - +10 points for each REQUIRED resource matched
 * - +5 points for each OPTIONAL resource matched
 * - -20 points for each EXCLUDED resource present
 */
function scoreTemplate(
  template: AwsTemplate,
  userResources: string[]
): TemplateMatch {
  let score = 0
  const matchedResources: string[] = []

  // Check required resources (heavy weight)
  template.requiredResources.forEach((required) => {
    if (userResources.includes(required)) {
      score += 10
      matchedResources.push(required)
    }
  })

  // Check optional resources (moderate weight)
  template.optionalResources.forEach((optional) => {
    if (userResources.includes(optional)) {
      score += 5
      matchedResources.push(optional)
    }
  })

  // Check excluded resources (penalty)
  template.excludedResources.forEach((excluded) => {
    if (userResources.includes(excluded)) {
      score -= 20
    }
  })

  // Avoid negative scores
  score = Math.max(0, score)

  // Calculate match percentage
  const totalPossibleScore =
    template.requiredResources.length * 10 +
    template.optionalResources.length * 5
  const matchPercentage = totalPossibleScore > 0
    ? Math.round((score / totalPossibleScore) * 100)
    : 0

  return {
    templateId: template.id,
    template,
    matchScore: score,
    matchPercentage,
    matchedResources,
    userResources
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all template matches sorted by score (for debugging)
 */
export function getAllTemplateMatches(
  answers: Record<number, string>,
  questions: Question[]
): TemplateMatch[] {
  const userResources = collectUserResources(answers, questions)
  const matches = scoreAllTemplates(userResources)

  // Sort by score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Validate that template selection makes sense
 */
export function validateTemplateSelection(match: TemplateMatch): {
  valid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check if match score is very low
  if (match.matchScore < 10) {
    warnings.push(
      "Low confidence in template match. User requirements may not fit any standard template."
    )
  }

  // Check if user selected GCP/Azure but we're giving AWS
  if (
    match.userResources.includes("GCP_PREFERRED") ||
    match.userResources.includes("AZURE_PREFERRED")
  ) {
    warnings.push(
      "User prefers GCP/Azure but only AWS templates available. Consider mentioning this limitation."
    )
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

/**
 * Get human-readable explanation of why template was selected
 */
export function getSelectionReason(match: TemplateMatch): string {
  const reasons: string[] = []

  // Analyze matched resources
  if (match.matchedResources.includes("ENTERPRISE")) {
    reasons.push("Enterprise-grade security and compliance requirements detected")
  }

  if (match.matchedResources.includes("HIGH_SCALE") || match.matchedResources.includes("MULTI_AZ")) {
    reasons.push("High availability and scalability needs identified")
  }

  if (match.matchedResources.includes("LAMBDA") || match.matchedResources.includes("SQS")) {
    reasons.push("Background jobs and event-driven architecture required")
  }

  if (match.matchedResources.includes("S3") || match.matchedResources.includes("CLOUDFRONT")) {
    reasons.push("Media storage and CDN capabilities needed")
  }

  if (match.matchedResources.includes("SIMPLE_ARCH") || match.matchedResources.includes("BASIC_SETUP")) {
    reasons.push("Simple, cost-effective architecture for early-stage application")
  }

  if (reasons.length === 0) {
    return "Best fit based on overall requirements"
  }

  return reasons.join("; ")
}

/**
 * Format user resources as readable list
 */
export function formatUserResources(resources: string[]): string {
  return resources.join(", ")
}
