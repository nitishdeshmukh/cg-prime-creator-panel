import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parsePhoneNumber } from 'react-phone-number-input'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { IconYoutube } from '@/assets/custom/icon-youtube'
import { useAuthStore } from '@/stores/auth-store'
import { useRegister } from '@/features/auth/api/use-register'
import { authService } from '@/features/auth/api/auth-service'
import { handleServerError } from '@/lib/handle-server-error'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be less than 50 characters.'),
  phoneNumber: z.string().optional(),
  email: z
    .string()
    .min(1, 'Please enter your email address.')
    .email('Please enter a valid email address.'),
  bio: z
    .string()
    .max(250, 'Bio must be less than 250 characters.')
    .optional(),
  youtubeLink: z
    .string()
    .url('Please enter a valid URL (e.g. https://youtube.com/@channel).')
    .or(z.literal(''))
    .optional(),
})

type RegisterFormValues = z.infer<typeof formSchema>

export function RegisterForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const isMobile = useIsMobile()
  const [mobileStep, setMobileStep] = useState<1 | 2>(1)
  const { user, phoneForOtp, dialCodeForOtp } = useAuthStore(
    (state) => state.auth
  )
  const { mutate: register, isPending } = useRegister()

  const prefilledPhone = user?.phoneNumber || phoneForOtp || ''

  // Email on-the-spot verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false)
  const [emailOtp, setEmailOtp] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Countdown timer for resending email OTP
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: prefilledPhone,
      email: user?.email || '',
      bio: user?.bio || '',
      youtubeLink: user?.youtubeLink || '',
    },
  })

  const emailValue = form.watch('email')

  const getPhoneAndDialCode = () => {
    let nationalPhone = prefilledPhone
    let dialCode = dialCodeForOtp || '+91'

    try {
      const parsed = parsePhoneNumber(prefilledPhone)
      if (parsed?.nationalNumber) {
        nationalPhone = parsed.nationalNumber
      }
      if (parsed?.countryCallingCode) {
        dialCode = `+${parsed.countryCallingCode}`
      }
    } catch {
      if (nationalPhone.startsWith(dialCode)) {
        nationalPhone = nationalPhone.slice(dialCode.length)
      }
    }

    return { nationalPhone, dialCode }
  }

  const handleSendEmailOtp = async () => {
    const isEmailValid = await form.trigger('email')
    if (!isEmailValid) return

    setIsSendingOtp(true)
    try {
      const res = await authService.sendEmailOtp({
        email: emailValue.trim().toLowerCase(),
      })
      toast.success(res.message || `Verification OTP sent to ${emailValue}`)
      setIsOtpSent(true)
      setIsOtpDialogOpen(true)
      setResendCountdown(30)
      setEmailOtp('')
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP sent to your email.')
      return
    }

    setIsVerifyingOtp(true)
    try {
      const res = await authService.verifyEmailOtp({
        email: emailValue.trim().toLowerCase(),
        otp: emailOtp.trim(),
      })
      toast.success(res.message || 'Email verified successfully!')
      setIsEmailVerified(true)
      setIsOtpSent(false)
      setIsOtpDialogOpen(false)
      form.clearErrors('email')
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleNext = async () => {
    const isNameValid = await form.trigger('name')
    const isEmailValid = await form.trigger('email')

    if (!isNameValid || !isEmailValid) return

    if (!isEmailVerified) {
      form.setError('email', {
        message: 'Please verify your email address before proceeding.',
      })
      return
    }

    setMobileStep(2)
  }

  function onSubmit(data: RegisterFormValues) {
    if (isMobile && mobileStep === 1) {
      void handleNext()
      return
    }

    if (!isEmailVerified) {
      form.setError('email', {
        message: 'Please verify your email address before completing registration.',
      })
      return
    }

    const { nationalPhone, dialCode } = getPhoneAndDialCode()

    register({
      name: data.name.trim(),
      phoneNumber: nationalPhone,
      dialCode: dialCode,
      email: data.email.trim().toLowerCase(),
      bio: data.bio?.trim() || undefined,
      youtubeLink: data.youtubeLink?.trim() || undefined,
    })
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('grid gap-4', className)}
          {...props}
        >
          {/* {isMobile && (
            <div className='flex items-center justify-between text-xs text-muted-foreground border-b pb-2 mb-1'>
              <span className='font-medium text-foreground'>
                Step {mobileStep} of 2
              </span>
              <span>
                {mobileStep === 1 ? 'Personal Details' : 'Channel & Bio'}
              </span>
            </div>
          )} */}

          {/* Step 1 Fields: Name, Mobile Number, Email (with verification) */}
          <div className={cn('grid gap-4', isMobile && mobileStep !== 1 && 'hidden')}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='Enter your name'
                        className='pl-9'
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Phone className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        {...field}
                        value={prefilledPhone}
                        disabled
                        readOnly
                        className='pl-9 bg-muted cursor-not-allowed select-none'
                        placeholder='+91...'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field with Dialog-based OTP Verification */}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>
                      Email Address <span className='text-destructive'>*</span>
                    </FormLabel>
                    {isEmailVerified && (
                      <Badge
                        variant='outline'
                        className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-0.5 px-2 flex items-center gap-1 font-normal'
                      >
                        <CheckCircle2 className='size-3.5' /> Verified
                      </Badge>
                    )}
                  </div>

                  <FormControl>
                    <div className='flex gap-2'>
                      <div className='relative flex-1'>
                        <Mail className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                          placeholder='name@example.com'
                          type='email'
                          className='pl-9'
                          disabled={isPending || isSendingOtp || isEmailVerified}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            if (isEmailVerified) {
                              setIsEmailVerified(false)
                              setIsOtpSent(false)
                            }
                          }}
                        />
                      </div>

                      {!isEmailVerified && (
                        <Button
                          type='button'
                          variant={isOtpSent ? 'secondary' : 'outline'}
                          onClick={() => {
                            if (isOtpSent) {
                              setIsOtpDialogOpen(true)
                            } else {
                              handleSendEmailOtp()
                            }
                          }}
                          disabled={
                            isSendingOtp ||
                            isPending ||
                            !field.value
                          }
                          className='shrink-0 text-xs'
                        >
                          {isSendingOtp ? (
                            <Loader2 className='size-3.5 animate-spin' />
                          ) : isOtpSent ? (
                            'Enter OTP'
                          ) : (
                            'Verify Email'
                          )}
                        </Button>
                      )}

                      {isEmailVerified && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setIsEmailVerified(false)
                            setIsOtpSent(false)
                            setEmailOtp('')
                          }}
                          className='text-xs text-muted-foreground hover:text-foreground h-9 px-2'
                        >
                          Change
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Step 2 Fields: Bio & YouTube Link */}
          <div className={cn('grid gap-4', isMobile && mobileStep !== 2 && 'hidden')}>
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Textarea
                        placeholder='Tell us a little bit about yourself or your channel...'
                        className='resize-none min-h-[80px]'
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='youtubeLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Channel Link</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <IconYoutube className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        placeholder='https://youtube.com/@yourchannel'
                        className='pl-9'
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          {isMobile && mobileStep === 1 ? (
            <Button
              type='button'
              onClick={handleNext}
              className='mt-2 w-full'
            >
              Next
              <ArrowRight className='size-4' />
            </Button>
          ) : isMobile && mobileStep === 2 ? (
            <div className='flex items-center gap-2 mt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setMobileStep(1)}
                disabled={isPending}
                className='flex-1'
              >
                <ArrowLeft className='size-4' />
                Back
              </Button>
              <Button
                type='submit'
                disabled={isPending}
                className='flex-1'
              >
                {isPending ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <ArrowRight className='size-4' />
                )}
                Complete
              </Button>
            </div>
          ) : (
            <Button type='submit' className='mt-2 w-full' disabled={isPending}>
              {isPending ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <ArrowRight className='size-4' />
              )}
              Complete Registration
            </Button>
          )}
        </form>
      </Form>

      {/* Email Verification Dialog using InputOTP matching otp-form */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='text-start sm:text-center'>
            <DialogTitle className='text-base sm:text-lg tracking-tight'>
              Verify Email Address
            </DialogTitle>
            <DialogDescription className='text-start sm:text-center'>
              Please enter the 6-digit verification code sent to{' '}
              <span className='font-semibold text-foreground max-sm:inline sm:mt-1 sm:block sm:tracking-wider'>
                {emailValue}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className='py-2'>
            <div className='flex justify-center'>
              <InputOTP
                maxLength={6}
                disabled={isVerifyingOtp}
                value={emailOtp}
                onChange={(val) => setEmailOtp(val)}
                containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type='button'
              className='mt-6 w-full'
              disabled={emailOtp.length < 6 || isVerifyingOtp}
              onClick={handleVerifyEmailOtp}
            >
              {isVerifyingOtp && (
                <Loader2 className='mr-2 size-4 animate-spin' />
              )}
              Verify & Continue
            </Button>

            <div className='mt-4 text-center text-sm text-muted-foreground'>
              Didn&apos;t receive code?{' '}
              {resendCountdown > 0 ? (
                <span className='font-medium text-foreground'>
                  Resend in {resendCountdown}s
                </span>
              ) : (
                <button
                  type='button'
                  onClick={handleSendEmailOtp}
                  disabled={isSendingOtp}
                  className='underline underline-offset-4 hover:text-primary font-medium text-foreground'
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
