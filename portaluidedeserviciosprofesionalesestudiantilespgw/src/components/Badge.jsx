import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    // Estilos basados en fondos suaves y textos intensos (Modern UI)
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    error: 'bg-rose-50 text-rose-700 border border-rose-100',
    info: 'bg-sky-50 text-sky-700 border border-sky-100',
    default: 'bg-gray-50 text-gray-600 border border-gray-100',
    // Variante principal con tu color institucional
    gradient: 'text-white border-transparent shadow-sm', 
  };

  // Estilo en línea para el color institucional exacto en la variante 'gradient'
  const badgeStyle = variant === 'gradient' ? { backgroundColor: '#870a42' } : {};

  return (
    <span
      style={badgeStyle}
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-lg
        text-[10px] font-black uppercase tracking-widest
        transition-colors duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};