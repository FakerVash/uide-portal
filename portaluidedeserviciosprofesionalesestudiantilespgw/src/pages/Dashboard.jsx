import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Chip, Card, CardContent, CardMedia, CardActions, Button, TextField, InputAdornment } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import StarIcon from '@mui/icons-material/Star';

import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';

const ServiceCard = ({ service, navigate }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 4,
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
        borderColor: 'rgba(34, 211, 238, 0.6)',
      },
    }}
  >
    <CardMedia
      component="img"
      sx={{
        height: 180,
        width: '100%',
        objectFit: 'cover'
      }}
      image={service.image}
      alt={service.title}
    />

    <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 1.5 }}>
        <Chip
          label={service.category}
          size="small"
          sx={{
            bgcolor: 'rgba(135, 10, 66, 0.1)',
            color: '#870a42',
            fontWeight: 700,
            fontSize: '0.6rem',
            height: '20px',
            borderRadius: '4px'
          }}
        />
      </Box>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: '#111827',
          mb: 1,
          lineHeight: 1.3,
          height: '2.6rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontSize: '1rem'
        }}
      >
        {service.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#6b7280',
          mb: 2,
          lineHeight: 1.5,
          fontSize: '0.8125rem',
          height: '3.6rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {service.description}
      </Typography>

      <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>Por {service.providerName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: '0.9rem', color: '#fbbf24' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.8rem' }}>
              {service.rating != null ? service.rating.toFixed(1) : '—'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>({service.reviews})</Typography>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#870a42', fontSize: '1.1rem' }}>
          ${service.price}
        </Typography>
      </Box>
    </CardContent>

    <CardActions sx={{ p: 1.5, pt: 0 }}>
      <Button
        fullWidth
        variant="contained"
        onClick={() => navigate(`/service/${service.id}`)}
        sx={{
          bgcolor: '#111827',
          color: 'white',
          '&:hover': { bgcolor: '#374151' },
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          py: 1
        }}
      >
        Ver Detalles
      </Button>
    </CardActions>
  </Card>
);

export const Dashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

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
            category: (typeof s.categoria === 'string' ? s.categoria : s.categoria?.nombre_categoria) || 'Sin categoría',
            providerName: s.usuario ? `${s.usuario.nombre} ${s.usuario.apellido}` : 'Usuario',
            rating: s.calificacion_promedio ?? null,
            reviews: s._count?.resenas ?? 0
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


  // Dashboard General (para todos menos Admin)
  const renderGeneralDashboard = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937', mb: 0.5, letterSpacing: '-0.025em' }}>
          Servicios Disponibles
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
          Explora los servicios profesionales de nuestra comunidad estudiantil
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
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

      {/* Categorías */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
            sx={{
              bgcolor: selectedCategory === category ? '#870a42' : 'transparent',
              color: selectedCategory === category ? 'white' : '#4b5563',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: '1px solid',
              borderColor: selectedCategory === category ? '#870a42' : '#e5e7eb',
              borderRadius: '8px',
              px: 1,
              '&:hover': {
                bgcolor: selectedCategory === category ? '#6b0835' : '#f9fafb',
                borderColor: selectedCategory === category ? '#6b0835' : '#d1d5db',
              },
            }}
          />
        ))}
      </Box>

      {/* Grid de Servicios */}
      {filteredServices.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              navigate={navigate}
            />
          ))}
        </Box>
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
            No se encontraron servicios que coincidan con tu búsqueda
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Dashboard para Admin
  const renderAdminDashboard = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827', mb: 0.5 }}>
          Panel de Administración
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1rem' }}>
          Gestiona usuarios y servicios de la plataforma
        </Typography>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
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
              p: 3,
              borderRadius: 4,
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
              p: 3,
              borderRadius: 4,
              border: '1px solid #f3f4f6',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'border 0.2s',
              '&:hover': {
                borderColor: '#870a42',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Categorías
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#870a42', mt: 1 }}>
              {categories.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>


      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#374151' }}>
          Todos los Servicios
        </Typography>
        <Box sx={{ flex: 1, height: 4, bgcolor: '#f3f4f6', borderRadius: 2 }} />
      </Box>


      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            navigate={navigate}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f9fafb',
      }}
    >
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
            backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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