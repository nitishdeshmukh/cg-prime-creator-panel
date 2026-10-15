import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authService } from './auth-service'
import type { SendOtpPayload, SendOtpResponse } from './types'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'

interface UseSendOtpOptions {
  redirectTo?: string
}

export function useSendOtp(options?: UseSendOtpOptions) {
  const navigate = useNavigate()
  const { setPhoneForOtp } = useAuthStore((state) => state.auth)

  return useMutation<SendOtpResponse, Error, SendOtpPayload>({
    mutationFn: (payload) => authService.sendOtp(payload),
    onSuccess: (data, variables) => {
      // Store phone in zustand for the OTP verification step
      if (variables.phoneNumber) {
        setPhoneForOtp(variables.phoneNumber)
      }

      toast.success(data.message || `OTP sent to ${variables.phoneNumber}`)

      // Navigate to /otp
      navigate({
        to: '/otp',
        search: options?.redirectTo ? { redirect: options.redirectTo } : undefined,
      })
    },
    onError: (error) => {
      handleServerError(error)
    },
  })
}
