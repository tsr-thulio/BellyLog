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
import { getProfile } from '@/lib/api/profile'

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Check if user has a completed profile
        const profile = await getProfile()

        if (!profile || !profile.profile_completed) {
          setShowProfileSetup(true)
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
      // TODO: Save profile data
      // For now, just close the modal
      setShowProfileSetup(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
