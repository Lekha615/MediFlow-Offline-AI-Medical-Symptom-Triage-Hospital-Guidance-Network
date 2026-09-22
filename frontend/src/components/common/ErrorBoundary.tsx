import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error Boundary Exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {this.props.fallbackTitle || "Staff Portal could not be loaded."}
          </h2>
          <p className="text-xs text-rose-300 font-mono bg-rose-950/40 p-3 rounded-lg border border-rose-500/30 overflow-x-auto text-left">
            {this.state.error?.message || "An unexpected error occurred during rendering."}
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry Loading Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
