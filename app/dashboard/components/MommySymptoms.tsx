'use client'

import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import { executePrompt as executeGroqPrompt } from '@/lib/api/groq'
import { Profile } from '@/lib/api/profile'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n/config'

interface MommySymptomsProps {
  profile: Profile | null
  pregnancyWeeks: number
}

interface Symptom {
  name: string
  description: string
  isNormal: boolean
  normalityLevel: 'very common' | 'common' | 'less common' | 'rare'
  remedies: string[]
}

export default function MommySymptoms({
  profile,
  pregnancyWeeks,
}: MommySymptomsProps) {
  const { t, i18n } = useTranslation()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded((prev) => {
      const newExpanded = new Set(prev)
      if (isExpanded) {
        newExpanded.add(panel)
      } else {
        newExpanded.delete(panel)
      }
      return newExpanded
    })
  }

  // Fetch symptoms from Groq
  useEffect(() => {
    const fetchSymptoms = async () => {
      if (!profile || pregnancyWeeks === 0) {
        console.log('MommySymptoms: No profile or pregnancy weeks', { profile, pregnancyWeeks })
        setError(true)
        setLoading(false)
        return
      }

      console.log('MommySymptoms: Fetching symptoms for week', pregnancyWeeks)

      try {
        setLoading(true)
        setError(false)

        const profileInfo = `
Profile Information:
- Current week: ${pregnancyWeeks}
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
- Work physical demand: ${profile.work_physical_demand || 'Not specified'}
- Has exercise restrictions: ${profile.has_exercise_restrictions ? 'Yes' : 'No'}
- Previous pregnancy complications: ${profile.previous_pregnancy_complications?.join(', ') || 'None'}
`

        const currentLang = i18n.language || 'en'
        const languageInstruction = currentLang === 'pt'
          ? 'Responda em PORTUGUÊS BRASILEIRO. Todos os textos devem estar em português.'
          : 'Respond in ENGLISH. All texts must be in English.'

        const prompt = `${languageInstruction}

Based on the following pregnancy information for a woman at week ${pregnancyWeeks} of pregnancy, identify the 5-7 most likely symptoms she may be experiencing right now.

${profileInfo}

CRITICAL: Respond with ONLY valid JSON. No explanations, no markdown, no code blocks. Pure JSON array only.

IMPORTANT JSON RULES:
- Use straight double quotes (") for all strings, never use apostrophes or smart quotes
- Avoid contractions (use "it is" not "it's", "do not" not "don't")
- Avoid possessives when possible (use "of the baby" not "baby's")
- Keep sentences simple and direct
- No special characters or emojis

Each symptom object structure:
{"name":"string","description":"string","isNormal":boolean,"normalityLevel":"string","remedies":["string","string","string"]}

Example (note the simple language):
[{"name":"Morning Sickness","description":"Nausea and vomiting that occurs in the first trimester. It is caused by hormonal changes in the body.","isNormal":true,"normalityLevel":"very common","remedies":["Eat small frequent meals throughout the day.","Try drinking ginger tea to settle the stomach.","Keep crackers nearby to eat before getting up.","Stay hydrated with small sips of water.","Avoid strong smells and greasy foods."]}]

Return 5-7 symptoms as a JSON array. Consider week ${pregnancyWeeks} and profile details.`

        const response = await executeGroqPrompt(prompt)
        console.log('MommySymptoms: Raw AI response length:', response.length)

        // Clean the response to extract JSON
        let cleanedResponse = response.trim()

        // Remove markdown code blocks if present
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')

        // Try to find JSON array in the response
        const jsonStart = cleanedResponse.indexOf('[')
        const jsonEnd = cleanedResponse.lastIndexOf(']')

        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
        }

        // Fix common JSON issues
        cleanedResponse = cleanedResponse
          // Replace smart quotes with regular quotes
          .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
          .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
          .replace(/[\u2026]/g, '...')      // Ellipsis
          // Fix newlines within strings (should be escaped)
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          // Fix multiple spaces
          .replace(/\s+/g, ' ')

        console.log('MommySymptoms: Attempting to parse JSON...')

        let parsedSymptoms
        try {
          parsedSymptoms = JSON.parse(cleanedResponse)
        } catch (parseError: any) {
          console.error('MommySymptoms: JSON parse error:', parseError.message)
          console.log('MommySymptoms: Problematic JSON around position:', parseError.message.match(/\d+/)?.[0])
          // Log the area around the error
          const errorPos = parseInt(parseError.message.match(/\d+/)?.[0] || '0')
          const start = Math.max(0, errorPos - 100)
          const end = Math.min(cleanedResponse.length, errorPos + 100)
          console.log('MommySymptoms: Context around error:', cleanedResponse.substring(start, end))
          throw parseError
        }

        console.log('MommySymptoms: Successfully parsed', parsedSymptoms.length, 'symptoms')

        if (Array.isArray(parsedSymptoms) && parsedSymptoms.length > 0) {
          setSymptoms(parsedSymptoms)
          setError(false)
          console.log('MommySymptoms: Successfully set symptoms')
        } else {
          console.log('MommySymptoms: No valid symptoms in response')
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching mommy symptoms:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSymptoms()
  }, [profile, pregnancyWeeks, i18n.language])

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    )
  }

  // Show error state or empty state
  if (error || symptoms.length === 0) {
    console.log('MommySymptoms: Not rendering - error or no symptoms', { error, symptomsLength: symptoms.length })
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          px: 3,
          bgcolor: 'rgba(102, 126, 234, 0.05)',
          borderRadius: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Unable to load symptoms at this time. Please try refreshing the page.
        </Typography>
      </Box>
    )
  }

  console.log('MommySymptoms: Rendering', symptoms.length, 'symptoms')

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        alignItems: 'start',
      }}
    >
      {symptoms.map((symptom, index) => (
        <Accordion
          key={index}
          expanded={expanded.has(`panel${index}`)}
          onChange={handleChange(`panel${index}`)}
          disableGutters
          sx={{
            borderRadius: '12px !important',
            background: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            overflow: 'hidden',
            '&:first-of-type': {
              borderRadius: '12px !important',
            },
            '&:last-of-type': {
              borderRadius: '12px !important',
            },
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
              borderColor: '#667eea',
              margin: 0,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
            sx={{
              borderRadius: '12px',
              minHeight: 64,
              '&.Mui-expanded': {
                minHeight: 64,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.05)',
              },
              transition: 'background-color 0.3s ease',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              {symptom.isNormal ? (
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
              ) : (
                <WarningIcon sx={{ color: '#ff9800', fontSize: 28 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#667eea',
                    fontSize: '1.1rem',
                  }}
                >
                  {symptom.name}
                </Typography>
              </Box>
              <Chip
                label={symptom.normalityLevel}
                size="small"
                sx={{
                  bgcolor:
                    symptom.normalityLevel === 'very common'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : symptom.normalityLevel === 'common'
                      ? 'rgba(102, 126, 234, 0.1)'
                      : symptom.normalityLevel === 'less common'
                      ? 'rgba(255, 152, 0, 0.1)'
                      : 'rgba(244, 67, 54, 0.1)',
                  color:
                    symptom.normalityLevel === 'very common'
                      ? '#4caf50'
                      : symptom.normalityLevel === 'common'
                      ? '#667eea'
                      : symptom.normalityLevel === 'less common'
                      ? '#ff9800'
                      : '#f44336',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {t(`symptoms.${symptom.normalityLevel.replace(' ', '')}`)}
              </Chip>
            </Box>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              pt: 2,
              pb: 3,
              px: 3,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Description */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: 2,
                borderLeft: '4px solid #667eea',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.7,
                  color: 'text.secondary',
                }}
              >
                {symptom.description}
              </Typography>
            </Box>

            {/* Remedies */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              💡 {t('symptoms.safeWaysToHelp')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {symptom.remedies.map((remedy, remedyIndex) => (
                <Box
                  key={remedyIndex}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      mt: 0.3,
                    }}
                  >
                    {remedyIndex + 1}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                      color: 'text.secondary',
                      flex: 1,
                    }}
                  >
                    {remedy}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
