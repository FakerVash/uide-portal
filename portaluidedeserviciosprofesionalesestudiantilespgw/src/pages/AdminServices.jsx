import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, IconButton } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

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
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
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
      }
    }
  };

  const serviciosConRating = services.filter(s => s.rating != null);
  const averageRating = serviciosConRating.length > 0
    ? (serviciosConRating.reduce((sum, s) => sum + s.rating, 0) / serviciosConRating.length).toFixed(1)
    : '0.0';

  const totalReviews = services.reduce((sum, s) => sum + s.reviews, 0);

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
          <Container maxWidth="xl">
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
                Gestión de Servicios
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
                Administra y supervisa todos los servicios publicados en la plataforma
              </Typography>
            </Box>


            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderBottom: '4px solid #870a42',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9ca3af',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Total Servicios
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
                    {services.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderBottom: '4px solid #fbbf24',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9ca3af',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Calificación Promedio
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
                      {averageRating}
                    </Typography>
                    <StarIcon sx={{ fontSize: '1.5rem', color: '#fbbf24' }} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    borderBottom: '4px solid #60a5fa',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9ca3af',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Total Reseñas
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>
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
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '& .service-title': {
                          color: '#870a42',
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
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: 2,
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            color: '#374151',
                            textTransform: 'uppercase',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
                              color: '#111827',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'color 0.2s',
                            }}
                          >
                            {service.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            Por: <Box component="span" sx={{ color: '#374151' }}>{service.providerName}</Box>
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#870a42' }}>
                              ${service.price}
                              <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af' }}>
                              </Typography>
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: '#f9fafb',
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
                              }}
                            >
                              <StarIcon sx={{ fontSize: '0.875rem', color: '#fbbf24' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                                {service.rating != null ? service.rating.toFixed(1) : '—'} ({service.reviews})
                              </Typography>
                            </Box>
                          </Box>

                          <IconButton
                            onClick={() => handleDeleteService(service.id)}
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
    </Box>
  );
};