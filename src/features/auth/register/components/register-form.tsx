import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2, Phone, User } from 'lucide-react'
import { IconYoutube } from '@/assets/custom/icon-youtube'
import { useAuthStore } from '@/stores/auth-store'
import { useRegister } from '@/features/auth/api/use-register'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  const { user, phoneForOtp } = useAuthStore((state) => state.auth)
  const { mutate: register, isPending } = useRegister()

  const prefilledPhone = user?.phoneNumber || phoneForOtp || ''

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: prefilledPhone,
      bio: user?.bio || '',
      youtubeLink: user?.youtubeLink || '',
    },
  })

  const handleNext = async () => {
    const isValid = await form.trigger('name')
    if (isValid) {
      setMobileStep(2)
    }
  }

  function onSubmit(data: RegisterFormValues) {
    if (isMobile && mobileStep === 1) {
      void handleNext()
      return
    }

    register({
      name: data.name.trim(),
      phoneNumber: prefilledPhone,
      bio: data.bio?.trim() || undefined,
      youtubeLink: data.youtubeLink?.trim() || undefined,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >

        {/* Step 1 Fields: Name & Mobile Number */}
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
  )
}
