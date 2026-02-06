
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  // Explicitly defining children as optional to satisfy React 18+ type requirements
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches runtime errors in its children tree.
 * Inherits from Component with explicit Props and State interfaces.
 */
// Use Component directly from 'react' to ensure inherited properties like 'state' and 'props' are correctly resolved.
class ErrorBoundary extends Component<Props, State> {
  // Declare state and props properties; removing 'override' modifier as it causes issues in this environment.
  // Fix: Explicitly declare props and state to satisfy the environment requirements where inheritance might not be fully recognized.
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    // Initialize props and state
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  /** Updates state so the next render shows the fallback UI */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /** Logs error information to the console for debugging */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    // Accessing this.state which is now correctly typed via Component inheritance.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe locally.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-500 font-mono">
                    {this.state.error?.message}
                </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // Accessing this.props.children which is now correctly typed via Component inheritance.
    return this.props.children;
  }
}

export default ErrorBoundary;
