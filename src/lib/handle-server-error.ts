import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (typeof data === 'string' && data.length > 0) {
      errMsg = data
    } else if (data && typeof data === 'object') {
      const serverMessage = (data as Record<string, unknown>).message
      const serverTitle = (data as Record<string, unknown>).title
      if (typeof serverMessage === 'string' && serverMessage.length > 0) {
        errMsg = serverMessage
      } else if (typeof serverTitle === 'string' && serverTitle.length > 0) {
        errMsg = serverTitle
      }
    } else if (error.message) {
      errMsg = error.message
    }
  }

  toast.error(errMsg)
}
