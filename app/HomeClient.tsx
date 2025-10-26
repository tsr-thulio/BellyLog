'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { homeStyles } from './page.styles'
import { Box, CircularProgress, Typography } from '@mui/material'

interface HomeClientProps {
  code?: string
}

export default function HomeClient({ code }: HomeClientProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (code) {
      const handleOAuthCallback = async () => {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data.session) {
            router.push('/dashboard')
            router.refresh()
          } else {
            router.push('/login?error=no_session')
          }
        } catch (err) {
          router.push('/login?error=unexpected_error')
        }
      }

      handleOAuthCallback()
    }
  }, [code, router, supabase])

  // If we have a code, show loading state
  if (code) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Completing sign in...
        </Typography>
      </Box>
    )
  }

  // Normal home page
  return (
    <div className={homeStyles.container}>
      <main className={homeStyles.main}>
        <div className={homeStyles.icon}>🤰</div>

        <h1 className={homeStyles.title}>
          BellyLog
        </h1>

        <p className={homeStyles.subtitle}>
          Track your pregnancy journey, monitor your health, and cherish every precious moment.
        </p>

        <div className={homeStyles.buttonContainer}>
          <Link
            href="/login"
            className={homeStyles.primaryButton}
          >
            Get Started
          </Link>

          <a
            href="#features"
            className={homeStyles.secondaryButton}
          >
            Learn More
          </a>
        </div>

        <div id="features" className={homeStyles.featuresGrid}>
          <div className={homeStyles.featureCard}>
            <div className={homeStyles.featureIcon}>📅</div>
            <h3 className={homeStyles.featureTitle}>
              Track Your Journey
            </h3>
            <p className={homeStyles.featureDescription}>
              Keep a detailed record of your pregnancy milestones
            </p>
          </div>

          <div className={homeStyles.featureCard}>
            <div className={homeStyles.featureIcon}>💪</div>
            <h3 className={homeStyles.featureTitle}>
              Monitor Health
            </h3>
            <p className={homeStyles.featureDescription}>
              Track symptoms, appointments, and wellness
            </p>
          </div>

          <div className={homeStyles.featureCard}>
            <div className={homeStyles.featureIcon}>❤️</div>
            <h3 className={homeStyles.featureTitle}>
              Cherish Memories
            </h3>
            <p className={homeStyles.featureDescription}>
              Document special moments throughout your pregnancy
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
