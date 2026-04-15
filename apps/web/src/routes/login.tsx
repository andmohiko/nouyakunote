import { createFileRoute, redirect } from '@tanstack/react-router'

import { auth } from '@/lib/firebase'
import { LoginPage } from '@/features/auth/components/LoginPage'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    await auth.authStateReady()
    if (auth.currentUser) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})
