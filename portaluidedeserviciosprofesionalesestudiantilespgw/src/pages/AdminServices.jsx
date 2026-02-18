import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ButtonMui from '../components/ButtonMui.jsx';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({ open: false, serviceId: null, serviceTitle: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/servicios');
      if (response.ok) {
        const data = await response.json();
        const formattedServices = data.map(service => ({
          id: service.id_servicio,
          title: service.titulo,
          category: service.categoria?.nombre_categoria || 'General',
          image: service.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80',
          providerName: `${service.usuario?.nombre} ${service.usuario?.apellido}`,
          providerImage: service.usuario?.foto_perfil,
          price: service.precio,
          rating: service.calificacion_promedio ?? null,
          reviews: service._count?.resenas ?? 0
        }));
        setServices(formattedServices);
      } else {
        toast.error('Error al cargar servicios');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error de conexión');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      if (!token) {
        toast.error('No se encontró el token de autenticación');
        return;
      }

      const response = await fetch(`/api/servicios/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setServices(services.filter((s) => s.id !== serviceId));
        toast.success('Servicio eliminado correctamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || 'Error al eliminar el servicio');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error de conexión');
    } finally {
      setConfirmDialog({ open: false, serviceId: null, serviceTitle: '' });
    }
  };

  const totalReviews = services.reduce((sum, s) => sum + s.reviews, 0);

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
          <Container maxWidth="xl">
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1 }}>
                Gestión de Servicios
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '1.125rem' }}>
                Administra y supervisa todos los servicios publicados en la plataforma
              </Typography>
            </Box>


            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
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
                    Total Servicios
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {services.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: '4px solid #60a5fa',
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
                    Total Reseñas
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    {totalReviews}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>


            <Grid container spacing={2}>
              {services.map((service) => (
                <Grid item xs={12} md={6} key={service.id}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '& .service-title': {
                          color: (theme) => theme.palette.mode === 'dark' ? '#870a42' : '#870a42',
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Box
                          component="img"
                          src={service.image}
                          alt={service.title}
                          sx={{
                            width: 112,
                            height: 112,
                            borderRadius: 3,
                            objectFit: 'cover',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            px: 1,
                            py: 0.5,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: 2,
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            color: 'text.primary',
                            textTransform: 'uppercase',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          {service.category}
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 0.5, minWidth: 0 }}>
                        <Box>
                          <Typography
                            className="service-title"
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              color: 'text.primary',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'color 0.2s',
                            }}
                          >
                            {service.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Por: <Box component="span" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151' }}>{service.providerName}</Box>
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#870a42' }}>
                              ${service.price}
                              <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#9ca3af' }}>
                              </Typography>
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f9fafb',
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
                              }}
                            >
                              <StarIcon sx={{ fontSize: '0.875rem', color: (service.reviews > 0) ? '#fbbf24' : '#e5e7eb' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                {(service.reviews > 0) ? Number(service.rating).toFixed(1) : 'Nuevo'}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => setConfirmDialog({ open: true, serviceId: service.id, serviceTitle: service.title })}
                            sx={{
                              color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#9ca3af',
                              borderRadius: 3,
                              border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.3)' : '1px solid #f3f4f6',
                              '&:hover': {
                                color: '#ef4444',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                                borderColor: '#fecaca',
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, serviceId: null, serviceTitle: '' })}
        PaperProps={{ sx: { borderRadius: 4, minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Eliminar servicio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ¿Estás seguro de que quieres eliminar el servicio <strong>{confirmDialog.serviceTitle}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <ButtonMui
            onClick={() => setConfirmDialog({ open: false, serviceId: null, serviceTitle: '' })}
            name="Cancelar"
            type="button"
            fullWidth={false}
            sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'transparent', color: 'text.secondary', boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}
          />
          <ButtonMui
            onClick={() => handleDeleteService(confirmDialog.serviceId)}
            name="Eliminar"
            type="button"
            fullWidth={false}
            sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};