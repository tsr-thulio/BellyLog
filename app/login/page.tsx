'use client'

import { Box, Button, Card, CardContent, Container, Typography, Divider, Alert } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginStyles } from './page.styles'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for existing session and errors on mount
  useEffect(() => {
    const checkSession = async () => {
      // Check for error from callback
      const errorParam = searchParams.get('error')
      if (errorParam) {
        setError(decodeURIComponent(errorParam))
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setChecking(false)
    }

    checkSession()
  }, [supabase, router, searchParams])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)

      // ALWAYS use localhost to ensure consistent cookie domain
      const redirectUrl = 'http://localhost:3000/auth/callback'

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // Don't set loading to false here - user is being redirected
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking for existing session
  if (checking) {
    return (
      <Container maxWidth="sm">
        <Box sx={loginStyles.containerBox}>
          <Typography variant="h6" color="text.secondary">
            Checking session...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={loginStyles.containerBox}>
        <Card sx={loginStyles.card}>
          <CardContent sx={loginStyles.cardContent}>
            {/* Logo/Brand Section */}
            <Box sx={loginStyles.logoBox}>
              <PregnantWomanIcon sx={loginStyles.pregnantIcon} />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                BellyLog
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
              >
                Track your pregnancy journey
              </Typography>
            </Box>

            <Divider sx={loginStyles.divider} />

            {/* Welcome Text */}
            <Typography
              variant="h6"
              component="h2"
              textAlign="center"
              mb={3}
            >
              Welcome back!
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={loginStyles.googleButton}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Terms and Privacy */}
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              display="block"
              mt={3}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
