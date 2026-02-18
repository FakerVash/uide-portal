import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { School, Work } from '@mui/icons-material';

const CarreraBadge = ({ carrera, size = 'medium', showName = true, variant = 'default' }) => {
  console.log('CarreraBadge - carrera:', carrera);
  if (!carrera) return null;

  const sizes = {
    small: { width: 32, height: 32, fontSize: '0.8rem', avatarSize: 32 },
    medium: { width: 48, height: 48, fontSize: '0.9rem', avatarSize: 48 },
    large: { width: 64, height: 64, fontSize: '1.1rem', avatarSize: 64 },
    profile: { width: 80, height: 80, fontSize: '1.2rem', avatarSize: 80 }
  };

  const currentSize = sizes[size] || sizes.medium;

  const isProfileVariant = variant === 'profile';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: isProfileVariant ? 2 : 1,
        flexWrap: 'nowrap'
      }}
    >
      {/* Imagen de la carrera - más grande para perfil */}
      <Avatar
        src={carrera.imagen_carrera}
        alt={carrera.nombre_carrera}
        sx={{
          width: currentSize.avatarSize,
          height: currentSize.avatarSize,
          bgcolor: isProfileVariant ? '#870a42' : 'primary.main',
          border: isProfileVariant ? '3px solid #870a42' : '2px solid',
          borderColor: isProfileVariant ? '#870a42' : 'primary.light',
          boxShadow: isProfileVariant ? '0 4px 12px rgba(135, 10, 66, 0.3)' : 'none'
        }}
      >
        <School sx={{ fontSize: currentSize.fontSize * 1.2 }} />
      </Avatar>

      {/* Nombre de la carrera */}
      {showName && (
        <Box>
          <Typography
            variant={isProfileVariant ? "h6" : "body2"}
            sx={{
              fontSize: currentSize.fontSize,
              fontWeight: isProfileVariant ? 800 : 600,
              color: isProfileVariant ? '#870a42' : 'text.primary',
              display: { xs: 'none', sm: 'block' },
              lineHeight: 1.2
            }}
          >
            {carrera.nombre_carrera}
          </Typography>

          {/* Badge móvil */}
          <Chip
            label={carrera.nombre_carrera}
            size="small"
            icon={<School />}
            sx={{
              display: { xs: 'block', sm: 'none' },
              bgcolor: 'rgba(135, 10, 66, 0.1)',
              color: '#870a42',
              fontWeight: 600
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CarreraBadge;
