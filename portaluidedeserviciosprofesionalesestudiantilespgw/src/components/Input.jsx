import React from 'react';

export const Input = ({
  label,
  error,
  icon,
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
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#870a42] transition-colors">
            {React.cloneElement(icon, { size: 20 })}
          </div>
        )}
        <input
          className={`
            w-full h-12 px-4 ${icon ? 'pl-12' : ''}
            bg-white
            border-2 ${error ? 'border-red-500' : 'border-gray-100 hover:border-gray-200'}
            rounded-xl
            text-gray-900 font-medium
            placeholder:text-gray-300
            focus:outline-none focus:border-[#870a42] focus:ring-4 focus:ring-[#870a42]/5
            transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-tight">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};