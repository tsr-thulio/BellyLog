'use client'

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
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
import { dashboardStyles } from './DashboardClient.styles'
import ProfileSetupModal from './components/ProfileSetupModal'
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
  const [daysToGo, setDaysToGo] = useState(0)
  const [weeksLeft, setWeeksLeft] = useState(0)
  const [fetusSize, setFetusSize] = useState<string>('...')
  const [fetusSizeEmoji, setFetusSizeEmoji] = useState<string>('🌱')
  const [loadingFetusSize, setLoadingFetusSize] = useState(false)
  const [organDevelopment, setOrganDevelopment] = useState<string>('...')
  const [organDevelopmentEmoji, setOrganDevelopmentEmoji] = useState<string>('🫀')
  const [loadingOrganDevelopment, setLoadingOrganDevelopment] = useState(false)
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({
    weeksAlong: false,
    daysToGo: false,
    weeksLeft: false,
    babySize: false,
    developingOrgan: false,
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
          // Fetch fetus size and organ development from AI
          fetchFetusSize(weeks)
          fetchOrganDevelopment(weeks)
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
      if (fetchedProfile?.last_period) {
        const weeks = calculatePregnancyWeeks(fetchedProfile.last_period)
        setPregnancyWeeks(weeks)
        const days = calculateDaysToGo(fetchedProfile.last_period)
        setDaysToGo(days)
        const weeksRemaining = calculateWeeksLeft(fetchedProfile.last_period)
        setWeeksLeft(weeksRemaining)
        // Fetch updated fetus size and organ development
        fetchFetusSize(weeks)
        fetchOrganDevelopment(weeks)
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
    if (weeks === 0) return

    try {
      setLoadingFetusSize(true)
      const prompt = `For a pregnancy at week ${weeks} of gestation, what is the approximate size of the fetus? Respond with ONLY a JSON object in this exact format: {"item": "item_name", "emoji": "emoji"}. For example: {"item": "blueberry", "emoji": "🫐"}. Use a common food or object comparison and include an appropriate emoji. Do not include any other text.`

      const response = await executeGroqPrompt(prompt)
      const parsed = JSON.parse(response.trim())
      setFetusSize(parsed.item)
      setFetusSizeEmoji(parsed.emoji)
    } catch (error) {
      console.error('Error fetching fetus size:', error)
      setFetusSize('N/A')
      setFetusSizeEmoji('❓')
    } finally {
      setLoadingFetusSize(false)
    }
  }

  const fetchOrganDevelopment = async (weeks: number) => {
    if (weeks === 0) return

    try {
      setLoadingOrganDevelopment(true)
      const prompt = `For a pregnancy at week ${weeks} of gestation, what major organ or body system is primarily developing? Respond with ONLY a JSON object in this exact format: {"organ": "organ_name", "emoji": "emoji"}. For example: {"organ": "Heart", "emoji": "🫀"} or {"organ": "Brain", "emoji": "🧠"}. Use a short organ/system name (1-2 words) and an appropriate emoji. Do not include any other text.`
      console.log(prompt)
      const response = await executeGroqPrompt(prompt)
      const parsed = JSON.parse(response.trim())
      console.log('heyy', parsed)
      setOrganDevelopment(parsed.organ)
      setOrganDevelopmentEmoji(parsed.emoji)
    } catch (error) {
      console.error('Error fetching organ development:', error)
      setOrganDevelopment('N/A')
      setOrganDevelopmentEmoji('❓')
    } finally {
      setLoadingOrganDevelopment(false)
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
          <Box sx={dashboardStyles.welcomeContent}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Hey {user.user_metadata?.full_name?.split(' ')[0] || 'Mama'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
              Welcome to your pregnancy journey dashboard
            </Typography>
          </Box>
        </Card>

        {/* Stats Grid */}
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
                <Typography variant="body2" color="text.secondary">
                  Detailed information coming soon
                </Typography>
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
                <Typography variant="body2" color="text.secondary">
                  Detailed information coming soon
                </Typography>
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
                <Typography variant="body2" color="text.secondary">
                  Detailed information coming soon
                </Typography>
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
                <Typography variant="body2" color="text.secondary">
                  Detailed information coming soon
                </Typography>
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
                <Typography variant="body2" color="text.secondary">
                  Detailed information coming soon
                </Typography>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Placeholder for future content */}
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

        {/* AI Prompts Section */}
        {aiPrompts && (
          <Box sx={dashboardStyles.promptsSection}>
            <Typography sx={dashboardStyles.promptsSectionTitle}>
              AI Pregnancy Insights Prompts 🤖✨
            </Typography>

            <Box sx={dashboardStyles.promptCard}>
              <Typography sx={dashboardStyles.promptTitle}>
                🗓️ Prompt 1: Calculate Current Week of Gestation
              </Typography>
              <Typography sx={dashboardStyles.promptText}>
                {aiPrompts.gestationWeek}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('gestationWeek', aiPrompts.gestationWeek, 'claude')}
                  disabled={executingPrompt.key === 'gestationWeek' && executingPrompt.provider === 'claude'}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'gestationWeek' && executingPrompt.provider === 'claude' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Claude ✨'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('gestationWeek', aiPrompts.gestationWeek, 'groq')}
                  disabled={executingPrompt.key === 'gestationWeek' && executingPrompt.provider === 'groq'}
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97fe3 0%, #dc4a5c 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'gestationWeek' && executingPrompt.provider === 'groq' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Groq 🚀'
                  )}
                </Button>
              </Box>
              {aiResponses.gestationWeek?.claude && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#667eea' }}>
                    Claude Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.gestationWeek.claude}
                  </Typography>
                </Box>
              )}
              {aiResponses.gestationWeek?.groq && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1))',
                  border: '1px solid rgba(240, 147, 251, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#f5576c' }}>
                    Groq Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.gestationWeek.groq}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={dashboardStyles.promptCard}>
              <Typography sx={dashboardStyles.promptTitle}>
                👶 Prompt 2: Baby Size Comparison
              </Typography>
              <Typography sx={dashboardStyles.promptText}>
                {aiPrompts.babySize}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('babySize', aiPrompts.babySize, 'claude')}
                  disabled={executingPrompt.key === 'babySize' && executingPrompt.provider === 'claude'}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'babySize' && executingPrompt.provider === 'claude' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Claude ✨'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('babySize', aiPrompts.babySize, 'groq')}
                  disabled={executingPrompt.key === 'babySize' && executingPrompt.provider === 'groq'}
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97fe3 0%, #dc4a5c 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'babySize' && executingPrompt.provider === 'groq' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Groq 🚀'
                  )}
                </Button>
              </Box>
              {aiResponses.babySize?.claude && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#667eea' }}>
                    Claude Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.babySize.claude}
                  </Typography>
                </Box>
              )}
              {aiResponses.babySize?.groq && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1))',
                  border: '1px solid rgba(240, 147, 251, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#f5576c' }}>
                    Groq Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.babySize.groq}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={dashboardStyles.promptCard}>
              <Typography sx={dashboardStyles.promptTitle}>
                🫀 Prompt 3: Current Organ Development
              </Typography>
              <Typography sx={dashboardStyles.promptText}>
                {aiPrompts.organDevelopment}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('organDevelopment', aiPrompts.organDevelopment, 'claude')}
                  disabled={executingPrompt.key === 'organDevelopment' && executingPrompt.provider === 'claude'}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'organDevelopment' && executingPrompt.provider === 'claude' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Claude ✨'
                  )}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleExecutePrompt('organDevelopment', aiPrompts.organDevelopment, 'groq')}
                  disabled={executingPrompt.key === 'organDevelopment' && executingPrompt.provider === 'groq'}
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97fe3 0%, #dc4a5c 100%)',
                    },
                  }}
                >
                  {executingPrompt.key === 'organDevelopment' && executingPrompt.provider === 'groq' ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Executing...
                    </>
                  ) : (
                    'Execute with Groq 🚀'
                  )}
                </Button>
              </Box>
              {aiResponses.organDevelopment?.claude && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#667eea' }}>
                    Claude Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.organDevelopment.claude}
                  </Typography>
                </Box>
              )}
              {aiResponses.organDevelopment?.groq && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1))',
                  border: '1px solid rgba(240, 147, 251, 0.2)',
                }}>
                  <Typography sx={{ fontWeight: 600, mb: 1, color: '#f5576c' }}>
                    Groq Response:
                  </Typography>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    {aiResponses.organDevelopment.groq}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Container>

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        open={showProfileSetup}
        onClose={handleProfileSetupClose}
        onSave={handleProfileSetupSave}
        initialProfile={profile}
      />
    </Box>
  )
}
