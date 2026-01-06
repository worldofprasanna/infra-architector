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
// RESOURCE WEIGHTS - Adjusted for Question Distribution
// ============================================================================

/**
 * Resource-specific weights based on distinctiveness and question availability:
 * - Enterprise resources (Q3 only): 30-35 points - MUST win on single question
 * - Serverless resources (Q4 only): 25-30 points - MUST win on single question
 * - CDN resources (Q5 only): 18-20 points - Strong indicator
 * - HA resources (Q1+Q2): 10-12 points - Can accumulate from multiple Qs
 * - Common resources: 3-8 points - Supporting role
 */
const RESOURCE_WEIGHTS: Record<string, number> = {
  // HIGHEST PRIORITY - Enterprise (Q3 only - needs massive weight)
  'ENTERPRISE': 35,
  'COMPLIANCE_HIPAA': 35,
  'COMPLIANCE_SOC2': 32,
  'VPC': 28,
  'ENCRYPTION': 25,
  'WAF': 20,
  'CLOUDTRAIL': 20,

  // HIGH PRIORITY - Serverless (Q4 only - needs massive weight)
  'LAMBDA': 30,
  'CRITICAL_JOBS': 28,
  'SQS': 25,
  'EVENTBRIDGE': 18,

  // MEDIUM-HIGH - CDN (Q5 only - strong indicator)
  'S3': 20,
  'CLOUDFRONT': 20,
  'HIGH_BANDWIDTH': 15,
  'MIGRATION': 12,

  // MEDIUM - HA indicators (can score from Q1+Q2+Q8)
  'HIGH_AVAILABILITY': 12,
  'MULTI_AZ': 12,
  'AUTO_SCALING': 10,
  'LOAD_BALANCER': 10,
  'HIGH_SCALE': 12,
  'PRODUCTION_READY': 10,
  'REDIS': 10,

  // LOWER - Basic indicators (Q1+Q2+Q6)
  'BASIC_SETUP': 10,
  'SIMPLE_ARCH': 10,
  'LOW_SCALE': 10,
  'SINGLE_INSTANCE': 8,
  'FULLY_MANAGED': 8,
  'MANAGED_SERVICES': 6,

  // SUPPORTING - Common resources (appear in many templates)
  'CLOUDWATCH': 4,
  'SNS': 4,
  'ALERTING': 4,
  '24X7': 5,
  'BACKUP': 4,
  'MEDIUM_SCALE': 8,
  'AWS': 0,  // Everyone prefers AWS, doesn't help differentiate
  'CUSTOM_CONFIG': 3,

  // Default for unlisted resources
  'DEFAULT': 5
}

/**
 * Get weight for a resource
 */
function getResourceWeight(resource: string): number {
  return RESOURCE_WEIGHTS[resource] || RESOURCE_WEIGHTS['DEFAULT']
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
 * NEW Scoring Logic (Resource-Weighted):
 * - REQUIRED resources: Full resource weight (5-35 points)
 * - OPTIONAL resources: 50% of resource weight
 * - EXCLUDED resources: -150% of resource weight (penalty)
 * - Bonus: +30% if ALL required resources matched
 */
function scoreTemplate(
  template: AwsTemplate,
  userResources: string[]
): TemplateMatch {
  let score = 0
  const matchedResources: string[] = []
  let requiredMatches = 0

  // Check required resources (use full weight)
  template.requiredResources.forEach((required) => {
    if (userResources.includes(required)) {
      const weight = getResourceWeight(required)
      score += weight
      matchedResources.push(required)
      requiredMatches++
    }
  })

  // Check optional resources (50% of weight)
  template.optionalResources.forEach((optional) => {
    if (userResources.includes(optional)) {
      const weight = getResourceWeight(optional) * 0.5
      score += weight
      matchedResources.push(optional)
    }
  })

  // Check excluded resources (1.5x penalty)
  template.excludedResources.forEach((excluded) => {
    if (userResources.includes(excluded)) {
      const weight = getResourceWeight(excluded) * 1.5
      score -= weight
    }
  })

  // Bonus: ALL required resources matched = +30% boost
  if (template.requiredResources.length > 0 &&
      requiredMatches === template.requiredResources.length) {
    score *= 1.3
  }

  // Avoid negative scores
  score = Math.max(0, score)

  // Calculate match percentage based on required resources
  const matchPercentage = template.requiredResources.length > 0
    ? Math.round((requiredMatches / template.requiredResources.length) * 100)
    : 100

  return {
    templateId: template.id,
    template,
    matchScore: Math.round(score),
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
