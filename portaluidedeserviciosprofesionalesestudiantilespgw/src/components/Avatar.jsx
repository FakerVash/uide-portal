import React from 'react';

export const Avatar = ({
  name,
  image,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    profile: 'w-48 h-48 text-5xl', // Ajustado ligeramente para mejor equilibrio visual
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        flex items-center justify-center
        font-bold
        relative
        overflow-hidden
        ${image ? '' : 'text-white shadow-inner'}
        ${size === 'profile' ? 'border-[6px] border-white shadow-2xl' : 'shadow-sm'}
        ${className}
      `}
      style={!image ? { backgroundColor: '#870a42' } : {}}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="tracking-tighter">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};