import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';


import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';



import { useApp } from '../lib/context/AppContext';

export const Header = () => {
  const { darkMode, toggleDarkMode, user } = useApp();
  const navigate = useNavigate();



  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: 72,
        borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
        px: { xs: 2, md: 4 },
        py: 2,
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 10px 30px -18px rgba(15, 23, 42, 0.55)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, height: '100%' }}>
        {/* Mensaje de Bienvenida */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Typography
            variant="h6"
            sx={{
              color: '#0f172a',
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
              color: '#334155',
              '&:hover': {
                bgcolor: 'rgba(148, 163, 184, 0.2)',
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