import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar as MuiAvatar, Chip, Button, Divider, Typography, Drawer } from '@mui/material';
import logo from '../styles/logo.png';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';


import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';

import { useApp } from '../lib/context/AppContext';
import { rmDataUser } from '../storages/user.model.jsx';

export const Sidebar = () => {
  const { user, setUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Escuchar el evento del Header
  React.useEffect(() => {
    const handleToggleMenu = () => {
      setMobileOpen(prev => !prev);
    };

    window.addEventListener('toggleMobileMenu', handleToggleMenu);
    return () => {
      window.removeEventListener('toggleMobileMenu', handleToggleMenu);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    rmDataUser();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    if (!role) return null;
    const badges = {
      cliente: { text: 'CLIENTE', colorKey: 'info' },
      estudiante: { text: 'ESTUDIANTE', colorKey: 'secondary' },
      admin: { text: 'ADMIN', colorKey: 'primary' },
    };
    return badges[role] || badges.cliente;
  };

  const getNavItems = () => {
    // Items públicos
    const publicItems = [
      { icon: HomeIcon, label: 'Inicio', path: '/' },
      { icon: SchoolIcon, label: 'Carreras', path: '/carreras' },
    ];

    if (!user) return publicItems;

    const common = [
      { icon: HomeIcon, label: 'Inicio', path: '/' },
      { icon: SchoolIcon, label: 'Carreras', path: '/carreras' },
      { icon: PersonIcon, label: 'Mi Perfil', path: '/perfil' },
    ];

    const clienteItems = [
      { icon: PostAddIcon, label: 'Publicar Requerimiento', path: '/publicar-requerimiento' },
      { icon: FactCheckIcon, label: 'Mis Requerimientos', path: '/mis-requerimientos' },
    ];

    const estudianteItems = [
      { icon: WorkIcon, label: 'Mis Servicios', path: '/mis-servicios' },
      { icon: AddCircleIcon, label: 'Crear Servicio', path: '/crear-servicio' },
      { icon: BusinessCenterIcon, label: 'Bolsa de Trabajo', path: '/bolsa-trabajo' },
    ];

    const adminItems = [
      { icon: PeopleIcon, label: 'Usuarios', path: '/admin/usuarios' },
      { icon: WorkIcon, label: 'Servicios', path: '/admin/servicios' },
      { icon: SchoolIcon, label: 'Carreras', path: '/admin/carreras' },
      { icon: ShieldIcon, label: 'Panel Admin', path: '/dashboard' },
    ];

    if (user.role === 'admin') return [...adminItems];
    if (user.role === 'estudiante') return [...common, ...estudianteItems];
    // Cliente por defecto
    return [...common, ...clienteItems];
  };

  const navItems = getNavItems();
  const roleBadge = user ? getRoleBadge(user.role) : null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.1)'),
          },
        }}
        onClick={() => {
          navigate('/');
          setMobileOpen(false);
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="UIDE Logo"
              sx={{
                width: '40px',
                height: 'auto',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                fontWeight: 700
              }}
            >
              UIDE
            </Typography>
          </Box>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.8)'),
            fontWeight: 500,
            display: 'block',
            mb: 1.5
          }}
        >
          Portal Estudiantil de Servicios
        </Typography>

        {roleBadge && (
          <Box>
            <Chip
              label={roleBadge.text}
              size="small"
              sx={{
                bgcolor: (theme) => {
                  const key = roleBadge.colorKey;
                  const main = theme.palette[key]?.main || theme.palette.primary.main;
                  return theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : `${main}1A`;
                },
                color: (theme) => {
                  const key = roleBadge.colorKey;
                  return theme.palette[key]?.main || theme.palette.primary.main;
                },
                fontWeight: 900,
                fontSize: '0.625rem',
                letterSpacing: '0.1em',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <List sx={{ p: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    borderLeft: (theme) => {
                      if (!isActive) return '4px solid transparent';
                      return theme.palette.mode === 'dark' ? `4px solid ${theme.palette.primary.main}` : '4px solid white';
                    },
                    px: 2,
                    py: 1.5,
                    bgcolor: (theme) => {
                      if (!isActive) return 'transparent';
                      return theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(255, 255, 255, 0.12)';
                    },
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.08)'),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer - User Profile or Login/Register */}
      <Box
        sx={{
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.05)'),
        }}
      >
        {user ? (
          <>
            <Box
              onClick={() => {
                navigate('/perfil');
                setMobileOpen(false);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                p: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.1)'),
                },
              }}
            >
              <MuiAvatar
                src={user.image}
                alt={user.name}
                sx={{
                  width: 40,
                  height: 40,
                  border: (theme) => `2px solid ${theme.palette.divider}`,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : '#ffffff'),
                  color: 'primary.main',
                  fontWeight: 700,
                }}
              >
                {user.name?.charAt(0)}
              </MuiAvatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.6)'),
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(255, 255, 255, 0.1)'),
                color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.2)'),
                },
              }}
            >
              Cerrar Sesión
            </Button>

          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              component={Link}
              to="/login"
              onClick={() => setMobileOpen(false)}
              variant="contained"
              sx={{
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#ffffff'),
                color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.primary.contrastText : theme.palette.primary.main),
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.9)'),
                },
              }}
            >
              Iniciar Sesión
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/registro"
              onClick={() => setMobileOpen(false)}
              variant="outlined"
              sx={{
                borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(255, 255, 255, 0.5)'),
                color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white'),
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.1)'),
                },
              }}
            >
              Registrarse
            </Button>

          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 240,
          height: '100vh',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main),
          boxShadow: (theme) => (theme.palette.mode === 'dark'
            ? '0 18px 45px -15px rgba(0, 0, 0, 0.75)'
            : '0 18px 45px -15px rgba(0, 0, 0, 0.45)'),
          zIndex: 1200,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {drawerContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main),
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
