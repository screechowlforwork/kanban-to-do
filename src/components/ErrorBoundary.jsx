import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary component for catching React errors
 */
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
        
        // Log error to console
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
        
        // You could also log to an error tracking service here
        // e.g., Sentry, LogRocket, etc.
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        // Clear localStorage and reload
        if (window.confirm('This will reset all your data. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0F0F12] text-white p-6">
                    <div className="max-w-lg w-full">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-red-500/10 ring-2 ring-red-500/30">
                                <AlertTriangle size={48} className="text-red-400" />
                            </div>
                        </div>
                        
                        {/* Error Title */}
                        <h1 className="text-2xl font-bold text-center mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-400 text-center mb-6">
                            The application encountered an unexpected error.
                        </p>
                        
                        {/* Error Details (collapsible) */}
                        <details className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                            <summary className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                                Show error details
                            </summary>
                            <div className="mt-4 space-y-3">
                                <div className="p-3 bg-black/50 rounded-lg overflow-auto max-h-32">
                                    <code className="text-xs font-mono text-red-400 block whitespace-pre-wrap">
                                        {this.state.error && this.state.error.toString()}
                                    </code>
                                </div>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-500 overflow-auto max-h-48 p-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        </details>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg"
                            >
                                <RefreshCw size={18} />
                                Reload App
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all border border-white/10"
                            >
                                <Home size={18} />
                                Reset Data
                            </button>
                        </div>
                        
                        {/* Help Text */}
                        <p className="text-center text-xs text-gray-600 mt-6">
                            If this problem persists, try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
