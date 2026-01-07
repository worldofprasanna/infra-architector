/**
 * Diagram Generator - Returns paths to static architecture diagrams
 */

import * as fs from 'fs/promises'
import * as path from 'path'

// Template ID to static image filename mapping
const TEMPLATE_TO_STATIC_IMAGE: Record<string, string> = {
  'basic_web_app': 'basic_web_application.png',
  'web_app_with_cdn': 'web_application_with_cdn.png',
  'highly_available_app': 'highly_available_application.png',
  'serverless_hybrid': 'serverless_&_event-driven_architecture.png',
  'enterprise_grade': 'enterprise-grade_infrastructure.png'
}

export interface DiagramGenerationResult {
  success: boolean
  diagramPath?: string
  error?: string
}

/**
 * Get path to static architecture diagram for a given template
 * @param templateId - The template ID (e.g., 'basic_web_app')
 * @returns Path to the static PNG file in public/architectures
 */
export async function generateDiagram(templateId: string): Promise<DiagramGenerationResult> {
  const imageName = TEMPLATE_TO_STATIC_IMAGE[templateId]

  if (!imageName) {
    return {
      success: false,
      error: `Unknown template ID: ${templateId}`
    }
  }

  try {
    // Get absolute path to static image in public directory
    const projectRoot = process.cwd()
    const imagePath = path.join(projectRoot, 'public', 'architectures', imageName)

    // Verify the image file exists
    try {
      await fs.access(imagePath)
    } catch {
      return {
        success: false,
        error: `Static image not found: ${imageName}`
      }
    }

    return {
      success: true,
      diagramPath: imagePath
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to get diagram path: ${error.message || String(error)}`
    }
  }
}

/**
 * Clean up temporary diagram file
 * @param diagramPath - Path to the diagram file
 * Note: This function is now a no-op since we use static images
 */
export async function cleanupDiagram(diagramPath: string): Promise<void> {
  // No cleanup needed for static images
  // This function is kept for backward compatibility
  return Promise.resolve()
}

/**
 * Check if Python and required libraries are available
 * Note: This function is now deprecated since we use static images
 */
export async function checkPythonSetup(): Promise<{ available: boolean; message: string }> {
  // Python is no longer required - we use static images
  return {
    available: true,
    message: 'Using static architecture diagrams - Python is not required'
  }
}
