/**
 * Claude API Client
 * Helper functions for interacting with Claude AI
 */

export interface ClaudeResponse {
  response: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Execute a prompt using Claude AI
 */
export async function executePrompt(prompt: string): Promise<string> {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to execute prompt')
  }

  const data: ClaudeResponse = await response.json()
  return data.response
}
