import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authService } from './auth-service'
import { useAuthStore } from '@/stores/auth-store'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { reset } = useAuthStore((state) => state.auth)

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Clear client auth store and react-query cache regardless of server outcome
      reset()
      queryClient.clear()

      // Redirect cleanly to /sign-in without any query parameters
      navigate({
        to: '/sign-in',
        replace: true,
      })
    },
  })
}
