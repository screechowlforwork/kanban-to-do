import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
                    <div className="max-w-2xl w-full bg-neutral-800 p-8 rounded-lg shadow-xl border border-rose-500">
                        <h1 className="text-2xl font-bold text-rose-500 mb-4">Something went wrong</h1>
                        <div className="bg-black/50 p-4 rounded overflow-auto mb-4">
                            <code className="text-sm font-mono text-red-400">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>
                        <details className="whitespace-pre-wrap text-xs text-gray-400">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
