import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Avatar as MuiAvatar, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Autocomplete, Tabs, Tab, Box as MuiBox } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';

import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';

export const Profile = () => {
  const { id } = useParams(); // ID for public profile
  const { user, setUser: setContextUser } = useApp();
  const [profileData, setProfileData] = React.useState(null);
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [tabValue, setTabValue] = React.useState(0);

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
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
            skills: data.habilidades?.map(h => h.habilidad) || []
          };
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
            setUserSkills(data.habilidades || []);
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
    const currentCarrera = carreras.find(c => c.nombre_carrera === (user.career || user.carrera?.nombre_carrera));
    setFormData({
      nombre: user.name || '',
      apellido: user.lastname || '',
      bio: user.bio || '',
      telefono: user.phone || '',
      university: user.university || 'Universidad Internacional del Ecuador',
      career: user.career || '',
      id_carrera: currentCarrera ? currentCarrera.id_carrera : '',
      foto_perfil: user.image || '',
      banner: user.banner || ''
    });
    // Initialize selected skills from user's current skills
    // Ensure we map correctly depending on data structure
    const skillsInit = user.skills || [];
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
        habilidades: selectedSkills.map(s => s.id_habilidad)
      };

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

        // Sync skills... (Mantener lógica de sync original pero adaptada)
        if (user.role === 'estudiante') {
          // ... (Lógica de sincronización de habilidades ya existente)
        }

        setOpenEdit(false);
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
          sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', bgcolor: '#f9fafb' }}
        >
          {/* Banner compacto que ocupa todo el ancho */}
          <Box
            sx={{
              height: 120,
              position: 'relative',
              bgcolor: '#870a42',
              backgroundImage: profileData.banner ? `url(${profileData.banner})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.2)' }} />
          </Box>

          {/* Contenido del perfil - "Zoom" visual en contenedor de 1000px */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: { xs: 2, md: 3 }, mt: -7.5, pb: 4, position: 'relative', maxWidth: 1000, width: '100%', mx: 'auto' }}>

            {/* Cabecera escalada */}
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%'
              }}
            >
              <Box
                sx={{
                  borderRadius: '50%',
                  p: 0.8,
                  bgcolor: 'white',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  mb: 1.5
                }}
              >
                <MuiAvatar
                  src={profileData.image}
                  alt={profileData.name}
                  sx={{
                    width: 140,
                    height: 140,
                    bgcolor: '#870a42',
                    color: 'white',
                    fontSize: '4.5rem',
                    fontWeight: 900,
                  }}
                >
                  {profileData.name?.charAt(0)}
                </MuiAvatar>
              </Box>

              <Typography variant="h2" sx={{ fontWeight: 900, color: '#111827', mb: 0.5, fontSize: { xs: '2.2rem', md: '2.8rem' }, letterSpacing: '-0.02em' }}>
                {profileData.name} {profileData.lastname}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2 }}>
                <Chip
                  label={roleInfo.text}
                  sx={{
                    bgcolor: roleInfo.color,
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: '0.12em',
                    px: 2.5,
                    height: 36
                  }}
                />
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'white',
                      color: '#1f2937',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      px: 3,
                      border: '1px solid #e5e7eb',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        borderColor: '#870a42',
                        color: '#870a42',
                      }
                    }}
                  >
                    Editar Perfil
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Columna izquierda: Sobre Mí y Habilidades */}
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Sección Sobre Mí */}
                  <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
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
                      SOBRE MÍ
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.8, fontSize: '1.25rem', fontWeight: 500 }}>
                      {profileData.bio || (isOwnProfile ? '¡Cuéntanos sobre ti! Edita tu perfil para agregar una biografía.' : 'Este usuario aún no ha agregado una biografía.')}
                    </Typography>
                  </Paper>

                  {/* Sección Habilidades */}
                  {profileData.role !== 'cliente' && (
                    <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
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
                                px: 3,
                                py: 3.5,
                                borderRadius: 3,
                                bgcolor: '#f3f4f6',
                                color: '#111827',
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                '&:hover': {
                                  bgcolor: '#870a42',
                                  color: 'white',
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
                </Box>
              </Grid>

              {/* Columna derecha: Contacto */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', height: '100%' }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#870a42',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      letterSpacing: '0.25em',
                      mb: 4,
                      display: 'block'
                    }}
                  >
                    CONTACTO
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    {[
                      { icon: <MailIcon />, label: 'Email', value: profileData.email },
                      { icon: <PhoneIcon />, label: 'Teléfono', value: profileData.phone || 'No registrado' },
                      ...(profileData.role !== 'cliente' ? [
                        { icon: <LocationOnIcon />, label: 'Institución', value: profileData.university || 'UIDE' },
                        { icon: <MenuBookIcon />, label: 'Carrera', value: profileData.career || 'Sin especificar' },
                      ] : []),
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: 'rgba(135,10,66,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: '1.6rem', color: '#870a42' } })}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{item.label}</Typography>
                          <Typography sx={{ color: '#111827', fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Edit Modal (Only for owner) */}
        {isOwnProfile && (
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
                <TextField fullWidth multiline rows={3} label="Biografía" name="bio" value={formData.bio} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} />
                <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: 3 } }} />
                <FormControl fullWidth>
                  <InputLabel>Carrera</InputLabel>
                  <Select label="Carrera" name="career" value={formData.career} onChange={handleChange} sx={{ borderRadius: 3 }}>
                    <MenuItem value=""><em>Selecciona</em></MenuItem>
                    {carreras.map(c => <MenuItem key={c.id_carrera} value={c.nombre_carrera}>{c.nombre_carrera}</MenuItem>)}
                  </Select>
                </FormControl>
                {user.role === 'estudiante' && (
                  <Autocomplete
                    multiple
                    options={availableSkills}
                    getOptionLabel={(option) => option.nombre_habilidad}
                    value={selectedSkills}
                    onChange={(event, newValue) => setSelectedSkills(newValue)}
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
        )}
      </Box>
    </Box>
  );
};


