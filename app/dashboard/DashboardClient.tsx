'use client'

import {
  AppBar,
  Avatar,
  Box,
  Button,
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
      <AppBar position="static">
        <Toolbar>
          <PregnantWomanIcon sx={dashboardStyles.pregnantIcon} />
          <Typography variant="h6" component="div" sx={dashboardStyles.title}>
            BellyLog
          </Typography>
          <Box sx={dashboardStyles.userBox}>
            <Typography variant="body2">
              {user.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                alt={user.user_metadata?.full_name || user.email || 'User'}
                src={user.user_metadata?.avatar_url}
                sx={dashboardStyles.avatar}
              />
            </IconButton>
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
                {loading ? 'Logging out...' : 'Logout'}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={dashboardStyles.container}>
        <Box sx={dashboardStyles.contentBox}>
          <Avatar
            alt={user.user_metadata?.full_name || user.email || 'User'}
            src={user.user_metadata?.avatar_url}
            sx={dashboardStyles.largeAvatar}
          />
          <Typography variant="h4" component="h1">
            Welcome, {user.user_metadata?.full_name || 'User'}!
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              You have successfully logged in to BellyLog.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start tracking your pregnancy journey!
            </Typography>
          </Box>

          {/* Placeholder for future content */}
          <Box sx={dashboardStyles.placeholderBox}>
            <Typography variant="h6" gutterBottom>
              Your Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dashboard features coming soon...
            </Typography>
          </Box>
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
