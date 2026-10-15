import { useEffect } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  const navigate = useNavigate()
  const { phoneForOtp, accessToken, setPhoneForOtp } = useAuthStore(
    (state) => state.auth
  )
  const { redirect } = useSearch({ from: '/(auth)/otp' })

  // Redirect to /sign-in only if neither phone number nor active session exists
  useEffect(() => {
    if (!phoneForOtp && !accessToken) {
      navigate({
        to: '/sign-in',
        search: redirect ? { redirect } : undefined,
        replace: true,
      })
    }
  }, [phoneForOtp, accessToken, navigate, redirect])

  if (!phoneForOtp && !accessToken) {
    return null
  }

  return (
    <AuthLayout>
      <Card className='max-w-md gap-4'>
        <CardHeader className='text-start sm:text-center'>
          <CardTitle className='text-base sm:text-lg tracking-tight'>
            Two-factor Authentication
          </CardTitle>
          <CardDescription className='text-start sm:text-center'>
            Please enter the 6-digit authentication code sent to{' '}
            <span className='font-semibold text-foreground max-sm:inline sm:mt-1.5 sm:block sm:tracking-wider'>
              {phoneForOtp}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter className='text-start sm:justify-center'>
          <p className='text-start sm:text-center text-sm text-muted-foreground sm:px-8'>
            Wrong number?{' '}
            <Link
              to='/sign-in'
              onClick={() => setPhoneForOtp('')}
              search={redirect ? { redirect } : undefined}
              className='underline underline-offset-4 hover:text-primary'
            >
              Change mobile number
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
