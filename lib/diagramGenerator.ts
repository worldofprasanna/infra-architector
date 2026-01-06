/**
 * Diagram Generator - Executes Python scripts to generate architecture diagrams
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

// Template ID to Python file mapping
const TEMPLATE_SCRIPT_MAP: Record<string, string> = {
  'basic_web_app': 'templates/basic_web_app.py',
  'web_app_with_cdn': 'templates/web_app_with_cdn.py',
  'highly_available_app': 'templates/highly_available_app.py',
  'serverless_hybrid': 'templates/serverless_hybrid.py',
  'enterprise_grade': 'templates/enterprise_grade.py'
}

// Template ID to expected output filename
const EXPECTED_OUTPUT_MAP: Record<string, string> = {
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
 * Generate architecture diagram for a given template
 * @param templateId - The template ID (e.g., 'basic_web_app')
 * @returns Path to the generated PNG file
 */
export async function generateDiagram(templateId: string): Promise<DiagramGenerationResult> {
  const scriptPath = TEMPLATE_SCRIPT_MAP[templateId]
  const expectedOutput = EXPECTED_OUTPUT_MAP[templateId]

  if (!scriptPath || !expectedOutput) {
    return {
      success: false,
      error: `Unknown template ID: ${templateId}`
    }
  }

  // Create unique temp directory for this generation
  const timestamp = Date.now()
  const tempDir = `/tmp/diagrams-${timestamp}`

  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true })

    // Get absolute path to script
    const projectRoot = process.cwd()
    const absoluteScriptPath = path.join(projectRoot, scriptPath)

    // Check if script exists
    try {
      await fs.access(absoluteScriptPath)
    } catch {
      return {
        success: false,
        error: `Template script not found: ${scriptPath}`
      }
    }

    // Execute Python script from temp directory
    const { stdout, stderr } = await execAsync(
      `cd "${tempDir}" && python3 "${absoluteScriptPath}"`,
      { timeout: 30000 }
    )

    // Check if diagram was generated
    const generatedPath = path.join(tempDir, expectedOutput)
    try {
      await fs.access(generatedPath)
    } catch {
      return {
        success: false,
        error: `Diagram file not generated: ${expectedOutput}`
      }
    }

    return {
      success: true,
      diagramPath: generatedPath
    }
  } catch (error: any) {
    // Clean up temp directory on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {}

    return {
      success: false,
      error: `Failed to generate diagram: ${error.message || String(error)}`
    }
  }
}

/**
 * Clean up temporary diagram file
 * @param diagramPath - Path to the diagram file
 */
export async function cleanupDiagram(diagramPath: string): Promise<void> {
  try {
    // Extract temp directory
    const tempDir = path.dirname(diagramPath)

    // Only delete if it's in /tmp/diagrams-*
    if (tempDir.startsWith('/tmp/diagrams-')) {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  } catch (error) {
    console.error('Error cleaning up diagram:', error)
    // Don't throw - cleanup is not critical
  }
}

/**
 * Check if Python and required libraries are available
 */
export async function checkPythonSetup(): Promise<{ available: boolean; message: string }> {
  try {
    // Check Python
    await execAsync('python3 --version', { timeout: 5000 })

    // Check diagrams library
    const { stdout } = await execAsync('python3 -c "import diagrams"', { timeout: 5000 })

    return {
      available: true,
      message: 'Python environment is ready'
    }
  } catch (error: any) {
    if (error.message.includes('diagrams')) {
      return {
        available: false,
        message: 'Python diagrams library not installed. Run: pip3 install --user diagrams graphviz'
      }
    }
    return {
      available: false,
      message: 'Python3 not found or not configured correctly'
    }
  }
}
