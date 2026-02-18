
import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, TextField, MenuItem, Button, Typography, Grid } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../lib/context/AppContext';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const UpdateService = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useApp();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price: '',
        tiempo_entrega: '',
        imagen_portada: null
    });
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);

    // Fetch Service Data
    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`/api/servicios/${id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Verify ownership (optional here as backend checks it, but good for UX)
                    if (user && data.id_usuario !== user.id_usuario) {
                        toast.error("No tienes permiso para editar este servicio.");
                        navigate('/mis-servicios');
                        return;
                    }

                    setFormData({
                        title: data.titulo,
                        category: data.categoria?.nombre_categoria || '',
                        description: data.descripcion,
                        price: data.precio,
                        tiempo_entrega: data.tiempo_entrega || '',
                        imagen_portada: data.imagen_portada
                    });
                } else {
                    toast.error("Error al cargar el servicio");
                    navigate('/mis-servicios');
                }
            } catch (error) {
                console.error(error);
                toast.error("Error de conexión");
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            fetchService();
        }
    }, [id, user, navigate]);


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

        // Validate user authentication
        if (!user || !user.id_usuario) {
            toast.error('Debes iniciar sesión');
            navigate('/');
            return;
        }

        // Find the category ID from the selected category name
        const selectedCategory = categories.find(cat => cat.nombre_categoria === formData.category);

        if (!selectedCategory) {
            toast.error('Por favor selecciona una categoría válida');
            return;
        }

        // Prepare data for backend
        const servicioData = {
            id_categoria: selectedCategory.id_categoria,
            titulo: formData.title,
            descripcion: formData.description,
            precio: parseFloat(formData.price),
            tiempo_entrega: formData.tiempo_entrega || '1-3 días',
            imagen_portada: formData.imagen_portada
        };

        try {
            const response = await fetch(`/api/servicios/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(servicioData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al actualizar el servicio');
            }

            toast.success('¡Servicio actualizado exitosamente!');
            navigate('/mis-servicios');
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error(error.message || 'Error al actualizar el servicio');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) return <div>Cargando...</div>;

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
                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                                Editar Servicio
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Actualiza la información de tu servicio.
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
                                        <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
                                            Título del Servicio
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="title"
                                            placeholder="Ej: Desarrollo de Aplicaciones Web"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            InputProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', fontWeight: 500 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
                                            Categoría
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            select
                                            name="category"
                                            value={formData.category} // Needs to match one of the categories
                                            onChange={handleChange}
                                            required
                                            InputProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', fontWeight: 500 } }}
                                        >
                                            {categories.map((category) => (
                                                <MenuItem key={category.id_categoria} value={category.nombre_categoria}>
                                                    {category.nombre_categoria}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
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
                                          InputProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', fontWeight: 500 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
                                            Tiempo de Entrega Estimado
                                        </Typography>
                                        <TextField
                                          fullWidth
                                          name="tiempo_entrega"
                                          placeholder="Ej: 1-3 días, 1 semana, 24 horas"
                                          value={formData.tiempo_entrega}
                                          onChange={handleChange}
                                          required
                                          InputProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', fontWeight: 500 } }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
                                        Descripción del Servicio
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={5}
                                        name="description"
                                        placeholder="Describe detalladamente qué ofreces..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        InputProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', fontWeight: 500 } }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
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
                                            border: (theme) => `2px dashed ${theme.palette.divider}`,
                                            borderRadius: 4,
                                            p: formData.imagen_portada ? 1 : 5,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            '&:hover': {
                                                borderColor: (theme) => theme.palette.mode === 'dark' ? '#870a42' : '#870a42',
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(135, 10, 66, 0.1)' : 'rgba(135, 10, 66, 0.05)',
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
                                            <Box sx={{ p: 2 }}>
                                                <CloudUploadIcon sx={{ fontSize: '2rem', color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#9ca3af', mb: 1 }} />
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#111827' }}>Haz clic para subir una imagen</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ pt: 4, borderTop: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2 }}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="large"
                                        onClick={() => navigate('/mis-servicios')}
                                        sx={{
                                            flex: 1,
                                            borderRadius: 3,
                                            fontWeight: 700,
                                            color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#6b7280',
                                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            textTransform: 'none',
                                            py: 1.5,
                                            boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                ? '0 1px 2px rgba(0,0,0,0.2)' 
                                                : 'none',
                                            '&:hover': { 
                                                bgcolor: (theme) => theme.palette.mode === 'dark' 
                                                    ? 'rgba(255,255,255,0.1)' 
                                                    : '#f9fafb', 
                                                borderColor: (theme) => theme.palette.mode === 'dark' 
                                                    ? 'rgba(255,255,255,0.5)' 
                                                    : '#d1d5db',
                                                transform: 'translateY(-1px)',
                                                boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                    ? '0 4px 8px rgba(0,0,0,0.3)' 
                                                    : '0 4px 8px rgba(0,0,0,0.1)'
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                                boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                    ? '0 1px 2px rgba(0,0,0,0.2)' 
                                                    : 'none'
                                            }
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            flex: 1,
                                            borderRadius: 3,
                                            fontWeight: 900,
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#870a42' : '#870a42',
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            py: 1.5,
                                            boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                ? '0 10px 15px -3px rgba(135, 10, 66, 0.4)' 
                                                : '0 10px 15px -3px rgba(135, 10, 66, 0.2)',
                                            '&:hover': { 
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#6b0835' : '#6b0835',
                                                transform: 'translateY(-1px)',
                                                boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                    ? '0 20px 25px -5px rgba(135, 10, 66, 0.5)' 
                                                    : '0 20px 25px -5px rgba(135, 10, 66, 0.3)'
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                                boxShadow: (theme) => theme.palette.mode === 'dark' 
                                                    ? '0 10px 15px -3px rgba(135, 10, 66, 0.4)' 
                                                    : '0 10px 15px -3px rgba(135, 10, 66, 0.2)'
                                            }
                                        }}
                                    >
                                        Guardar Cambios
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
