import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { isValidPhoneNumber } from 'react-phone-number-input'
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
import { PhoneInput } from '@/components/phone-input'
import { useSendOtp } from '@/features/auth/api/use-send-otp'

const formSchema = z.object({
  phone: z
    .string()
    .min(1, 'Please enter your mobile number.')
    .refine((val) => isValidPhoneNumber(val || ''), {
      message: 'Please enter a valid mobile number.',
    }),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const { mutate: sendOtp, isPending } = useSendOtp({ redirectTo })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendOtp({
      type: 1,
      phoneNumber: data.phone,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder='Enter mobile number'
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2' disabled={isPending}>
          {isPending ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <ArrowRight className='size-4' />
          )}
          Send OTP
        </Button>
      </form>
    </Form>
  )
}
