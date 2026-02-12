import React from 'react';

export const Textarea = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full group">
      {label && (
        <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3
          bg-white
          border-2 ${error ? 'border-red-500' : 'border-gray-100 hover:border-gray-200'}
          rounded-xl
          text-gray-900 font-medium
          placeholder:text-gray-300
          focus:outline-none focus:border-[#870a42] focus:ring-4 focus:ring-[#870a42]/5
          transition-all duration-200
          resize-none
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-tight">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};