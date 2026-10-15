import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLogout } from '@/features/auth/api/use-logout'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { mutate: logout, isPending } = useLogout()

  const handleSignOut = () => {
    logout()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      isLoading={isPending}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
