import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Chip,
    InputAdornment,
    TextField,
    Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const Carreras = () => {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/carreras');
            if (response.ok) {
                const data = await response.json();
                // Filter only active careers for public view
                setCarreras(data.filter(c => c.activo !== false));
            } else {
                setError('No se pudieron cargar las carreras.');
            }
        } catch (error) {
            console.error('Error fetching carreras:', error);
            setError('Error de conexión al cargar carreras.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedSearchTerm(searchTerm), 250);
        return () => clearTimeout(handle);
    }, [searchTerm]);

    const normalizedTerm = debouncedSearchTerm.trim().toLowerCase();
    const filteredCarreras = carreras.filter((carrera) => {
        const nombre = (carrera.nombre_carrera || '').toLowerCase();
        const facultad = (carrera.facultad?.nombre_facultad || '').toLowerCase();
        return nombre.includes(normalizedTerm) || facultad.includes(normalizedTerm);
    });

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, ml: { md: '240px' } }}>
                <Header />
                <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
                    <Container maxWidth="xl">
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <SchoolIcon sx={{ fontSize: 40, color: '#870a42' }} />
                                Explorar Carreras
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                                Descubre los programas académicos y proyectos estudiantiles
                            </Typography>
                        </Box>

                        {/* Search Bar */}
                        <Box sx={{ mb: 4, bgcolor: 'background.paper', p: 2, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <TextField
                                fullWidth
                                placeholder="Buscar carrera..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm ? (
                                        <InputAdornment position="end">
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                aria-label="Limpiar búsqueda"
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    padding: 0
                                                }}
                                            >
                                                <CloseIcon sx={{ color: 'text.secondary' }} />
                                            </Box>
                                        </InputAdornment>
                                    ) : null
                                }}
                                variant="outlined"
                            />
                        </Box>

                        {!loading && !error ? (
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {filteredCarreras.length} resultado{filteredCarreras.length === 1 ? '' : 's'}
                                </Typography>
                                {normalizedTerm ? (
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        Buscando: “{debouncedSearchTerm.trim()}”
                                    </Typography>
                                ) : null}
                            </Box>
                        ) : null}

                        {loading ? (
                            <Grid container spacing={3}>
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
                                        <Skeleton variant="rectangular" height={440} sx={{ borderRadius: 4 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : error ? (
                            <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'background.paper', borderRadius: 4, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.35, mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
                                    {error}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                                    Intenta recargar la página.
                                </Typography>
                            </Box>
                        ) : filteredCarreras.length > 0 ? (
                            <Grid container spacing={3}>
                                {filteredCarreras.map((carrera) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={carrera.id_carrera}>
                                        <Card
                                            component={Link}
                                            to={`/carrera/${carrera.id_carrera}`}
                                            sx={{
                                                height: 340,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 4,
                                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                                textDecoration: 'none',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                overflow: 'hidden',
                                                boxSizing: 'border-box',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                    borderColor: 'transparent'
                                                },
                                                '&:focus-visible': {
                                                    outline: '3px solid rgba(135, 10, 66, 0.35)',
                                                    outlineOffset: 2,
                                                },
                                            }}
                                        >
                                            {/* Imagen - 140px fijo */}
                                            <Box sx={{ position: 'relative', overflow: 'hidden', height: 140, flexShrink: 0 }}>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={carrera.imagen_carrera || '/placeholder-carrera.jpg'}
                                                    alt={carrera.nombre_carrera}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transition: 'transform 0.5s',
                                                    }}
                                                    onError={(e) => { e.target.src = '/placeholder-carrera.jpg'; }}
                                                />
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                                    }}
                                                />
                                                <Chip
                                                    label={carrera.tipo_carrera || 'Grado'}
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255,255,255,0.9)'),
                                                        color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.primary.light : '#870a42'),
                                                        fontWeight: 800,
                                                        fontSize: '0.7rem',
                                                        backdropFilter: 'blur(4px)'
                                                    }}
                                                />
                                            </Box>

                                            {/* Contenido - altura fija calculada */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    p: 2,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.5, flexShrink: 0 }}>
                                                    {carrera.facultad?.nombre_facultad || 'Facultad'}
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: 'text.primary',
                                                        mb: 0.5,
                                                        lineHeight: 1.3,
                                                        display: '-webkit-box',
                                                        overflow: 'hidden',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                        flexShrink: 0
                                                    }}
                                                    title={carrera.nombre_carrera || ''}
                                                >
                                                    {carrera.nombre_carrera || 'Carrera sin nombre'}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        fontSize: '0.875rem',
                                                        display: '-webkit-box',
                                                        overflow: 'hidden',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 3,
                                                        flex: 1
                                                    }}
                                                    title={carrera.descripcion_carrera || ''}
                                                >
                                                    {carrera.descripcion_carrera || 'Sin descripción disponible.'}
                                                </Typography>
                                            </Box>

                                            {/* Footer - altura fija */}
                                            <Box
                                                sx={{
                                                    flex: 0,
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {carrera.duracion_anios} años
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}> • </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {carrera._count?.usuarios || 0} estudiantes
                                                    </Typography>
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                                    Ver Detalles →
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'background.paper', borderRadius: 4, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.35, mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    No se encontraron carreras que coincidan con tu búsqueda
                                </Typography>
                            </Box>
                        )}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};