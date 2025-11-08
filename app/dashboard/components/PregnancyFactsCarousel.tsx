'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, Fade, IconButton, Typography } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { executePrompt as executeGroqPrompt } from '@/lib/api/groq'
import { Profile } from '@/lib/api/profile'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n/config'

interface PregnancyFactsCarouselProps {
  profile: Profile | null
  pregnancyWeeks: number
  factCount?: number
}

export default function PregnancyFactsCarousel({
  profile,
  pregnancyWeeks,
  factCount = 5,
}: PregnancyFactsCarouselProps) {
  const { i18n } = useTranslation()
  const [facts, setFacts] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  // Fetch facts from Groq
  useEffect(() => {
    const fetchFacts = async () => {
      if (!profile || pregnancyWeeks === 0) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(false)

        const profileInfo = `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}
- Medications: ${profile.medications || 'None'}
- Activity level: ${profile.activity_level || 'Not specified'}
- Dietary restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Work physical demand: ${profile.work_physical_demand || 'Not specified'}
`

        const currentLang = i18n.language || 'en'
        const languageInstruction = currentLang === 'pt'
          ? 'Responda em PORTUGUÊS BRASILEIRO. Todos os textos devem estar em português.'
          : 'Respond in ENGLISH. All texts must be in English.'

        const prompt = `${languageInstruction}

Based on the following pregnancy information for a woman at week ${pregnancyWeeks} of pregnancy, provide the ${factCount} most relevant and important facts that she should know right now.

${profileInfo}

Respond with ONLY a JSON array of exactly ${factCount} strings. Each string should be a complete, standalone fact that is relevant, actionable, and helpful for this specific pregnant woman at this specific week of pregnancy. Consider her unique profile when generating these facts.

Format: ["fact 1", "fact 2", "fact 3", ...]

Example: ["Your baby's brain is developing rapidly this week - eating omega-3 rich foods like salmon can support this growth.", "At 24 weeks, your baby can hear your voice - try reading or singing to strengthen your bond.", ...]

Do not include any other text outside the JSON array. Each fact should be 1-2 sentences, warm, encouraging, and personalized based on the profile information.`

        const response = await executeGroqPrompt(prompt)
        const parsedFacts = JSON.parse(response.trim())

        if (Array.isArray(parsedFacts) && parsedFacts.length > 0) {
          setFacts(parsedFacts)
          setError(false)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching pregnancy facts:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFacts()
  }, [profile, pregnancyWeeks, factCount, i18n.language])

  // Auto-rotate every 15 seconds
  useEffect(() => {
    if (facts.length === 0 || error) return

    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % facts.length)
        setProgress(0) // Reset progress when auto-rotating
        setFadeIn(true)
      }, 200)
    }, 15000)

    return () => clearInterval(interval)
  }, [facts.length, error])

  // Progress bar animation
  useEffect(() => {
    if (facts.length === 0 || error) return

    setProgress(0) // Reset progress when index changes
    const duration = 15000 // 15 seconds
    const interval = 50 // Update every 50ms for smooth animation
    const increment = (100 / duration) * interval

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment
        return newProgress >= 100 ? 100 : newProgress
      })
    }, interval)

    return () => clearInterval(progressInterval)
  }, [currentIndex, facts.length, error])

  const handlePrevious = useCallback(() => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length)
      setFadeIn(true)
    }, 200)
  }, [facts.length])

  const handleNext = useCallback(() => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length)
      setFadeIn(true)
    }, 200)
  }, [facts.length])

  // Don't render anything if loading, error, or no facts
  if (loading || error || facts.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        background: 'transparent',
        borderRadius: 3,
        p: 3,
        position: 'relative',
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Left Arrow */}
      <IconButton
        onClick={handlePrevious}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
          },
          zIndex: 1,
        }}
        aria-label="Previous fact"
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* Fact Content */}
      <Box
        sx={{
          px: 8,
          textAlign: 'center',
          maxWidth: '800px',
        }}
      >
        <Fade in={fadeIn} timeout={400} key={currentIndex}>
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              fontWeight: 500,
              minHeight: '60px',
            }}
          >
            {facts[currentIndex]}
          </Typography>
        </Fade>

        {/* Pagination Dots */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2,
          }}
        >
          {facts.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Progress Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 2,
          }}
        >
          <Box
            sx={{
              width: facts.length * 8 + (facts.length - 1) * 8, // Calculate dots width: (dots * 8px) + (gaps * 8px)
              height: 3,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                bgcolor: 'white',
                transition: 'width 0.05s linear',
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Arrow */}
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.3)',
          },
          zIndex: 1,
        }}
        aria-label="Next fact"
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  )
}
