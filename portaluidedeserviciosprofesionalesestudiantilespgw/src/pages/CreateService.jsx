import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, TextField, MenuItem, Button, Typography, Grid } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context/AppContext';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const CreateService = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    tiempo_entrega: '',
    imagen_portada: null,
    imagenes: []
  });
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const toastId = toast.loading('Subiendo imagen...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();
      setFormData(prev => ({ ...prev, imagen_portada: data.url }));
      toast.success('Imagen subida correctamente', { id: toastId });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen', { id: toastId });
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    const toastId = toast.loading('Subiendo imágenes...');

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`La imagen ${file.name} supera los 5MB`, { id: toastId });
          continue;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) throw new Error('Error al subir imagen');

        const data = await response.json();
        newImages.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImages]
      }));
      toast.success('Imágenes subidas correctamente', { id: toastId });
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      toast.error('Error al subir algunas imágenes', { id: toastId });
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categorias');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id_usuario) {
      toast.error('Debes iniciar sesión para crear un servicio');
      navigate('/');
      return;
    }

    const selectedCategory = categories.find(cat => cat.nombre_categoria === formData.category);

    if (!selectedCategory) {
      toast.error('Por favor selecciona una categoría válida');
      return;
    }

    const servicioData = {
      id_usuario: user.id_usuario,
      id_categoria: selectedCategory.id_categoria,
      titulo: formData.title,
      descripcion: formData.description,
      precio: parseFloat(formData.price),
      tiempo_entrega: formData.tiempo_entrega || '1-3 días',
      imagen_portada: formData.imagen_portada,
      imagenes: formData.imagenes
    };

    try {
      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(servicioData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el servicio');
      }

      const nuevoServicio = await response.json();
      toast.success('¡Servicio publicado exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Error al publicar el servicio');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          <Container maxWidth="md">
            <Box sx={{ mb: 5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 1.5,
                  borderRadius: 4,
                  bgcolor: 'rgba(135, 10, 66, 0.05)',
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: '1.5rem', color: '#870a42' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1, letterSpacing: '-0.02em' }}>
                Crear Nuevo Servicio
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                Completa la información detallada para atraer a más clientes potenciales.
              </Typography>
            </Box>

            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#374151',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Título del Servicio
                    </Typography>
                    <TextField
                      fullWidth
                      name="title"
                      placeholder="Ej: Desarrollo de Aplicaciones Web"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontWeight: 500,
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderWidth: 2,
                            borderColor: '#e5e7eb',
                          },
                          '&:hover fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(135, 10, 66, 0.05)',
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#374151',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Categoría
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      placeholder="Selecciona una categoría"
                      InputProps={{
                        sx: {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontWeight: 500,
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderWidth: 2,
                            borderColor: '#e5e7eb',
                          },
                          '&:hover fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(135, 10, 66, 0.05)',
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Selecciona una categoría
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id_categoria} value={category.nombre_categoria}>
                          {category.nombre_categoria}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#374151',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Precio Total (USD)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      name="price"
                      placeholder="Ej: 25"
                      inputProps={{ min: 1 }}
                      value={formData.price}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontWeight: 500,
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderWidth: 2,
                            borderColor: '#e5e7eb',
                          },
                          '&:hover fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(135, 10, 66, 0.05)',
                          },
                        },
                      }}
                      />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#374151',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Tiempo de Entrega Estimado
                    </Typography>
                    <TextField
                      fullWidth
                      name="tiempo_entrega"
                      placeholder="Ej: 1-3 días, 1 semana, 24 horas"
                      value={formData.tiempo_entrega}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontWeight: 500,
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderWidth: 2,
                            borderColor: '#e5e7eb',
                          },
                          '&:hover fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#870a42',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(135, 10, 66, 0.05)',
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#374151',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Descripción del Servicio
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    name="description"
                    placeholder="Describe detalladamente qué ofreces, tu experiencia y entregables..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        bgcolor: 'white',
                        fontWeight: 500,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderWidth: 2,
                          borderColor: '#e5e7eb',
                        },
                        '&:hover fieldset': {
                          borderColor: '#870a42',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#870a42',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 4px rgba(135, 10, 66, 0.05)',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#374151',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Imagen de Portada
                  </Typography>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <Box
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      border: '2px dashed #e5e7eb',
                      borderRadius: 4,
                      p: formData.imagen_portada ? 1 : 5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        borderColor: '#870a42',
                        bgcolor: 'rgba(135, 10, 66, 0.05)',
                        '& .upload-icon-bg': {
                          bgcolor: 'white',
                        },
                        '& .upload-icon': {
                          color: '#870a42',
                        },
                      },
                    }}
                  >
                    {formData.imagen_portada ? (
                      <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
                        <img
                          src={formData.imagen_portada}
                          alt="Previsualización"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                        />
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
                          <Typography sx={{ color: 'white', fontWeight: 600 }}>Cambiar imagen</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box
                          className="upload-icon-bg"
                          sx={{
                            bgcolor: '#f9fafb',
                            width: 64,
                            height: 64,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <CloudUploadIcon
                            className="upload-icon"
                            sx={{
                              fontSize: '2rem',
                              color: '#9ca3af',
                              transition: 'color 0.2s',
                            }}
                          />
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                          Haz clic para subir una imagen
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                          Formatos sugeridos: PNG, JPG (Máx. 5MB)
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#374151',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Galería de Imágenes (Opcional)
                  </Typography>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleGalleryUpload}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <Box
                    onClick={() => galleryInputRef.current.click()}
                    sx={{
                      border: '2px dashed #e5e7eb',
                      borderRadius: 4,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      mb: 2,
                      '&:hover': {
                        borderColor: '#870a42',
                        bgcolor: 'rgba(135, 10, 66, 0.05)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      + Agregar imágenes a la galería
                    </Typography>
                  </Box>

                  {formData.imagenes.length > 0 && (
                    <Grid container spacing={2}>
                      {formData.imagenes.map((img, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ position: 'relative', paddingTop: '100%', borderRadius: 2, overflow: 'hidden' }}>
                            <img src={img} alt={`Galeria ${index}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box
                              onClick={() => removeGalleryImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'red' }
                              }}
                            >
                              &times;
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                <Box sx={{ pt: 4, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      flex: 1,
                      borderRadius: 3,
                      fontWeight: 700,
                      color: '#6b7280',
                      borderColor: '#e5e7eb',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        borderColor: '#e5e7eb',
                      },
                    }}
                  >
                    Descartar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      flex: 1,
                      borderRadius: 3,
                      fontWeight: 900,
                      bgcolor: '#870a42',
                      textTransform: 'none',
                      py: 1.5,
                      boxShadow: '0 10px 15px -3px rgba(135, 10, 66, 0.2)',
                      '&:hover': {
                        bgcolor: '#6b0835',
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }}
                  >
                    Publicar Ahora
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};