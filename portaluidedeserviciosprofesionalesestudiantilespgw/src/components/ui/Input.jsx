import React from 'react';

export const Input = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full h-12 px-4 ${icon ? 'pl-12' : ''}
            bg-white/90 dark:bg-gray-900/60 backdrop-blur
            border ${error ? 'border-red-500' : 'border-[--border-color] dark:border-gray-700'}
            rounded-xl
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            shadow-sm
            focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-gold/70'}
            focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-100/70 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
