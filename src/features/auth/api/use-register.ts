import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authService } from './auth-service'
import type { RegisterPayload, RegisterResponse } from './types'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'

export function useRegister() {
  const navigate = useNavigate()
  const { user, setUser, phoneForOtp, setPhoneForOtp } = useAuthStore(
    (state) => state.auth
  )

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: (data, variables) => {
      // Update user details in the store
      setUser({
        ...(user || {}),
        phoneNumber: variables.phoneNumber || user?.phoneNumber || phoneForOtp,
        name: variables.name,
        bio: variables.bio || null,
        youtubeLink: variables.youtubeLink || null,
      })

      // Registration is complete, clear pending phone
      setPhoneForOtp('')

      toast.success(data.message || 'Registration completed successfully!')

      // Navigate to root route
      navigate({ to: '/', replace: true })
    },
    onError: (error) => {
      handleServerError(error)
    },
  })
}
