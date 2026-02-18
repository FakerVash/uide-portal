import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';

import { useApp } from '../lib/context/AppContext';

export const Header = () => {
  const { darkMode, toggleDarkMode, user } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Función para obtener el color del botón según el saludo
  const getMenuButtonColor = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '#fbbf24'; // Amarillo para Buenos días
    } else if (hour >= 12 && hour < 19) {
      return '#f59e0b'; // Naranja para Buenas tardes
    } else {
      return '#8b5cf6'; // Azul para Buenas noches
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Disparar evento para que el Sidebar lo escuche
    window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: 72,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, md: 2 },
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255,255,255,0.92)'),
        backdropFilter: 'blur(14px)',
        boxShadow: (theme) => (theme.palette.mode === 'dark'
          ? '0 10px 30px -18px rgba(0, 0, 0, 0.75)'
          : '0 10px 30px -18px rgba(15, 23, 42, 0.55)'),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, height: '100%' }}>
        {/* Mobile Menu Button - Solo visible en móviles */}
        <IconButton
          onClick={handleMobileMenuToggle}
          sx={{
            display: { xs: 'flex', md: 'none' },
            color: getMenuButtonColor(),
            zIndex: 1600,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'),
            border: (theme) => `1px solid ${getMenuButtonColor()}`,
            '&:hover': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? `${getMenuButtonColor()}33` : `${getMenuButtonColor()}22`),
              transform: 'scale(1.05)',
            },
          }}
          aria-label="Toggle mobile menu"
        >
          <MenuIcon sx={{ color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff' : '#870a42'), fontSize: 24, p: 0 }} />
        </IconButton>

        {/* Mensaje de Bienvenida */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            {(() => {
              const hour = new Date().getHours();
              let greeting = 'Buenas noches';
              if (hour >= 5 && hour < 12) greeting = 'Buenos días';
              else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

              const name = user ? user.name.split(' ')[0] : 'Usuario';
              return `${greeting}, ${name}`;
            })()}
          </Typography>
        </Box>

        {/* Iconos de acción */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle Dark Mode */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.2)'),
              },
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};