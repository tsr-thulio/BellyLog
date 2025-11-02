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
import FavoriteIcon from '@mui/icons-material/Favorite'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation'
import { dashboardStyles } from './DashboardClient.styles'
import ProfileSetupModal from './components/ProfileSetupModal'
import { getProfile, Profile } from '@/lib/api/profile'
import { executePrompt as executeClaudePrompt } from '@/lib/api/claude'
import { executePrompt as executeGroqPrompt } from '@/lib/api/groq'
import { CircularProgress } from '@mui/material'

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

export default function DashboardClient({ user }: DashboardClientProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pregnancyWeeks, setPregnancyWeeks] = useState(0)
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
    // Don't allow closing the modal without completing the profile
    // Users must complete the profile setup
    return
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
          <Card sx={dashboardStyles.statCard}>
            <FavoriteIcon sx={dashboardStyles.statIcon} />
            <Typography sx={dashboardStyles.statValue}>28</Typography>
            <Typography sx={dashboardStyles.statLabel}>Weeks Along</Typography>
          </Card>
          <Card sx={dashboardStyles.statCard}>
            <CalendarTodayIcon sx={dashboardStyles.statIcon} />
            <Typography sx={dashboardStyles.statValue}>84</Typography>
            <Typography sx={dashboardStyles.statLabel}>Days to Go</Typography>
          </Card>
          <Card sx={dashboardStyles.statCard}>
            <BabyChangingStationIcon sx={dashboardStyles.statIcon} />
            <Typography sx={dashboardStyles.statValue}>12</Typography>
            <Typography sx={dashboardStyles.statLabel}>Weeks Left</Typography>
          </Card>
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
      />
    </Box>
  )
}
