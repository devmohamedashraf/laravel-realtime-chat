import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
);
