import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    gradient: 'gradient-bg text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-semibold
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
