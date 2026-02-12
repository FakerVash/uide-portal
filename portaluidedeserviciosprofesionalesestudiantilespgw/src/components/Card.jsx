import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-10', // Aumentado para dar un aspecto más premium
  };

  return (
    <div
      className={`
        bg-white
        rounded-[2rem] /* Bordes más redondeados y modernos */
        border border-gray-100/50
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] /* Sombra muy sutil y elegante */
        ${paddings[padding]}
        ${hover ? 'transition-all duration-500 hover:shadow-[0_20px_50px_rgba(135,10,66,0.05)] hover:-translate-y-2' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};