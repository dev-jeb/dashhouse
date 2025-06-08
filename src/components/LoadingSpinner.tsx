import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-forest-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-forest-100 mb-2">Hold on I'm busy</h2>
        <p className="text-forest-300">{message || 'Fetching latest data...'}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;