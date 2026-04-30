'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
            <p className="text-4xl">⚠️</p>
            <p className="font-semibold">Something went wrong.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm underline text-foreground/60"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
