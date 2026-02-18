import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Avatar as MuiAvatar, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Autocomplete, Tabs, Tab, Box as MuiBox } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export const Profile = () => {
  const { id } = useParams(); // ID for public profile
  const { user, setUser: setContextUser } = useApp();
  const [profileData, setProfileData] = React.useState(null);
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [tabValue, setTabValue] = React.useState(0);
  const [userServices, setUserServices] = React.useState([]);
  const [loadingServices, setLoadingServices] = React.useState(false);

  const getRoleBadge = (role) => {
    const badges = {
      cliente: { text: 'CLIENTE', color: '#0ea5e9' },
      estudiante: { text: 'ESTUDIANTE', color: '#10b981' },
      admin: { text: 'ADMINISTRADOR', color: '#870a42' },
    };
    const r = role?.toLowerCase() || 'cliente';
    return badges[r] || badges.cliente;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        </Container>
      )}
    </div>
  );

  // --- Fetch Fresh Data on Mount ---
  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        // Decide which endpoint to hit
        const fetchId = id || user?.id_usuario;
        if (!fetchId) return;

        const isMe = !id || parseInt(id) === user?.id_usuario;
        setIsOwnProfile(isMe);

        const url = isMe ? '/api/usuarios/me' : `/api/usuarios/${id}`;
        const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};

        const response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          console.log('Datos del usuario:', data);
          console.log('Datos de carrera:', data.carrera);
          console.log('Datos de habilidades RAW:', data.habilidades);
          const formattedData = {
            id: data.id_usuario,
            name: data.nombre,
            lastname: data.apellido,
            email: data.email,
            role: data.rol?.toLowerCase(),
            image: data.foto_perfil,
            bio: data.bio,
            banner: data.banner,
            phone: data.telefono,
            university: data.university,
            career: data.carrera?.nombre_carrera || data.career,
            carrera: data.carrera, // Guardar el objeto completo de carrera
            skills: data.habilidades?.map(h => h.habilidad) || []
          };
          console.log('Skills formateadas:', formattedData.skills);
          setProfileData(formattedData);

          // If it's my own profile, also update the context to keep it in sync
          if (isMe) {
            setContextUser(prev => ({
              ...prev,
              ...formattedData
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [id, user?.id_usuario]);

  // --- Fetch User Services (same logic as MyServices) ---
  const fetchUserServices = React.useCallback(async () => {
    setLoadingServices(true);
    try {
      console.log('Fetching all services...');
      // Use the same endpoint as MyServices
      const response = await fetch('/api/servicios');
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('All services fetched:', data);

        // Filter services for current user and map them like MyServices does
        const fetchId = id || user?.id_usuario;
        const mappedServices = data
          .filter(s => s.id_usuario == fetchId) // Filter for current user
          .map(s => ({
            id_servicio: s.id_servicio,
            titulo_servicio: s.titulo,
            descripcion_servicio: s.descripcion,
            precio_servicio: s.precio,
            imagen_servicio: s.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000',
            estado_servicio: s.estado || 'activo',
            categoria: s.categoria?.nombre_categoria || 'Sin categoría',
            usuario: s.usuario,
            calificacion_promedio: s.calificacion_promedio ?? null,
            reviews: s._count?.resenas ?? 0
          }));

        console.log('User services mapped:', mappedServices);
        setUserServices(mappedServices);
      } else {
        console.error('Failed to fetch services, status:', response.status);
        setUserServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch user services:', error);
      setUserServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [id, user?.id_usuario]);

  // Fetch services when profile data is loaded and user is estudiante
  React.useEffect(() => {
    console.log('Profile data loaded:', profileData);
    if (profileData && profileData.role === 'estudiante') {
      console.log('User is estudiante, fetching services...');
      fetchUserServices();
    }
  }, [profileData, fetchUserServices]);

  // --- Edit Profile Logic ---
  const [openEdit, setOpenEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    nombre: '',
    apellido: '',
    bio: '',
    telefono: '',
    university: '',
    career: '',
    skills: '',
    foto_perfil: '',
    banner: ''
  });

  // Careers list from database
  const [carreras, setCarreras] = React.useState([]);

  // Skills management
  const [userSkills, setUserSkills] = React.useState([]);
  const [availableSkills, setAvailableSkills] = React.useState([]);
  const [selectedSkills, setSelectedSkills] = React.useState([]);

  // Fetch carreras on mount
  React.useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await fetch('/api/carreras');
        if (response.ok) {
          const data = await response.json();
          setCarreras(data);
        }
      } catch (error) {
        console.error('Error fetching carreras:', error);
      }
    };
    fetchCarreras();
  }, []);

  // Fetch user skills and available skills
  React.useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Fetch all available skills
        const skillsResponse = await fetch('/api/habilidades');
        if (skillsResponse.ok) {
          const skills = await skillsResponse.json();
          setAvailableSkills(skills);
        }

        // Fetch profile's skills
        const fetchId = id || user?.id_usuario;
        if (fetchId) {
          const response = await fetch(`/api/usuarios/${fetchId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('fetchSkills - data.habilidades RAW:', data.habilidades);
            // data.habilidades is an array of { id_usuario, id_habilidad, habilidad: {...} }
            // We need to extract just the habilidad object
            const skills = data.habilidades?.map(uh => uh.habilidad || uh) || [];
            console.log('fetchSkills - skills extracted:', skills);
            setUserSkills(skills);
          }
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, [id, user?.id_usuario]);

  // Initialize form when opening modal
  const handleEditClick = () => {
    // Use profileData for more reliable current state (since we are editing the displayed profile)
    const sourceData = profileData || user;

    // Find career object
    const currentCarrera = carreras.find(c => c.nombre_carrera === (sourceData.career || sourceData.carrera?.nombre_carrera));

    setFormData({
      nombre: sourceData.name || '',
      apellido: sourceData.lastname || '',
      bio: sourceData.bio || '',
      telefono: sourceData.phone || '',
      university: sourceData.university || 'Universidad Internacional del Ecuador',
      career: sourceData.career || '',
      id_carrera: currentCarrera ? currentCarrera.id_carrera : '',
      foto_perfil: sourceData.image || '',
      banner: sourceData.banner || ''
    });

    // Initialize selected skills
    const skillsInit = sourceData.skills || [];
    setSelectedSkills(skillsInit);
    setOpenEdit(true);
  };

  const handleClose = () => {
    setOpenEdit(false);
  };

  const handleChange = (e) => {
    if (e.target.name === 'career') {
      const selectedCarrera = carreras.find(c => c.nombre_carrera === e.target.value);
      setFormData({
        ...formData,
        career: e.target.value,
        id_carrera: selectedCarrera ? selectedCarrera.id_carrera : null
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Image Upload Handler (Generic for Avatar and Banner)
  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
      } else {
        console.error('Upload failed:', data.message);
        alert('Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = user.token;
      if (!token) return;

      const bodyToSend = {
        ...formData,
        id_carrera: formData.id_carrera || null, // Ensure empty string becomes null
        habilidades: selectedSkills.map(s => s.id_habilidad)
      };
      delete bodyToSend.bio; // Remove bio as it's not in the database schema

      console.log('=== SAVING PROFILE ===');
      console.log('selectedSkills:', selectedSkills);
      console.log('Body to send:', bodyToSend);

      const response = await fetch('/api/usuarios/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyToSend)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('=== RESPONSE FROM SERVER ===');
        console.log('updatedUser:', updatedUser);
        console.log('updatedUser.habilidades:', updatedUser.habilidades);

        const formatted = {
          name: updatedUser.nombre,
          lastname: updatedUser.apellido,
          image: updatedUser.foto_perfil,
          banner: updatedUser.banner,
          bio: updatedUser.bio,
          phone: updatedUser.telefono,
          university: updatedUser.university,
          career: updatedUser.career || updatedUser.carrera?.nombre_carrera,
          skills: updatedUser.habilidades?.map(h => h.habilidad) || []
        };

        setProfileData(prev => ({ ...prev, ...formatted }));
        setContextUser(prev => ({ ...prev, ...formatted }));

        // Sync skills explicitly to update UI immediately using local selection
        // This ensures the render loop (which expects full objects) works even if the backend returns just IDs/relations
        setUserSkills(selectedSkills);

        setOpenEdit(false);
      } else {
        console.error('Save failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h6">Cargando perfil...</Typography>
    </Box>
  );

  if (!profileData) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h6">Usuario no encontrado</Typography>
    </Box>
  );

  const roleInfo = getRoleBadge(profileData.role);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
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
          sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}
        >
          {/* Banner con Avatar Superpuesto */}
          <Box
            sx={{
              height: { xs: 150, sm: 200 },
              position: 'relative',
              bgcolor: '#870a42',
              backgroundImage: profileData.banner ? `url(${profileData.banner})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
              mb: 2
            }}
          >
            {/* Avatar Container */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: -20, md: -40 },
                left: { xs: '50%', md: 60 },
                transform: { xs: 'translateX(-50%)', md: 'none' },
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 10
              }}
            >
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                <MuiAvatar
                  src={profileData.image}
                  alt={profileData.name}
                  sx={{
                    width: { xs: 100, md: 136 },
                    height: { xs: 100, md: 136 },
                    bgcolor: '#870a42',
                    color: 'white',
                    fontSize: { xs: '3.5rem', md: '4.5rem' },
                    fontWeight: 900,
                    border: (theme) => `4px solid ${theme.palette.background.paper}`
                  }}
                >
                  {profileData.name?.charAt(0)}
                </MuiAvatar>
              </Box>

              {/* Add ArrowBackIcon import since it's used now */}
              <Box sx={{ display: 'none' }}>
                <ArrowBackIcon />
              </Box>
            </Box>
          </Box>

          {/* User Info Section */}
          <Container maxWidth="xl" sx={{ pb: 4, px: { xs: 2, sm: 3 } }}>
            <Box sx={{
              mt: { xs: 2, md: 0 },
              mb: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-end' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, md: 2 }
            }}>
              {/* Spacer for Avatar */}
              <Box sx={{ width: { xs: 0, md: 200 }, display: { xs: 'none', md: 'block' } }} />

              {/* Text Info */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant={{ xs: 'h5', sm: 'h4' }} sx={{ fontWeight: 800, color: 'text.primary', mb: { xs: 1, md: 0.5 }, letterSpacing: '-0.02em' }}>
                  {profileData.name} {profileData.lastname}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                  <Chip
                    label={roleInfo.text}
                    size="small"
                    sx={{
                      bgcolor: roleInfo.color + '15',
                      color: roleInfo.color,
                      fontWeight: 700,
                      borderRadius: 1.5,
                      border: `1px solid ${roleInfo.color}30`
                    }}
                  />
                  {profileData.university && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      {profileData.university}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Actions */}
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#870a42',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#870a42',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(135,10,66,0.05)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 1px 2px rgba(0,0,0,0.3)'
                      : '0 1px 2px rgba(135,10,66,0.15)',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(135,10,66,0.1)',
                      borderColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.5)'
                        : '#870a42',
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#870a42',
                      transform: 'translateY(-1px)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(0,0,0,0.4)'
                        : '0 4px 12px rgba(135,10,66,0.25)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 1px 2px rgba(0,0,0,0.3)'
                        : '0 1px 2px rgba(135,10,66,0.15)'
                    }
                  }}
                >
                  Editar Perfil
                </Button>
              )}
            </Box>

            {/* Layout Principal: Flexbox Manual para mayor control */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>

              {/* Columna izquierda: Sobre Mí y Habilidades (2/3 del espacio) */}
              <Box sx={{ flex: { md: 2 }, minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>

                  {/* Sección Sobre Mí */}
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      height: { xs: 'auto', md: 220 },
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: '#870a42',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        mb: 1.5,
                        display: 'block'
                      }}
                    >
                      SOBRE MÍ
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        flex: 1,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(148,163,184,0.35)', borderRadius: '3px' },
                      }}
                    >
                      {profileData.bio || (
                        isOwnProfile ? '¡Cuéntanos sobre ti! Edita tu perfil para agregar una biografía.' : 'Este usuario aún no ha agregado una biografía.'
                      )}
                    </Typography>
                  </Paper>

                  {/* Sección Carrera */}


                  {/* Sección Habilidades */}
                  {profileData.role !== 'cliente' && (
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 15px rgba(0,0,0,0.05)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: '#870a42',
                          fontWeight: 900,
                          fontSize: '0.85rem',
                          letterSpacing: '0.25em',
                          mb: 2,
                          display: 'block'
                        }}
                      >
                        HABILIDADES
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {userSkills.length > 0 ? (
                          userSkills.map((userSkill) => (
                            <Chip
                              key={userSkill.id_habilidad || userSkill.habilidad?.id_habilidad}
                              label={userSkill.habilidad?.nombre_habilidad || userSkill.nombre_habilidad}
                              sx={{
                                background: (theme) => theme.palette.mode === 'dark' ? 'rgba(135, 10, 66, 0.15)' : 'white',
                                color: '#870a42',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                px: 2.5,
                                py: 2.5,
                                borderRadius: 2.5,
                                border: '2px solid #870a42',
                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                  ? '0 2px 8px rgba(135, 10, 66, 0.3)'
                                  : '0 2px 8px rgba(135, 10, 66, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 16px rgba(135, 10, 66, 0.5)'
                                    : '0 4px 16px rgba(135, 10, 66, 0.2)',
                                  background: '#870a42',
                                  color: 'white',
                                },
                                '& .MuiChip-label': {
                                  padding: '0 8px'
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body1" sx={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '1.1rem' }}>
                            No se han registrado habilidades.
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  )}

                  {/* Sección Servicios Publicados - Solo para estudiantes */}
                  {profileData.role === 'estudiante' && (
                    <Paper sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                      border: (theme) => `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: '#870a42',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          letterSpacing: '0.25em',
                          mb: 2,
                          display: 'block'
                        }}
                      >
                        SERVICIOS PUBLICADOS
                      </Typography>

                      {loadingServices ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Cargando servicios...
                          </Typography>
                        </Box>
                      ) : userServices.length > 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                          {userServices.map((service) => (
                            <Paper
                              key={service.id_servicio}
                              elevation={3}
                              sx={{
                                overflow: 'hidden',
                                borderRadius: 3,
                                bgcolor: (theme) => theme.palette.background.paper,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 20px 40px rgba(0,0,0,0.3)'
                                    : '0 20px 40px rgba(0,0,0,0.1)',
                                  borderColor: '#870a42',
                                  '& .service-image': {
                                    transform: 'scale(1.05)'
                                  }
                                }
                              }}
                              onClick={() => window.location.href = `/service/${service.id_servicio}`}
                            >
                              {/* Imagen del servicio */}
                              <Box
                                className="service-image"
                                component="img"
                                src={service.imagen_servicio}
                                alt={service.titulo_servicio}
                                sx={{
                                  width: '100%',
                                  height: 180,
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                              />

                              {/* Contenido del servicio */}
                              <Box sx={{ p: 2.5 }}>
                                {/* Header con avatar y nombre */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                  <MuiAvatar
                                    src={service.usuario?.image || profileData?.image}
                                    alt={service.usuario?.name || profileData?.name}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: '#870a42',
                                      color: 'white',
                                      fontWeight: 700,
                                      fontSize: '1rem',
                                      border: (theme) => `2px solid ${theme.palette.background.paper}`
                                    }}
                                  >
                                    {(service.usuario?.name || profileData?.name || 'U')?.charAt(0)}
                                  </MuiAvatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{
                                      fontWeight: 600,
                                      color: 'text.primary',
                                      fontSize: '0.9rem',
                                      lineHeight: 1.2
                                    }}>
                                      {service.usuario?.name || profileData?.name || 'Estudiante UIDE'}
                                    </Typography>
                                    <Typography variant="caption" sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.75rem'
                                    }}>
                                      {service.usuario?.email || profileData?.email || 'Estudiante'}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Título y descripción */}
                                <Typography variant="h6" sx={{
                                  fontWeight: 700,
                                  mb: 1,
                                  color: 'text.primary',
                                  fontSize: '1.1rem',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {service.titulo_servicio}
                                </Typography>

                                <Typography variant="body2" sx={{
                                  color: 'text.secondary',
                                  mb: 2,
                                  fontSize: '0.85rem',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {service.descripcion_servicio}
                                </Typography>

                                {/* Footer con precio, estado y categoría */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  {/* Categoría */}
                                  {service.categoria && (
                                    <Chip
                                      label={service.categoria}
                                      size="small"
                                      sx={{
                                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(135, 10, 66, 0.25)' : 'rgba(135, 10, 66, 0.1)'),
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        fontSize: '0.625rem',
                                        alignSelf: 'flex-start',
                                        height: 24
                                      }}
                                    />
                                  )}

                                  {/* Precio y estado */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h5" sx={{
                                      color: 'primary.main',
                                      fontWeight: 900,
                                      fontSize: '1.2rem'
                                    }}>
                                      ${parseFloat(service.precio_servicio).toFixed(2)}
                                    </Typography>
                                    <Chip
                                      label={service.estado_servicio === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                                      size="small"
                                      sx={{
                                        bgcolor: service.estado_servicio === 'activo' ? '#10b98120' : '#ef444420',
                                        color: service.estado_servicio === 'activo' ? '#10b981' : '#ef4444',
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        height: 22
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{
                          color: '#9ca3af',
                          fontStyle: 'italic',
                          fontSize: '1.1rem',
                          textAlign: 'center',
                          py: 2
                        }}>
                          {isOwnProfile
                            ? 'Aún no has publicado ningún servicio. ¡Crea tu primer servicio!'
                            : 'Este estudiante aún no ha publicado servicios.'
                          }
                        </Typography>
                      )}
                    </Paper>
                  )}
                </Box>
              </Box>

              {/* Columna derecha: Contacto (1/3 del espacio) */}
              <Box sx={{ flex: { md: 1 }, minWidth: 0 }}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* Sección Carrera (Movida aquí) */}
                  {profileData.role !== 'cliente' && profileData.carrera && (
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 15px rgba(0,0,0,0.05)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: '#870a42',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          letterSpacing: '0.25em',
                          mb: 1.5,
                          display: 'block'
                        }}
                      >
                        CARRERA
                      </Typography>
                      <Box
                        component={Link}
                        to={`/carrera/${profileData.carrera.id_carrera}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2.5,
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateX(5px)' }
                        }}
                      >
                        <Box
                          component="img"
                          src={profileData.carrera.imagen_carrera || '/placeholder-carrera.jpg'}
                          alt={profileData.carrera.nombre_carrera}
                          onError={(e) => { e.target.src = '/placeholder-carrera.jpg'; }}
                          sx={{
                            width: 60, height: 60, borderRadius: 2, objectFit: 'cover',
                            border: '2px solid #870a42', boxShadow: '0 2px 8px rgba(135, 10, 66, 0.2)', flexShrink: 0
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#870a42', mb: 0.5, fontSize: '1rem', lineHeight: 1.2 }}>
                            {profileData.carrera.nombre_carrera}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Ver detalles <ArrowBackIcon sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )}

                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 15px rgba(0,0,0,0.05)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="overline" sx={{ color: '#870a42', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.25em', mb: 2.5, display: 'block' }}>
                      CONTACTO
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { icon: <MailIcon />, label: 'Email', value: profileData.email },
                        { icon: <PhoneIcon />, label: 'Teléfono', value: profileData.phone || 'No registrado' },
                        ...(profileData.role !== 'cliente' ? [{ icon: <LocationOnIcon />, label: 'Institución', value: profileData.university || 'UIDE' }] : []),
                      ].map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(135,10,66,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {React.cloneElement(item.icon, { sx: { fontSize: '1.2rem', color: '#870a42' } })}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{item.label}</Typography>
                            <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Edit Modal (Only for owner) */}
      {
        isOwnProfile && (
          <Dialog
            open={openEdit}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#111827', pb: 1 }}>
              Editar Perfil
            </DialogTitle>
            <DialogContent>
              {/* Contenido del modal de edición (Ya existente en la versión anterior) */}
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                <Box sx={{ position: 'relative', width: '100%', mb: 5 }}>
                  <Box
                    sx={{
                      height: 120,
                      width: '100%',
                      borderRadius: 3,
                      bgcolor: '#f3f4f6',
                      backgroundImage: `url(${formData.banner})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #d1d5db',
                      overflow: 'hidden'
                    }}
                  >
                    <Button component="label" sx={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontWeight: 600 }}>
                      <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                        Cambiar Banner
                      </span>
                      <input hidden accept="image/*" type="file" onChange={(e) => handleImageUpload(e, 'banner')} />
                    </Button>
                  </Box>

                  <Box sx={{ position: 'absolute', bottom: -40, left: 20 }}>
                    <Box sx={{ position: 'relative' }}>
                      <MuiAvatar src={formData.foto_perfil} sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <IconButton component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', boxShadow: 2, p: 0.5, '&:hover': { bgcolor: '#f9fafb' } }}>
                        <EditIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                        <input hidden accept="image/*" type="file" onChange={(e) => handleImageUpload(e, 'foto_perfil')} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} />
                  <TextField fullWidth label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} />
                </Box>
                {/* <TextField fullWidth multiline rows={3} label="Biografía" name="bio" value={formData.bio} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} /> */}
                <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} />
                {user.role === 'estudiante' && (
                  <FormControl fullWidth>
                    <InputLabel>Carrera</InputLabel>
                    <Select
                      label="Carrera"
                      name="career"
                      value={formData.career}
                      onChange={handleChange}
                      sx={{ borderRadius: 3 }}
                      disabled={!!(profileData?.career || profileData?.carrera)}
                    >
                      <MenuItem value=""><em>Selecciona</em></MenuItem>
                      {carreras.map(c => <MenuItem key={c.id_carrera} value={c.nombre_carrera}>{c.nombre_carrera}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {user.role === 'estudiante' && (
                  <Autocomplete
                    multiple
                    options={availableSkills}
                    getOptionLabel={(option) => option.nombre_habilidad}
                    value={selectedSkills}
                    onChange={(event, newValue) => setSelectedSkills(newValue)}
                    isOptionEqualToValue={(option, value) => option.id_habilidad === value.id_habilidad}
                    disableCloseOnSelect
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Habilidades"
                        variant="outlined"
                        placeholder="Buscar habilidades..."
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: 3 }
                        }}
                      />
                    )}
                    sx={{
                      width: '100%',
                      '& .MuiAutocomplete-tag': {
                        bgcolor: 'rgba(135,10,66,0.1)',
                        color: '#870a42',
                        fontWeight: 600,
                        borderRadius: 2,
                      },
                    }}
                    ListboxProps={{
                      style: { maxHeight: 200 }
                    }}
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#870a42', color: 'white' }}>{loading ? 'Guardando...' : 'Guardar'}</Button>
            </DialogActions>
          </Dialog>
        )
      }
    </Box >

  );
};


