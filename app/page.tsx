'use client'

import HomeClient from './HomeClient'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)

    // Check for existing session and redirect to dashboard
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router, supabase])

  if (!mounted) {
    return null // Avoid hydration issues by not rendering anything on server
  }

  const code = searchParams.get('code')

  return <HomeClient code={code || undefined} />
}
