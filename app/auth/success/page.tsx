'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function AuthSuccessPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const completeAuth = async () => {
      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if we have a valid session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        router.push('/login?error=session_error')
        return
      }

      if (session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        router.push('/login?error=no_session_after_auth')
      }
    }

    completeAuth()
  }, [router, supabase])

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
