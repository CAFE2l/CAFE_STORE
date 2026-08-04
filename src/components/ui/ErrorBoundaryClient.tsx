'use client'

import React from 'react'
import { logger } from '@/lib/logger'

type ErrorBoundaryState = { hasError: boolean; error?: Error }

type ErrorBoundaryClientProps = React.PropsWithChildren<{
  context?: Record<string, unknown>
}>

export class ErrorBoundaryClient extends React.Component<ErrorBoundaryClientProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryClientProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // Log for debugging; keeps minimal output in production
    logger.error('ErrorBoundaryClient', 'Component render failed', {
      ...(this.props.context ?? {}),
      error: logger.serializeError(error),
      componentStack: info?.componentStack ?? undefined,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-900/10 border border-red-800 text-red-200">
          <h2 className="font-semibold">Ocorreu um erro ao carregar este componente.</h2>
          <pre className="mt-2 text-xs text-red-200/80">{String(this.state.error?.message)}</pre>
          <details className="mt-2 text-xs text-red-200/60">{this.state.error?.stack}</details>
        </div>
      )
    }

    return this.props.children as React.ReactElement
  }
}

export default ErrorBoundaryClient
