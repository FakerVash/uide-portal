import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar as MuiAvatar, Chip, IconButton, Switch, FormControlLabel } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import ButtonMui from '../components/ButtonMui.jsx';
import { toast } from 'sonner';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null, userName: '' });
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCarreras();
  }, [showInactive]);

  const fetchUsers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/usuarios${showInactive ? '?include_inactive=true' : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedUsers = data.map(user => ({
          id: user.id_usuario,
          name: `${user.nombre} ${user.apellido}`,
          email: user.email,
          role: user.rol.toLowerCase(),
          image: user.foto_perfil,
          career: user.carrera?.nombre_carrera || 'N/A',
          activo: user.activo
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

  const fetchCarreras = async () => {
    try {
      const response = await fetch('/api/carreras');
      if (response.ok) {
        const data = await response.json();
        setCarreras(data);
      }
    } catch (error) {
      console.error('Error fetching careers:', error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setSelectedCarrera(user.id_carrera || '');
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !selectedCarrera) return;

    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/usuarios/${editingUser.id}/admin-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_carrera: selectedCarrera })
      });

      if (response.ok) {
        toast.success('Carrera actualizada exitosamente');
        fetchUsers();
        setOpenEditDialog(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      if (!token) {
        toast.error('No se encontró el token de autenticación');
        return;
      }

      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        toast.success('Usuario desactivado correctamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error de conexión');
    } finally {
      setConfirmDialog({ open: false, userId: null, userName: '' });
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/usuarios/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: true })
      });

      if (response.ok) {
        toast.success('Usuario reactivado correctamente');
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || 'Error al reactivar el usuario');
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Error de conexión');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      cliente: { text: 'CLIENTE', bgColor: 'rgba(3, 105, 161, 0.12)', textColor: '#38bdf8' },
      estudiante: { text: 'ESTUDIANTE', bgColor: 'rgba(4, 120, 87, 0.12)', textColor: '#34d399' },
      admin: { text: 'ADMIN', bgColor: 'rgba(135, 10, 66, 0.15)', textColor: '#f472b6' },
    };
    return badges[role] || badges.cliente;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
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
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, md: 3 },
            minHeight: '100%',
            backgroundImage: (theme) => {
              const overlay = theme.palette.mode === 'dark'
                ? 'linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.92))'
                : 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9))';
              return `${overlay}, url(/uide-watermark.png)`;
            },
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5 }}>
                  Gestión de Usuarios
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Administra y supervisa las cuentas de la plataforma
                </Typography>
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Mostrar inactivos
                    </Typography>
                  }
                />
              </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: '4px solid #870a42',
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Total Usuarios
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {users.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: '4px solid #10b981',
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Estudiantes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {users.filter((u) => u.role === 'estudiante').length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: '4px solid #0ea5e9',
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Clientes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {users.filter((u) => u.role === 'cliente').length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* User List */}
            <Box sx={{ mb: 2, px: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
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
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      boxShadow: 'none',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': {
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                          ? '0 4px 12px rgba(0,0,0,0.4)'
                          : '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main',
                      },
                      opacity: user.activo === false ? 0.7 : 1,
                      filter: user.activo === false ? 'grayscale(0.4)' : 'none',
                      bgcolor: user.activo === false ? (theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') : 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <MuiAvatar
                        src={user.image}
                        alt={user.name}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: '#870a42',
                          color: 'white',
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {user.name?.charAt(0)}
                      </MuiAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }} noWrap>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }} noWrap>
                          {user.email}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={roleBadge.text}
                            size="small"
                            sx={{
                              bgcolor: roleBadge.bgColor,
                              color: roleBadge.textColor,
                              fontWeight: 700,
                              fontSize: '0.6rem',
                              letterSpacing: '0.1em',
                              height: 22,
                              border: `1px solid ${roleBadge.textColor}33`,
                            }}
                          />
                          {user.career && user.career !== 'N/A' && (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                              • {user.career}
                            </Typography>
                          )}
                          {user.activo === false && (
                            <Chip
                              label="INACTIVO"
                              size="small"
                              variant="outlined"
                              color="error"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.6rem',
                                height: 22,
                                borderRadius: 1
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      {user.role !== 'admin' && (
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          {user.role === 'estudiante' && (
                            <IconButton
                              onClick={() => handleEditClick(user)}
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                  color: 'info.main',
                                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(14,165,233,0.1)' : '#f0f9ff',
                                  borderColor: 'info.main',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {user.activo === false ? (
                            <Tooltip title="Reactivar Usuario">
                              <IconButton
                                onClick={() => handleReactivateUser(user.id)}
                                size="small"
                                sx={{
                                  color: 'success.main',
                                  borderRadius: 2,
                                  border: (theme) => `1px solid ${theme.palette.success.main}33`,
                                  '&:hover': {
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                                  },
                                }}
                              >
                                <VerifiedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <IconButton
                              onClick={() => setConfirmDialog({ open: true, userId: user.id, userName: user.name })}
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                  color: 'error.main',
                                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                  borderColor: 'error.main',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Container>
        </Box>

        {/* Edit Career Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 400 } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Editar Carrera del Estudiante</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="career-select-label">Seleccionar Nueva Carrera</InputLabel>
                <Select
                  labelId="career-select-label"
                  value={selectedCarrera}
                  label="Seleccionar Nueva Carrera"
                  onChange={(e) => setSelectedCarrera(e.target.value)}
                >
                  {carreras.map((carrera) => (
                    <MenuItem key={carrera.id_carrera} value={carrera.id_carrera}>
                      {carrera.nombre_carrera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <ButtonMui
              onClick={() => setOpenEditDialog(false)}
              name="Cancelar"
              type="button"
              fullWidth={false}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'transparent', color: 'text.secondary', boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}
            />
            <ButtonMui
              onClick={handleSaveEdit}
              name="Guardar Cambios"
              type="button"
              fullWidth={false}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#870a42', '&:hover': { bgcolor: '#6d0835' } }}
            />
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, userId: null, userName: '' })}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 380 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Desactivar usuario</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ¿Estás seguro de que quieres desactivar a <strong>{confirmDialog.userName}</strong>? El usuario no podrá iniciar sesión, pero sus datos se conservarán.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <ButtonMui
              onClick={() => setConfirmDialog({ open: false, userId: null, userName: '' })}
              name="Cancelar"
              type="button"
              fullWidth={false}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'transparent', color: 'text.secondary', boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}
            />
            <ButtonMui
              onClick={() => handleDeleteUser(confirmDialog.userId)}
              name="Desactivar"
              type="button"
              fullWidth={false}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
            />
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};