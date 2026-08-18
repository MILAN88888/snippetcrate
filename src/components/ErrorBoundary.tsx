import { __ } from "@wordpress/i18n";
import React, { Component, ErrorInfo, PropsWithChildren } from "react";

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<
  PropsWithChildren<unknown>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<unknown>) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[90vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {__("Oops! Something went wrong.", "snippet-master")}
            </h1>
            <code className="rounded-md bg-muted px-3 py-2 text-sm text-destructive">
              {this.state.error.toString()}
            </code>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
