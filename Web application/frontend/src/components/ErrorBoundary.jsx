import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-4">
              An unexpected error occurred while rendering this section:
            </p>
            <div className="bg-slate-100 p-3.5 rounded-lg text-left text-xs font-mono text-red-600 overflow-x-auto max-h-60 mb-5 border border-red-200">
              <div className="font-bold text-red-700">{this.state.error?.toString() || 'Unknown runtime error'}</div>
              {this.state.error?.stack && (
                <div className="mt-2 text-[10px] text-slate-700 font-mono whitespace-pre-wrap leading-tight border-t border-slate-200 pt-2">
                  {this.state.error.stack}
                </div>
              )}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono whitespace-pre-wrap leading-tight border-t border-slate-200 pt-1">
                  <b>Component Stack:</b>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#7a1521] text-white rounded-lg text-xs font-semibold hover:bg-[#58000f] flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('serva_user');
                  localStorage.removeItem('serva_token');
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
