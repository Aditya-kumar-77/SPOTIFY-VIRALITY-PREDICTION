import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-900/30 border border-red-700 text-red-200">
          <h3 className="font-semibold mb-2">Something went wrong</h3>
          <pre className="text-sm overflow-auto">{this.state.error?.message}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-700 rounded hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
