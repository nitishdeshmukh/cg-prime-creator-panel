export interface SendOtpPayload {
  type?: number
  phoneNumber?: string
  email?: string
}

export interface SendOtpResponse {
  error?: boolean
  statusCode?: number
  message?: string
  serverError?: unknown | null
  data?: Record<string, unknown>
}

export interface VerifyOtpPayload {
  type?: number
  phoneNumber?: string
  email?: string
  otp: string
}

export interface BackendUserData {
  id: number
  fcmToken?: string | null
  phoneNumber: string
  name?: string | null
  profilePicLink?: string | null
  latestAppVersion?: string
  accessToken?: string
  refreshToken?: string
  city?: string
  state?: string
  country?: string
  lat?: number
  longitude?: number
  createdAt?: string
  updatedAt?: string
}

export interface VerifyOtpData {
  user: BackendUserData
  creator?: unknown | null
  isNew?: boolean
  accessToken: string
  refreshToken: string
  type?: number
}

export interface VerifyOtpResponse {
  error: boolean
  statusCode: number
  message: string
  serverError: unknown | null
  data: VerifyOtpData
}

export interface RegisterPayload {
  name: string
  phoneNumber?: string
  bio?: string
  youtubeLink?: string
}

export interface RegisterResponse {
  error?: boolean
  statusCode?: number
  message?: string
  data?: unknown
}

export interface RefreshTokenPayload {
  refreshToken?: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
}
