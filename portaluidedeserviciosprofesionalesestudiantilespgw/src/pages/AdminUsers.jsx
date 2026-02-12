import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar as MuiAvatar, Chip, IconButton, Divider } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import ButtonMui from '../components/ButtonMui.jsx';
import { toast } from 'sonner';

import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch('/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedUsers = data.map(user => ({
          id: user.id_usuario,
          name: `${user.nombre} ${user.apellido}`,
          email: user.email,
          role: user.rol.toLowerCase(), // Frontend expects lowercase
          image: user.foto_perfil,
          university: 'UIDE', // Defaulting as backend doesn't send university name directly in list?
          career: user.carrera?.nombre_carrera || 'N/A'
        }));
        setUsers(formattedUsers);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error de conexión');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
        const token = userData.token;

        if (!token) {
          toast.error('No se encontró el token de autenticación');
          return;
        }

        const response = await fetch(`/api/usuarios/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUsers(users.filter((u) => u.id !== userId));
          toast.success('Usuario eliminado correctamente');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || errorData.message || 'Error al eliminar el usuario');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error de conexión');
      }
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      cliente: { text: 'CLIENTE', bgColor: '#f0f9ff', textColor: '#0369a1' },
      estudiante: { text: 'ESTUDIANTE', bgColor: '#ecfdf5', textColor: '#047857' },
      admin: { text: 'ADMIN', bgColor: '#fff1f2', textColor: '#870a42' },
    };
    return badges[role] || badges.cliente;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ml: { xs: 0, md: '240px' },
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Header />
        <Box
          component="main"
          sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, minHeight: '100%', backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 0.5 }}>
                  Gestión de Usuarios
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  Administra y supervisa las cuentas de la plataforma
                </Typography>
              </Box>
            </Box>


            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderLeft: '4px solid #870a42',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Total Usuarios
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
                    {users.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderLeft: '4px solid #10b981',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Estudiantes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
                    {users.filter((u) => u.role === 'estudiante').length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderLeft: '4px solid #0ea5e9',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Clientes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
                    {users.filter((u) => u.role === 'cliente').length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>


            <Box sx={{ mb: 2, px: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#374151' }}>
                Usuarios Registrados
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <Paper
                    key={user.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <MuiAvatar
                        src={user.image}
                        alt={user.name}
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: '#870a42',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 900,
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        {user.name?.charAt(0)}
                      </MuiAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#111827', mb: 0.5 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                          {user.email}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Chip
                            label={roleBadge.text}
                            sx={{
                              bgcolor: roleBadge.bgColor,
                              color: roleBadge.textColor,
                              fontWeight: 900,
                              fontSize: '0.625rem',
                              letterSpacing: '0.15em',
                              height: 24,
                            }}
                          />
                          {user.career && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 4,
                                  height: 4,
                                  bgcolor: '#d1d5db',
                                  borderRadius: '50%',
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                {user.career}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {user.role !== 'admin' && (
                        <IconButton
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{
                            color: '#9ca3af',
                            borderRadius: 3,
                            border: '1px solid #f3f4f6',
                            '&:hover': {
                              color: '#ef4444',
                              bgcolor: '#fef2f2',
                              borderColor: '#fecaca',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};