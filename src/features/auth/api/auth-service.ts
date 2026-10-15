import { publicApi, protectedApi } from '@/lib/api/axios-client'
import type {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  RegisterPayload,
  RegisterResponse,
} from './types'
import type { AuthUser } from '@/stores/auth-store'

export const authService = {
  /**
   * Request an OTP for a given mobile number
   */
  sendOtp: async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    const response = await publicApi.post<SendOtpResponse>(
      'api/auth/send-otp',
      payload
    )
    return response.data
  },

  /**
   * Verify entered OTP and receive user profile with authentication tokens
   */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await publicApi.post<VerifyOtpResponse>(
      'api/auth/verify-otp',
      payload
    )
    return response.data
  },

  /**
   * Complete user registration profile
   */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await protectedApi.post<RegisterResponse>(
      'api/auth/register',
      payload
    )
    return response.data
  },

  /**
   * Fetch current authenticated user profile
   */
  getMe: async (): Promise<AuthUser> => {
    const response = await protectedApi.get<AuthUser>('api/auth/me')
    return response.data
  },

  /**
   * Logout user from session
   */
  logout: async (): Promise<void> => {
    await protectedApi.post('api/auth/logout')
  },
}
