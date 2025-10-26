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
import { useState } from 'react'
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman'
import { dashboardStyles } from './DashboardClient.styles'

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    </Box>
  )
}
