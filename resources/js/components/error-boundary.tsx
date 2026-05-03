import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 bg-chat-background p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive/60" />
                    <div>
                        <h3 className="font-medium text-foreground">Something went wrong</h3>
                        <p className="mt-1 text-sm text-muted-foreground">An unexpected error occurred in the chat view.</p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
