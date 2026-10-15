import { createFileRoute, redirect } from '@tanstack/react-router'
import { Register } from '@/features/auth/register'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)/register')({
  beforeLoad: () => {
    // User must have an active session from OTP verification to complete registration
    const { accessToken } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        replace: true,
      })
    }
  },
  component: Register,
})
