'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Slide,
  Avatar,
  Button,
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { executePrompt as executeGroqPrompt } from '@/lib/api/groq'
import { Profile } from '@/lib/api/profile'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n/config'

const MIN_WIDTH = 300
const MIN_HEIGHT = 400
const MAX_WIDTH = 800
const MAX_HEIGHT = 900
const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 600

interface ChatBotProps {
  profile: Profile | null
  pregnancyWeeks: number
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  summary?: string
  fullText?: string
}

export default function ChatBot({ profile, pregnancyWeeks }: ChatBotProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH)
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT)
  const [isResizing, setIsResizing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: '', // Will be set by useEffect
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => [
      {
        ...prev[0],
        text: t('chatbot.welcome'),
      },
      ...prev.slice(1),
    ])
  }, [t])

  // Load saved chat size from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('chatBotWidth')
    const savedHeight = localStorage.getItem('chatBotHeight')
    if (savedWidth) setChatWidth(parseInt(savedWidth))
    if (savedHeight) setChatHeight(parseInt(savedHeight))
  }, [])

  // Handle resize drag
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: chatWidth,
      height: chatHeight,
    }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return

      const deltaX = resizeStartRef.current.x - e.clientX
      const deltaY = resizeStartRef.current.y - e.clientY

      const newWidth = Math.min(
        Math.max(resizeStartRef.current.width + deltaX, MIN_WIDTH),
        MAX_WIDTH
      )
      const newHeight = Math.min(
        Math.max(resizeStartRef.current.height + deltaY, MIN_HEIGHT),
        MAX_HEIGHT
      )

      setChatWidth(newWidth)
      setChatHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeStartRef.current = null
      // Save to localStorage
      localStorage.setItem('chatBotWidth', chatWidth.toString())
      localStorage.setItem('chatBotHeight', chatHeight.toString())
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, chatWidth, chatHeight])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Build profile context
      const profileContext = profile
        ? `
User Profile Context:
- Current pregnancy week: ${pregnancyWeeks}
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}
- Medications: ${profile.medications || 'None'}
- Activity level: ${profile.activity_level || 'Not specified'}
- Weight category: ${profile.weight_category || 'Not specified'}
- Dietary restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Food allergies: ${profile.food_allergies || 'None'}
- Blood type: ${profile.blood_type || 'Not specified'}
- Work physical demand: ${profile.work_physical_demand || 'Not specified'}
- Has exercise restrictions: ${profile.has_exercise_restrictions ? 'Yes' : 'No'}
- Exercise restrictions details: ${profile.exercise_restrictions_details || 'None'}
- Previous pregnancy complications: ${profile.previous_pregnancy_complications?.join(', ') || 'None'}
- Conception type: ${profile.conception_type || 'Not specified'}
`
        : 'No profile information available.'

      const prompt = `You are a knowledgeable, warm, and supportive pregnancy assistant. Answer the following question from a pregnant woman based on her profile information.

${profileContext}

User Question: ${userMessage.text}

CRITICAL: Detect the language of the user's question and respond in THE SAME LANGUAGE. If the question is in Portuguese, answer in Portuguese. If in English, answer in English. If in Spanish, answer in Spanish, etc.

Provide TWO versions of your response in the SAME LANGUAGE as the question:
1. A brief summary (1-2 sentences) - quick answer to the question
2. A detailed response (2-4 paragraphs) - comprehensive information with context, tips, and personalized advice

Be warm and supportive. If the question is about medical concerns, remind the user to consult with their healthcare provider in the detailed response.

IMPORTANT: Respond with ONLY a JSON object in this format:
{"summary":"Brief 1-2 sentence answer here IN THE USER'S LANGUAGE","full":"Detailed 2-4 paragraph response here IN THE USER'S LANGUAGE"}

No other text, no markdown, just the JSON object. Remember to use the SAME LANGUAGE as the user's question.`

      const response = await executeGroqPrompt(prompt)
      console.log('ChatBot raw response:', response)

      // Clean and parse response
      let cleanedResponse = response.trim()

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')

      // Try to find JSON object
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }

      const parsedResponse = JSON.parse(cleanedResponse)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: parsedResponse.summary || parsedResponse.full || response.trim(),
        summary: parsedResponse.summary,
        fullText: parsedResponse.full,
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('ChatBot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chatbot.error'),
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(messageId)) {
        newExpanded.delete(messageId)
      } else {
        newExpanded.add(messageId)
      }
      return newExpanded
    })
  }

  return (
    <>
      {/* Chat Container */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: { xs: 'calc(100% - 48px)', sm: `${chatWidth}px` },
            height: { xs: 'calc(100vh - 150px)', sm: `${chatHeight}px` },
            maxHeight: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
            userSelect: isResizing ? 'none' : 'auto',
          }}
        >
          {/* Resize Handle */}
          <Box
            onMouseDown={handleResizeStart}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 40,
              height: 40,
              cursor: 'nwse-resize',
              zIndex: 10,
              display: { xs: 'none', sm: 'block' },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 8,
                left: 8,
                width: 20,
                height: 20,
                background: 'linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.3) 60%, transparent 60%)',
                borderRadius: '4px 0 0 0',
                pointerEvents: 'none',
              },
              '&:hover::before': {
                background: 'linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.5) 60%, transparent 60%)',
              },
            }}
          />
          {/* Chat Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 40,
                  height: 40,
                }}
              >
                <SmartToyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {t('chatbot.title')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {t('chatbot.subtitle')}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Container */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f8f9ff',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message) => {
              const isExpanded = expandedMessages.has(message.id)
              const hasExpandableContent = message.sender === 'bot' && message.summary && message.fullText

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease-in',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(10px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '75%',
                      bgcolor: message.sender === 'user' ? '#667eea' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderTopLeftRadius: message.sender === 'bot' ? 0 : 2,
                      borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {hasExpandableContent
                        ? isExpanded
                          ? message.fullText
                          : message.summary
                        : message.text}
                    </Typography>

                    {hasExpandableContent && (
                      <Button
                        size="small"
                        onClick={() => toggleMessageExpansion(message.id)}
                        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          color: '#667eea',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          p: 0,
                          minWidth: 'auto',
                          '&:hover': {
                            bgcolor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {isExpanded ? t('chatbot.viewLess') : t('chatbot.viewFull')}
                      </Button>
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        fontSize: '0.7rem',
                        mt: 0.5,
                        display: 'block',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              )
            })}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress size={16} sx={{ color: '#667eea' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('chatbot.thinking')}
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'white',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8f9ff',
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                sx={{
                  bgcolor: '#667eea',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#764ba2',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(102, 126, 234, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
          },
          zIndex: 1300,
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  )
}
