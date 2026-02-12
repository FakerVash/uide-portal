import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Chip, Card, CardContent, CardMedia, CardActions, IconButton, Button, TextField, InputAdornment } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';

import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';

export const Dashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Services
        const servicesRes = await fetch('/api/servicios');
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          const mappedServices = data.map(s => ({
            id: s.id_servicio,
            providerId: s.id_usuario,
            title: s.titulo,
            description: s.descripcion,
            price: s.precio,
            image: s.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000',
            category: s.categoria?.nombre_categoria || 'Sin categor├¡a',
            providerName: s.usuario ? `${s.usuario.nombre} ${s.usuario.apellido}` : 'Usuario',
            rating: 5.0, // Pendiente: implementar en backend
            reviews: 0   // Pendiente: implementar en backend
          }));
          setServices(mappedServices);
        }

        // Fetch Categories
        const categoriesRes = await fetch('/api/categorias');
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          const categoryNames = ['Todas', ...data.map(c => c.nombre_categoria)];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Error al cargar datos');
      }
    };

    fetchData();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'Todas' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (serviceId) => {
    if (favorites.includes(serviceId)) {
      setFavorites(favorites.filter((id) => id !== serviceId));
      toast.success('Eliminado de favoritos');
    } else {
      setFavorites([...favorites, serviceId]);
      toast.success('Agregado a favoritos');
    }
  };

  // Dashboard General (para todos menos Admin)
  const renderGeneralDashboard = () => (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
          Servicios Disponibles
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
          Descubre servicios profesionales ofrecidos por estudiantes talentosos
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
              '& fieldset': {
                borderColor: '#e5e7eb',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: '#870a42',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#870a42',
              },
            },
          }}
        />
      </Box>

      {/* Categor├¡as */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap', overflowX: 'auto', pb: 2 }}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
            sx={{
              bgcolor: selectedCategory === category ? '#870a42' : 'white',
              color: selectedCategory === category ? 'white' : '#6b7280',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 3,
              py: 1.5,
              height: 'auto',
              border: '2px solid',
              borderColor: selectedCategory === category ? 'transparent' : '#e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#870a42',
                bgcolor: selectedCategory === category ? '#870a42' : 'rgba(135, 10, 66, 0.05)',
              },
            }}
          />
        ))}
      </Box>

      {/* Grid de Servicios */}
      {filteredServices.length > 0 ? (
        <Grid container spacing={2}>
          {filteredServices.map((service) => (
            <Grid item xs={12} sm={12} md={6} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  maxWidth: '350px',
                  mx: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={service.image}
                  alt={service.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flex: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Chip
                      label={service.category}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(135, 10, 66, 0.1)',
                        color: '#870a42',
                        fontWeight: 700,
                        fontSize: '0.55rem',
                        height: '18px',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(service.id)}
                      sx={{ color: favorites.includes(service.id) ? '#870a42' : '#d1d5db', p: 0.5 }}
                    >
                      {favorites.includes(service.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#111827', mb: 0.5, fontSize: '1rem' }}>
                    {service.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, lineHeight: 1.4, fontSize: '0.75rem' }}>
                    {service.description.substring(0, 80)}...
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: '0.875rem', color: '#fbbf24' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.75rem' }}>
                        {service.rating}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem' }}>
                      ({service.reviews})
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.65rem', mb: 0.5 }}>
                    Por {service.providerName}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#870a42', fontSize: '1.1rem' }}>
                    ${service.price}/hr
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 1.5, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/service/${service.id}`)}
                    sx={{
                      borderColor: '#870a42',
                      color: '#870a42',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.75,
                      '&:hover': {
                        borderColor: '#6b0835',
                        bgcolor: 'rgba(135, 10, 66, 0.04)',
                      },
                    }}
                  >
                    Ver Detalles
                  </Button>

                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            bgcolor: 'white',
            borderRadius: 6,
            border: '2px dashed #e5e7eb',
          }}
        >
          <Typography variant="h6" sx={{ color: '#9ca3af', fontWeight: 500 }}>
            No se encontraron servicios que coincidan con tu b├║squeda
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Dashboard para Admin
  const renderAdminDashboard = () => (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
          Panel de Administraci├│n
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
          Gestiona usuarios y servicios de la plataforma
        </Typography>
      </Box>

      {/* Estad├¡sticas */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 6,
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'border 0.2s',
              '&:hover': {
                borderColor: '#870a42',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Total Usuarios
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#870a42', mt: 1 }}>
              {services.length + 5}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 6,
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'border 0.2s',
              '&:hover': {
                borderColor: '#870a42',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Servicios Activos
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#870a42', mt: 1 }}>
              {services.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 6,
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'border 0.2s',
              '&:hover': {
                borderColor: '#870a42',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Categor├¡as
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#870a42', mt: 1 }}>
              {categories.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>


      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#374151' }}>
          Todos los Servicios
        </Typography>
        <Box sx={{ flex: 1, height: 4, bgcolor: '#f3f4f6', borderRadius: 2 }} />
      </Box>


      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={12} md={6} key={service.id}>
            <Card
              sx={{
                height: '100%',
                maxWidth: '350px',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid #f3f4f6',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={service.image}
                alt={service.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Chip
                  label={service.category}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(135, 10, 66, 0.1)',
                    color: '#870a42',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
                  {service.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  Por {service.providerName}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#870a42' }}>
                  ${service.price}/hr
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
      <Sidebar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', ml: '240px' }}>
        <Header />

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 4,
            bgcolor: 'rgba(249, 250, 251, 0.3)',
            width: '100%',
          }}
        >
          {(!user || user.role === 'cliente' || user.role === 'estudiante') && renderGeneralDashboard()}
          {user && user.role === 'admin' && renderAdminDashboard()}

          {user && !['cliente', 'estudiante', 'admin'].includes(user.role) && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" color="error">Error: Rol de usuario desconocido ({user.role})</Typography>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
