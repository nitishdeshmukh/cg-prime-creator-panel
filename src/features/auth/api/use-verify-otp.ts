import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authService } from './auth-service'
import type { VerifyOtpPayload, VerifyOtpResponse } from './types'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'

interface UseVerifyOtpOptions {
  redirectTo?: string
}

export function useVerifyOtp(_options?: UseVerifyOtpOptions) {
  const navigate = useNavigate()
  const { setUser, setTokens, setPhoneForOtp } = useAuthStore(
    (state) => state.auth
  )

  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: (payload) => authService.verifyOtp(payload),
    onSuccess: (res) => {
      // Backend returns tokens inside res.data
      const accessToken = res.data?.accessToken || ''
      const refreshToken = res.data?.refreshToken || ''
      const user = res.data?.user || null
      const isNew = Boolean(
        res.data?.isNew === true ||
        String(res.data?.isNew).toLowerCase() === 'true'
      )

      // Save tokens and user in store
      if (accessToken) {
        setTokens(accessToken, refreshToken)
      }
      if (user) {
        setUser(user)
      }

      toast.success(res.message || 'Otp Verified successful')

      // If isNew is true -> redirect to "/register" (keep phoneForOtp for registration form)
      // If isNew is false -> clear phoneForOtp and redirect to "/"
      if (isNew) {
        navigate({ to: '/register', replace: true })
      } else {
        setPhoneForOtp('')
        navigate({ to: '/', replace: true })
      }
    },
    onError: (error) => {
      handleServerError(error)
    },
  })
}
