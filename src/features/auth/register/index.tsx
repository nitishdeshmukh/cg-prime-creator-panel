import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { RegisterForm } from './components/register-form'

export function Register() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-md gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Complete your profile
          </CardTitle>
          <CardDescription>
            Enter your details below to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <p className='px-4 text-center text-xs text-muted-foreground'>
            By completing registration, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
