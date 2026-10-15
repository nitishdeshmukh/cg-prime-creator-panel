import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const REFRESH_TOKEN = 'refresh_token'
const OTP_PHONE = 'otp_phone_number'

export interface AuthUser {
  id?: number
  accountNo?: string
  phoneNumber?: string
  name?: string | null
  email?: string | null
  profilePicLink?: string | null
  latestAppVersion?: string
  city?: string
  state?: string
  country?: string
  bio?: string | null
  youtubeLink?: string | null
  role?: string[]
  exp?: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    refreshToken: string
    setAccessToken: (accessToken: string) => void
    setTokens: (accessToken: string, refreshToken?: string) => void
    resetAccessToken: () => void
    reset: () => void
    phoneForOtp: string
    setPhoneForOtp: (phone: string) => void
  }
}

/**
 * Safely parse cookie values without throwing on invalid JSON or string 'undefined'
 */
function safeParseToken(raw: string | undefined): string {
  if (!raw || raw === 'undefined' || raw === 'null') return ''
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'string' ? parsed : String(parsed)
  } catch {
    return raw
  }
}

const USER_DATA = 'cg_auth_user'

function getStoredUser(): AuthUser | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_DATA) : null
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initAccessToken = safeParseToken(getCookie(ACCESS_TOKEN))
  const initRefreshToken = safeParseToken(getCookie(REFRESH_TOKEN))
  const initOtpPhone = getCookie(OTP_PHONE) || ''
  const initUser = getStoredUser()

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          try {
            if (user) {
              localStorage.setItem(USER_DATA, JSON.stringify(user))
            } else {
              localStorage.removeItem(USER_DATA)
            }
          } catch {
            // ignore
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initAccessToken,
      refreshToken: initRefreshToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          if (accessToken) {
            setCookie(ACCESS_TOKEN, accessToken)
          } else {
            removeCookie(ACCESS_TOKEN)
          }
          return { ...state, auth: { ...state.auth, accessToken: accessToken || '' } }
        }),
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          if (accessToken) {
            setCookie(ACCESS_TOKEN, accessToken)
          }
          if (refreshToken) {
            setCookie(REFRESH_TOKEN, refreshToken)
          } else {
            removeCookie(REFRESH_TOKEN)
          }
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken: accessToken || '',
              refreshToken: refreshToken || '',
            },
          }
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
          removeCookie(REFRESH_TOKEN)
          removeCookie(OTP_PHONE)
          try {
            localStorage.removeItem(USER_DATA)
          } catch {
            // ignore
          }
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
              phoneForOtp: '',
            },
          }
        }),
    },
  }
})
