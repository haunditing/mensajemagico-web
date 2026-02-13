import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'blue' | 'white' | 'slate' | 'current';
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
    blue: 'border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 dark:border-slate-700 border-t-slate-500 dark:border-t-slate-400',
    current: 'border-current/30 border-t-current', // Se adapta al color de texto del padre
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`} />
  );
};

export default LoadingSpinner;