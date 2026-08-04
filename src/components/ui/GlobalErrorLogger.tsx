'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalErrorLogger() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      logger.error('GlobalErrorLogger', 'Uncaught error', {
        route: window.location.pathname,
        message: event.message,
        file: event.filename,
        line: event.lineno,
      })
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      logger.error('GlobalErrorLogger', 'Unhandled promise rejection', {
        route: window.location.pathname,
        reason:
          event.reason instanceof Error
            ? logger.serializeError(event.reason)
            : String(event.reason),
      })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
