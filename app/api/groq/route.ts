import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/groq
 * Executes a prompt using Groq AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Check for API key
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error('GROQ_API_KEY is not set')
      return NextResponse.json(
        { error: 'Groq API is not configured' },
        { status: 500 }
      )
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: apiKey,
    })

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    })

    // Extract text response
    const response = chatCompletion.choices[0]?.message?.content || ''

    return NextResponse.json(
      {
        response,
        usage: {
          input_tokens: chatCompletion.usage?.prompt_tokens || 0,
          output_tokens: chatCompletion.usage?.completion_tokens || 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error calling Groq API:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to call Groq API',
      },
      { status: 500 }
    )
  }
}
