import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold text-slate-800">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500">
            An unexpected error occurred. Please try again.
          </p>
          <button
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
