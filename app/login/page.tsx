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
      <Box sx={loginStyles.containerBox}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Checking session...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={loginStyles.containerBox}>
      <Container maxWidth="sm">
        <Card sx={loginStyles.card}>
          <CardContent sx={loginStyles.cardContent}>
            {/* Logo/Brand Section */}
            <Box sx={loginStyles.logoBox}>
              <PregnantWomanIcon sx={loginStyles.pregnantIcon} />
              <Typography sx={loginStyles.title}>
                BellyLog
              </Typography>
              <Typography sx={loginStyles.subtitle}>
                Your amazing pregnancy journey ✨
              </Typography>
            </Box>

            <Divider sx={loginStyles.divider} />

            {/* Welcome Text */}
            <Typography sx={loginStyles.welcomeText}>
              Welcome back, mama! 👋
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
              {loading ? 'Signing in... 🚀' : 'Continue with Google 🌟'}
            </Button>

            {/* Terms and Privacy */}
            <Typography sx={loginStyles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
