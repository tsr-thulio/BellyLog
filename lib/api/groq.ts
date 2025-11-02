/**
 * Groq API Client
 * Helper functions for interacting with Groq AI
 */

export interface GroqResponse {
  response: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Execute a prompt using Groq AI
 */
export async function executePrompt(prompt: string): Promise<string> {
  const response = await fetch('/api/groq', {
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

  const data: GroqResponse = await response.json()
  return data.response
}
