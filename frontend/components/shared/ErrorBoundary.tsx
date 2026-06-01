'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">Something went wrong</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
