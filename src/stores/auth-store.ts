import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const OTP_PHONE = 'otp_phone_number'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    phoneForOtp: string
    setPhoneForOtp: (phone: string) => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  const initOtpPhone = getCookie(OTP_PHONE) || ''

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      phoneForOtp: initOtpPhone,
      setPhoneForOtp: (phone) =>
        set((state) => {
          if (phone) {
            setCookie(OTP_PHONE, phone, 60 * 10) // 10 minutes validity
          } else {
            removeCookie(OTP_PHONE)
          }
          return { ...state, auth: { ...state.auth, phoneForOtp: phone } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(OTP_PHONE)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              phoneForOtp: '',
            },
          }
        }),
    },
  }
})
