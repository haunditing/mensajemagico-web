import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'blue' | 'white' | 'slate';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    blue: 'border-slate-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 border-t-slate-500',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`} />
  );
};

export default LoadingSpinner;