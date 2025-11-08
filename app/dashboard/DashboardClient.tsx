'use client'

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { dashboardStyles } from './DashboardClient.styles'
import ProfileSetupModal from './components/ProfileSetupModal'
import PregnancyFactsCarousel from './components/PregnancyFactsCarousel'
import MommySymptoms from './components/MommySymptoms'
import ChatBot from './components/ChatBot'
import { getProfile, Profile } from '@/lib/api/profile'
import { executePrompt as executeClaudePrompt } from '@/lib/api/claude'
import { executePrompt as executeGroqPrompt } from '@/lib/api/groq'
import { CircularProgress } from '@mui/material'
import { PREGNANCY_CONSTANTS } from '@/constants/profile'

interface DashboardClientProps {
  user: User
}

// Helper function to calculate weeks of pregnancy
function calculatePregnancyWeeks(lastPeriod: string | Date | null): number {
  if (!lastPeriod) return 0
  const lastPeriodDate = new Date(lastPeriod)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

// Helper function to calculate days remaining until due date
function calculateDaysToGo(lastPeriod: string | Date | null): number {
  if (!lastPeriod) return 0
  const lastPeriodDate = new Date(lastPeriod)
  const dueDate = new Date(lastPeriodDate.getTime() + (PREGNANCY_CONSTANTS.FULL_TERM_DAYS * 24 * 60 * 60 * 1000))
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays) // Return 0 if already past due date
}

// Helper function to calculate weeks remaining until due date
function calculateWeeksLeft(lastPeriod: string | Date | null): number {
  const daysToGo = calculateDaysToGo(lastPeriod)
  return Math.ceil(daysToGo / 7)
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pregnancyWeeks, setPregnancyWeeks] = useState(0)
  const [weeksAlongDetails, setWeeksAlongDetails] = useState<string>('')
  const [daysToGo, setDaysToGo] = useState(0)
  const [daysToGoDetails, setDaysToGoDetails] = useState<string>('')
  const [weeksLeft, setWeeksLeft] = useState(0)
  const [weeksLeftDetails, setWeeksLeftDetails] = useState<string>('')
  const [fetusSize, setFetusSize] = useState<string>('...')
  const [fetusSizeEmoji, setFetusSizeEmoji] = useState<string>('🌱')
  const [fetusSizeDetails, setFetusSizeDetails] = useState<string>('Loading detailed information...')
  const [loadingFetusSize, setLoadingFetusSize] = useState(false)
  const [organDevelopment, setOrganDevelopment] = useState<string>('...')
  const [organDevelopmentEmoji, setOrganDevelopmentEmoji] = useState<string>('🫀')
  const [organDevelopmentDetails, setOrganDevelopmentDetails] = useState<string>('Loading detailed information...')
  const [loadingOrganDevelopment, setLoadingOrganDevelopment] = useState(false)
  const [babyAbilities, setBabyAbilities] = useState<string>('...')
  const [babyAbilitiesEmoji, setBabyAbilitiesEmoji] = useState<string>('👂')
  const [babyAbilitiesDetails, setBabyAbilitiesDetails] = useState<string>('Loading detailed information...')
  const [loadingBabyAbilities, setLoadingBabyAbilities] = useState(false)
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({
    weeksAlong: false,
    daysToGo: false,
    weeksLeft: false,
    babySize: false,
    developingOrgan: false,
    babyAbilities: false,
  })
  const [aiResponses, setAiResponses] = useState<{
    gestationWeek?: { claude?: string; groq?: string }
    babySize?: { claude?: string; groq?: string }
    organDevelopment?: { claude?: string; groq?: string }
  }>({})
  const [executingPrompt, setExecutingPrompt] = useState<{
    key: string | null
    provider: 'claude' | 'groq' | null
  }>({ key: null, provider: null })
  const [factsExpanded, setFactsExpanded] = useState(true)
  const [cardsExpanded, setCardsExpanded] = useState(true)
  const [symptomsExpanded, setSymptomsExpanded] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Check if user has a completed profile
        const fetchedProfile = await getProfile()

        if (!fetchedProfile || !fetchedProfile.profile_completed) {
          setShowProfileSetup(true)
        } else {
          setProfile(fetchedProfile)
          // Calculate pregnancy weeks
          const weeks = calculatePregnancyWeeks(fetchedProfile.last_period)
          setPregnancyWeeks(weeks)
          // Calculate days to go and weeks left
          const days = calculateDaysToGo(fetchedProfile.last_period)
          setDaysToGo(days)
          const weeksRemaining = calculateWeeksLeft(fetchedProfile.last_period)
          setWeeksLeft(weeksRemaining)
          // Fetch fetus size, organ development, and baby abilities from AI
          fetchFetusSize(weeks)
          fetchOrganDevelopment(weeks)
          fetchBabyAbilities(weeks)
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        // Show modal if there's an error (safer to assume profile doesn't exist)
        setShowProfileSetup(true)
      } finally {
        setCheckingProfile(false)
      }
    }

    checkProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEditProfile = () => {
    setShowProfileSetup(true)
    handleClose()
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Error logging out. Please try again.')
    } finally {
      setLoading(false)
      handleClose()
    }
  }

  const handleProfileSetupClose = () => {
    // Allow closing the modal if the profile is already completed (editing mode)
    // Only prevent closing during initial setup
    if (profile && profile.profile_completed) {
      setShowProfileSetup(false)
    }
  }

  const handleCardFlip = (cardKey: string) => {
    const isCurrentlyFlipped = flippedCards[cardKey]

    // If flipping to the back and details not loaded yet, fetch them
    if (!isCurrentlyFlipped && profile?.last_period) {
      const lastPeriodDate = new Date(profile.last_period)
      const dueDate = new Date(lastPeriodDate.getTime() + (PREGNANCY_CONSTANTS.FULL_TERM_DAYS * 24 * 60 * 60 * 1000))

      switch (cardKey) {
        case 'weeksAlong':
          if (!weeksAlongDetails) {
            fetchWeeksAlongDetails(pregnancyWeeks, dueDate)
          }
          break
        case 'daysToGo':
          if (!daysToGoDetails) {
            fetchDaysToGoDetails(daysToGo, dueDate)
          }
          break
        case 'weeksLeft':
          if (!weeksLeftDetails) {
            fetchWeeksLeftDetails(weeksLeft, dueDate)
          }
          break
      }
    }

    setFlippedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }))
  }

  const handleProfileSetupSave = async () => {
    try {
      setLoading(true)
      // Reload profile after save
      const fetchedProfile = await getProfile()
      setProfile(fetchedProfile)

      // Clear cached details to force refetch with new profile data
      setWeeksAlongDetails('')
      setDaysToGoDetails('')
      setWeeksLeftDetails('')
      setFetusSizeDetails('Loading detailed information...')
      setOrganDevelopmentDetails('Loading detailed information...')
      setBabyAbilitiesDetails('Loading detailed information...')
      setFetusSize('...')
      setOrganDevelopment('...')
      setBabyAbilities('...')

      if (fetchedProfile?.last_period) {
        const weeks = calculatePregnancyWeeks(fetchedProfile.last_period)
        setPregnancyWeeks(weeks)
        const days = calculateDaysToGo(fetchedProfile.last_period)
        setDaysToGo(days)
        const weeksRemaining = calculateWeeksLeft(fetchedProfile.last_period)
        setWeeksLeft(weeksRemaining)
        // Fetch updated fetus size, organ development, and baby abilities
        fetchFetusSize(weeks)
        fetchOrganDevelopment(weeks)
        fetchBabyAbilities(weeks)
      }
      setShowProfileSetup(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExecutePrompt = async (
    promptKey: 'gestationWeek' | 'babySize' | 'organDevelopment',
    prompt: string,
    provider: 'claude' | 'groq'
  ) => {
    try {
      setExecutingPrompt({ key: promptKey, provider })

      const response = provider === 'claude'
        ? await executeClaudePrompt(prompt)
        : await executeGroqPrompt(prompt)

      setAiResponses(prev => ({
        ...prev,
        [promptKey]: {
          ...prev[promptKey],
          [provider]: response
        }
      }))
    } catch (error) {
      console.error(`Error executing ${promptKey} prompt with ${provider}:`, error)
      alert(`Failed to get AI response from ${provider}. Please try again.`)
    } finally {
      setExecutingPrompt({ key: null, provider: null })
    }
  }

  const fetchFetusSize = async (weeks: number) => {
    if (weeks === 0 || (fetusSize !== '...' && fetusSizeDetails !== 'Loading detailed information...')) return // Don't fetch if already loaded

    try {
      setLoadingFetusSize(true)

      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}
` : ''

      const prompt = `For a pregnancy at week ${weeks} of gestation, provide information about the baby's size.
${profileInfo}

Respond with ONLY a JSON object in this exact format:
{
  "item": "comparison object/food",
  "emoji": "appropriate emoji",
  "details": "Detailed information for parents (150-200 words). Include: current size and weight, what's happening this week, physical development milestones, what parents should know, and any relevant advice based on the profile information. Make it warm, encouraging, and informative."
}

Example: {"item": "blueberry", "emoji": "🫐", "details": "Your baby is now..."}

Do not include any other text outside the JSON object.`

      const response = await executeGroqPrompt(prompt)
      const parsed = JSON.parse(response.trim())
      setFetusSize(parsed.item)
      setFetusSizeEmoji(parsed.emoji)
      setFetusSizeDetails(parsed.details || 'Detailed information not available.')
    } catch (error) {
      console.error('Error fetching fetus size:', error)
      setFetusSize('N/A')
      setFetusSizeEmoji('❓')
      setFetusSizeDetails('Unable to load detailed information. Please try again.')
    } finally {
      setLoadingFetusSize(false)
    }
  }

  const fetchOrganDevelopment = async (weeks: number) => {
    if (weeks === 0 || (organDevelopment !== '...' && organDevelopmentDetails !== 'Loading detailed information...')) return // Don't fetch if already loaded

    try {
      setLoadingOrganDevelopment(true)

      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}
- Medications: ${profile.medications || 'None'}
` : ''

      const prompt = `For a pregnancy at week ${weeks} of gestation, provide information about the major organ or body system that is developing.
${profileInfo}

Respond with ONLY a JSON object in this exact format:
{
  "organ": "organ/system name (1-2 words)",
  "emoji": "appropriate emoji",
  "details": "Detailed information for parents (150-200 words). Include: which organ/system is developing, what's happening this week, why this development is important, what parents can do to support healthy development, and any relevant advice based on the profile information. Make it warm, encouraging, and educational."
}

Example: {"organ": "Heart", "emoji": "🫀", "details": "This week, your baby's heart..."}

Do not include any other text outside the JSON object.`

      const response = await executeGroqPrompt(prompt)
      const parsed = JSON.parse(response.trim())
      setOrganDevelopment(parsed.organ)
      setOrganDevelopmentEmoji(parsed.emoji)
      setOrganDevelopmentDetails(parsed.details || 'Detailed information not available.')
    } catch (error) {
      console.error('Error fetching organ development:', error)
      setOrganDevelopment('N/A')
      setOrganDevelopmentEmoji('❓')
      setOrganDevelopmentDetails('Unable to load detailed information. Please try again.')
    } finally {
      setLoadingOrganDevelopment(false)
    }
  }

  const fetchBabyAbilities = async (weeks: number) => {
    if (weeks === 0 || (babyAbilities !== '...' && babyAbilitiesDetails !== 'Loading detailed information...')) return // Don't fetch if already loaded

    try {
      setLoadingBabyAbilities(true)

      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
` : ''

      const prompt = `For a pregnancy at week ${weeks} of gestation, provide information about what the baby can do now.
${profileInfo}

Respond with ONLY a JSON object in this exact format:
{
  "ability": "main ability/capability (2-3 words)",
  "emoji": "appropriate emoji",
  "details": "Detailed information for parents (150-200 words). Include: current sensory abilities (hearing, sight, touch, taste), movements and reflexes, response to external stimuli, brain development related to abilities, what parents can do to interact with baby, and any relevant advice based on the profile information. Make it warm, encouraging, and informative."
}

Example: {"ability": "Hearing Sounds", "emoji": "👂", "details": "This week, your baby can..."}

Do not include any other text outside the JSON object.`

      const response = await executeGroqPrompt(prompt)
      const parsed = JSON.parse(response.trim())
      setBabyAbilities(parsed.ability)
      setBabyAbilitiesEmoji(parsed.emoji)
      setBabyAbilitiesDetails(parsed.details || 'Detailed information not available.')
    } catch (error) {
      console.error('Error fetching baby abilities:', error)
      setBabyAbilities('N/A')
      setBabyAbilitiesEmoji('❓')
      setBabyAbilitiesDetails('Unable to load detailed information. Please try again.')
    } finally {
      setLoadingBabyAbilities(false)
    }
  }

  const fetchWeeksAlongDetails = async (weeks: number, dueDate: Date) => {
    if (weeks === 0 || weeksAlongDetails) return // Don't fetch if already loaded

    try {
      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Conception type: ${profile.conception_type || 'Not specified'}
- Activity level: ${profile.activity_level || 'Not specified'}
` : ''

      const prompt = `Provide detailed information for parents who are at week ${weeks} of pregnancy, with an estimated due date of ${dueDate.toLocaleDateString()}.
${profileInfo}

Provide warm, encouraging, and informative content (150-200 words) that includes:
- Overview of what week ${weeks} means in the pregnancy journey
- Key milestones at this stage
- What's typical for this week
- Tips for staying healthy and comfortable
- What to expect in the coming weeks
- Any relevant advice based on the profile information

Make it personal and supportive. Respond with ONLY the detailed text, no JSON.`

      const response = await executeGroqPrompt(prompt)
      setWeeksAlongDetails(response.trim())
    } catch (error) {
      console.error('Error fetching weeks along details:', error)
      setWeeksAlongDetails('Unable to load detailed information. Please try again.')
    }
  }

  const fetchDaysToGoDetails = async (days: number, dueDate: Date) => {
    if (days === 0 || daysToGoDetails) return // Don't fetch if already loaded

    try {
      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Work physical demand: ${profile.work_physical_demand || 'Not specified'}
- Has exercise restrictions: ${profile.has_exercise_restrictions ? 'Yes' : 'No'}
` : ''

      const prompt = `Provide detailed information for parents who have ${days} days remaining until their due date (${dueDate.toLocaleDateString()}).
${profileInfo}

Provide warm, encouraging, and informative content (150-200 words) that includes:
- What this countdown means
- How to prepare for the final stretch
- Important tasks and preparations to complete
- Self-care tips for the remaining time
- What to pack for the hospital
- Signs of labor to watch for
- Any relevant advice based on the profile information

Make it practical and reassuring. Respond with ONLY the detailed text, no JSON.`

      const response = await executeGroqPrompt(prompt)
      setDaysToGoDetails(response.trim())
    } catch (error) {
      console.error('Error fetching days to go details:', error)
      setDaysToGoDetails('Unable to load detailed information. Please try again.')
    }
  }

  const fetchWeeksLeftDetails = async (weeksRemaining: number, dueDate: Date) => {
    if (weeksRemaining === 0 || weeksLeftDetails) return // Don't fetch if already loaded

    try {
      const profileInfo = profile ? `
Profile Information:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Mother's age: ${profile.age || 'Not specified'}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}
` : ''

      const prompt = `Provide detailed information for parents who have ${weeksRemaining} weeks remaining until their due date (${dueDate.toLocaleDateString()}).
${profileInfo}

Provide warm, encouraging, and informative content (150-200 words) that includes:
- What to expect in the remaining ${weeksRemaining} weeks
- Weekly milestones ahead
- Preparing for delivery and postpartum
- Final medical appointments and tests
- Emotional preparation for parenthood
- Support system and planning
- Any relevant advice based on the profile information

Make it supportive and forward-looking. Respond with ONLY the detailed text, no JSON.`

      const response = await executeGroqPrompt(prompt)
      setWeeksLeftDetails(response.trim())
    } catch (error) {
      console.error('Error fetching weeks left details:', error)
      setWeeksLeftDetails('Unable to load detailed information. Please try again.')
    }
  }

  // Generate AI prompts based on profile data
  const generateAIPrompts = () => {
    if (!profile) return null

    const userName = user.user_metadata?.full_name?.split(' ')[0] || 'the mother'

    return {
      gestationWeek: `Based on the following pregnancy information, calculate the current week of gestation:
- Last menstrual period: ${profile.last_period ? new Date(profile.last_period).toLocaleDateString() : 'Not provided'}
- Pregnancy type: ${profile.pregnancy_type || 'Not specified'}
- Number of babies: ${profile.number_of_babies || 1}
- Previous pregnancies: ${profile.previous_pregnancies || 0}
- Conception type: ${profile.conception_type || 'Not specified'}

Please provide the exact week of gestation for ${userName}.`,

      babySize: `For a pregnancy at week ${pregnancyWeeks} of gestation with the following details:
- Pregnancy type: ${profile.pregnancy_type || 'single'}
- Number of babies: ${profile.number_of_babies || 1}
- Conception type: ${profile.conception_type || 'Not specified'}

Please describe the current size of the baby (or babies) using a fun comparison (like "the size of a ___"). Be specific and engaging.`,

      organDevelopment: `For a pregnancy at week ${pregnancyWeeks} of gestation:
- Mother's age: ${profile.age || 'Not specified'}
- Pre-existing conditions: ${profile.pre_existing_conditions?.join(', ') || 'None'}
- Current complications: ${profile.current_complications || 'None'}

What organ or body system is the baby primarily developing this week? Provide a brief, encouraging explanation for ${userName} about what's happening with the baby's development.`
    }
  }

  const aiPrompts = generateAIPrompts()

  return (
    <Box sx={dashboardStyles.rootBox}>
      {/* App Bar */}
      <AppBar position="static" sx={dashboardStyles.appBar} elevation={0}>
        <Toolbar>
          <PregnantWomanIcon sx={dashboardStyles.pregnantIcon} />
          <Typography sx={dashboardStyles.title}>
            BellyLog ✨
          </Typography>
          <Box sx={dashboardStyles.userBox}>
            <Button
              onClick={handleMenu}
              sx={dashboardStyles.userButton}
              color="inherit"
              endIcon={
                <Avatar
                  alt={user.user_metadata?.full_name || user.email || 'User'}
                  src={user.user_metadata?.avatar_url}
                  sx={dashboardStyles.avatar}
                />
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </Typography>
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={dashboardStyles.menuAnchorOrigin}
              keepMounted
              transformOrigin={dashboardStyles.menuTransformOrigin}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleEditProfile}>
                Edit Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} disabled={loading}>
                {loading ? 'Logging out... 👋' : 'Logout'}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={dashboardStyles.container}>
        {/* Welcome Card */}
        <Card sx={dashboardStyles.welcomeCard}>
          {/* Expand/Collapse Button */}
          <IconButton
            onClick={() => setFactsExpanded(!factsExpanded)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              transition: 'all 0.3s ease',
              zIndex: 10,
            }}
            aria-label={factsExpanded ? 'Collapse facts' : 'Expand facts'}
          >
            {factsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>

          <Box sx={dashboardStyles.welcomeContent}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Hey {user.user_metadata?.full_name?.split(' ')[0] || 'Mama'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500, mb: factsExpanded ? 3 : 0 }}>
              Welcome to your pregnancy journey dashboard
            </Typography>

            {/* Pregnancy Facts Carousel */}
            <Collapse in={factsExpanded} timeout={600}>
              <PregnancyFactsCarousel
                profile={profile}
                pregnancyWeeks={pregnancyWeeks}
                factCount={5}
              />
            </Collapse>
          </Box>
        </Card>

        {/* Basic Information Section */}
        <Box
          sx={{
            background: 'transparent',
            borderRadius: 3,
            p: 3,
            mb: 4,
            position: 'relative',
          }}
        >
          {/* Section Header */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Basic Information
              </Typography>
              <IconButton
                onClick={() => setCardsExpanded(!cardsExpanded)}
                sx={{
                  color: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label={cardsExpanded ? 'Collapse basic information' : 'Expand basic information'}
              >
                {cardsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Track your pregnancy milestones and your baby's development at week {pregnancyWeeks}
            </Typography>
          </Box>

          {/* Stats Grid */}
          <Collapse in={cardsExpanded} timeout={600}>
            <Box sx={dashboardStyles.statsGrid}>
          {/* Card 1: Weeks Along */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('weeksAlong')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.weeksAlong)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>🤰</Typography>
                <Typography sx={dashboardStyles.statValue}>{pregnancyWeeks}</Typography>
                <Typography sx={dashboardStyles.statLabel}>Weeks Along</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Week {pregnancyWeeks} Journey
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {weeksAlongDetails || 'Loading detailed information...'}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Card 2: Days to Go */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('daysToGo')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.daysToGo)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>⏳</Typography>
                <Typography sx={dashboardStyles.statValue}>{daysToGo}</Typography>
                <Typography sx={dashboardStyles.statLabel}>Days to Go</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Countdown to Baby
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {daysToGoDetails || 'Loading detailed information...'}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Card 3: Weeks Left */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('weeksLeft')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.weeksLeft)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>👶</Typography>
                <Typography sx={dashboardStyles.statValue}>{weeksLeft}</Typography>
                <Typography sx={dashboardStyles.statLabel}>Weeks Left</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Final Weeks Ahead
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {weeksLeftDetails || 'Loading detailed information...'}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Card 4: Baby Size */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('babySize')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.babySize)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>
                  {loadingFetusSize ? '...' : fetusSizeEmoji}
                </Typography>
                <Typography sx={dashboardStyles.statValue}>
                  {loadingFetusSize ? '...' : fetusSize}
                </Typography>
                <Typography sx={dashboardStyles.statLabel}>Is the size of your little one this week</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Baby Size Details
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {fetusSizeDetails}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Card 5: Developing Organ */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('developingOrgan')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.developingOrgan)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>
                  {loadingOrganDevelopment ? '...' : organDevelopmentEmoji}
                </Typography>
                <Typography sx={dashboardStyles.statValue}>
                  {loadingOrganDevelopment ? '...' : organDevelopment}
                </Typography>
                <Typography sx={dashboardStyles.statLabel}>Is the Organ forming now</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Organ Development Details
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {organDevelopmentDetails}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Card 6: Baby Abilities */}
          <Box sx={dashboardStyles.flipCardContainer} onClick={() => handleCardFlip('babyAbilities')}>
            <Box sx={dashboardStyles.flipCardInner(flippedCards.babyAbilities)}>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardFront]}>
                <Typography sx={{ fontSize: '4rem', mb: 1 }}>
                  {loadingBabyAbilities ? '...' : babyAbilitiesEmoji}
                </Typography>
                <Typography sx={dashboardStyles.statValue}>
                  {loadingBabyAbilities ? '...' : babyAbilities}
                </Typography>
                <Typography sx={dashboardStyles.statLabel}>What baby can do now</Typography>
              </Card>
              <Card sx={[dashboardStyles.statCard, dashboardStyles.flipCardBack]}>
                <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    Baby's Abilities
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {babyAbilitiesDetails}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Mommy Symptoms Section */}
        <Box
          sx={{
            background: 'transparent',
            borderRadius: 3,
            p: 3,
            mb: 4,
            position: 'relative',
          }}
        >
          {/* Section Header */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Mommy Symptoms
              </Typography>
              <IconButton
                onClick={() => setSymptomsExpanded(!symptomsExpanded)}
                sx={{
                  color: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                aria-label={symptomsExpanded ? 'Collapse symptoms' : 'Expand symptoms'}
              >
                {symptomsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Personalized insights based on your week {pregnancyWeeks} journey and unique profile
            </Typography>
          </Box>

          {/* Symptoms Content */}
          <Collapse in={symptomsExpanded} timeout={600}>
            <MommySymptoms
              profile={profile}
              pregnancyWeeks={pregnancyWeeks}
            />
          </Collapse>
        </Box>

        {/* Placeholder for future content */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box sx={dashboardStyles.placeholderBox}>
            <Typography sx={dashboardStyles.comingSoonText}>
              More Amazing Features Coming Soon! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We're building something special for you and your baby
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track appointments • Monitor symptoms • Connect with community • And so much more!
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        open={showProfileSetup}
        onClose={handleProfileSetupClose}
        onSave={handleProfileSetupSave}
        initialProfile={profile}
      />

      {/* ChatBot */}
      <ChatBot profile={profile} pregnancyWeeks={pregnancyWeeks} />
    </Box>
  )
}
