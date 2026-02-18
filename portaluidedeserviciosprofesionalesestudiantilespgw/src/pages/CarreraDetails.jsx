import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Button,
    Chip,
    Divider,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Tabs,
    Tab
} from '@mui/material';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/Star';
import { useApp } from '../lib/context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const CarreraDetails = () => {
    const { id } = useParams();
    const { user } = useApp();
    const [carrera, setCarrera] = useState(null);
    const [students, setStudents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};

                // 1. Fetch Career Details
                // Intentamos obtener los detalles de la carrera. 
                // Nota: Si no existe un endpoint directo /api/carreras/:id, podríamos necesitar ajustar esto.
                const carreraResponse = await fetch(`/api/carreras/${id}`, { headers });
                if (carreraResponse.ok) {
                    const carreraData = await carreraResponse.json();
                    setCarrera(carreraData);
                } else {
                    // Fallback si falla la carga individual, quizás obtener de una lista?
                    // Por ahora lanzamos error para debug
                    throw new Error('No se pudo cargar la información de la carrera');
                }

                // 2. Fetch Students in this Career
                // Asumimos un endpoint que permite filtrar usuarios por carrera
                const studentsResponse = await fetch(`/api/usuarios?carrera_id=${id}&rol=estudiante`, { headers });
                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    // Filtrar manualmente si el endpoint devuelve todos
                    const filteredStudents = Array.isArray(studentsData) ? studentsData.filter(u => u.carrera_id == id || u.carrera?.id_carrera == id) : [];
                    setStudents(filteredStudents);
                }

                // 3. Fetch Projects (Services) in this Career
                const projectsResponse = await fetch(`/api/servicios?carrera=${id}`, { headers });
                if (projectsResponse.ok) {
                    const projectsData = await projectsResponse.json();
                    setProjects(projectsData);
                }

            } catch (err) {
                console.error("Error fetching career details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, user]);

    const bannerStyle = carrera?.banner_carrera
        ? {
            backgroundImage: `linear-gradient(rgba(135,10,66,0.65), rgba(135,10,66,0.65)), url(${carrera.banner_carrera})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }
        : {
            backgroundImage: 'linear-gradient(45deg, #870a42 30%, #a01c57 90%)'
        };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, ml: { md: '240px' } }}>
                <Header />

                <Box sx={{ flex: 1, bgcolor: 'background.default', pb: 8, position: 'relative' }}>
                    {/* Banner / Header */}
                    <Box
                        sx={{
                            height: 250,
                            bgcolor: '#870a42',
                            position: 'relative',
                            ...bannerStyle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <Container
                            maxWidth="lg"
                            sx={{ position: 'absolute', top: 16, left: 0, right: 0, zIndex: 2, display: 'flex', justifyContent: 'flex-start' }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<ArrowBackIcon />}
                                component={Link}
                                to="/carreras"
                                sx={{
                                    bgcolor: 'rgba(17,24,39,0.7)',
                                    color: 'white',
                                    borderRadius: 99,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    px: 2,
                                    backdropFilter: 'blur(6px)',
                                    '&:hover': { bgcolor: 'rgba(17,24,39,0.85)' }
                                }}
                            >
                                Volver
                            </Button>
                        </Container>

                        {/* Decorative Circles */}
                        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', top: -100, right: -100 }} />
                        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', bottom: -50, left: -50 }} />

                        <Container maxWidth="lg">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                                {/* Career Logo or Initials */}
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {carrera?.imagen_carrera && !imageError ? (
                                        <Box
                                            component="img"
                                            src={carrera.imagen_carrera}
                                            onError={() => setImageError(true)}
                                            alt={carrera.nombre_carrera}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Avatar
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                bgcolor: 'background.paper',
                                                color: '#870a42',
                                                fontSize: '3rem',
                                                fontWeight: 900,
                                                borderRadius: 0
                                            }}
                                        >
                                            {carrera?.nombre_carrera
                                                ? carrera.nombre_carrera
                                                    .split(' ')
                                                    .map(word => word[0])
                                                    .join('')
                                                    .substring(0, 2)
                                                    .toUpperCase()
                                                : 'C'}
                                        </Avatar>
                                    )}
                                </Box>

                                <Box>
                                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        {carrera?.nombre_carrera || 'Carrera'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Container>
                    </Box>

                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                                <CircularProgress sx={{ color: '#870a42' }} />
                            </Box>
                        ) : (error || !carrera) ? (
                            <Box sx={{ py: 4 }}>
                                <Typography variant="h5" color="error">Error: {error || 'Carrera no encontrada'}</Typography>
                                <Button component={Link} to="/carreras" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                                    Volver a Carreras
                                </Button>
                            </Box>
                        ) : (
                            <>
                                {/* Top Section: Description + Info Sidebar */}
                                <Grid container spacing={4} alignItems="flex-start">
                                    {/* Left Column: Description */}
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '0.1em' }}>
                                                DESCRIPCIÓN DE LA CARRERA
                                            </Typography>
                                            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                                {carrera.descripcion_carrera || 'No hay descripción disponible para esta carrera.'}
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    {/* Right Column: Sidebar / Stats / Actions */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 15px rgba(0,0,0,0.05)', position: 'sticky', top: 24, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 3 }}>
                                                Información
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                                <Chip
                                                    label={carrera.tipo_carrera || '—'}
                                                    size="small"
                                                    sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(135,10,66,0.25)' : 'rgba(135,10,66,0.1)'), color: 'primary.main', fontWeight: 800 }}
                                                />
                                                <Chip
                                                    label={carrera.duracion_anios != null ? `${carrera.duracion_anios} años` : '—'}
                                                    size="small"
                                                    sx={{ bgcolor: 'action.hover', color: 'text.primary', fontWeight: 800 }}
                                                />
                                                <Chip
                                                    label={`${projects.length} proyecto${projects.length === 1 ? '' : 's'}`}
                                                    size="small"
                                                    sx={{ bgcolor: 'action.hover', color: 'text.primary', fontWeight: 800 }}
                                                />
                                                <Chip
                                                    label={`${students.length} estudiante${students.length === 1 ? '' : 's'}`}
                                                    size="small"
                                                    sx={{ bgcolor: 'action.hover', color: 'text.primary', fontWeight: 800 }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                                                <SchoolIcon sx={{ color: '#870a42' }} />
                                                <Box>
                                                    <Typography variant="button" display="block" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                                        Facultad
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                        {carrera.facultad?.nombre_facultad || '—'}
                                                    </Typography>
                                                </Box>

                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                {/* Bottom Section: Tabs (Full Width) */}
                                <Paper sx={{ mt: 4, p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(e, newValue) => setActiveTab(newValue)}
                                        sx={{
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            mb: 3,
                                            '& .MuiTab-root': {
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                textTransform: 'none',
                                                minHeight: 48
                                            },
                                            '& .Mui-selected': {
                                                color: '#870a42'
                                            },
                                            '& .MuiTabs-indicator': {
                                                backgroundColor: '#870a42',
                                                height: 3
                                            }
                                        }}
                                    >
                                        <Tab label={`Proyectos (${projects.length})`} />
                                        <Tab label={`Estudiantes (${students.length})`} />
                                    </Tabs>

                                    {/* Tab Panel 0: Projects */}
                                    {activeTab === 0 && (
                                        <>
                                            {projects.length > 0 ? (
                                                <Grid container spacing={3}>
                                                    {projects.map((project) => (
                                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project.id_servicio}>
                                                            <Card
                                                                sx={{
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    borderRadius: 3,
                                                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                                                    boxShadow: 'none',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-4px)',
                                                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                                                        borderColor: '#870a42'
                                                                    }
                                                                }}
                                                                component={Link}
                                                                to={`/service/${project.id_servicio}`}
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <CardMedia
                                                                    component="img"
                                                                    height="160"
                                                                    image={project.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000'}
                                                                    alt={project.titulo}
                                                                    sx={{ objectFit: 'cover' }}
                                                                />
                                                                <CardContent sx={{ flex: 1, p: 2, pb: 1 }}>
                                                                    <Chip
                                                                        label={project.categoria?.nombre_categoria || 'Servicio'}
                                                                        size="small"
                                                                        sx={{ mb: 1, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(135,10,66,0.25)' : 'rgba(135,10,66,0.1)'), color: 'primary.main', fontWeight: 700, fontSize: '0.7rem', height: 24 }}
                                                                    />
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3, mb: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, height: 42 }}>
                                                                        {project.titulo}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                                        <Avatar src={project.usuario?.foto_perfil} sx={{ width: 24, height: 24 }} />
                                                                        <Typography variant="caption" color="text.secondary" noWrap>
                                                                            {project.usuario?.nombre} {project.usuario?.apellido}
                                                                        </Typography>
                                                                    </Box>
                                                                </CardContent>
                                                                <Box sx={{ p: 2, pt: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <StarIcon sx={{ fontSize: 16, color: (project._count?.resenas > 0) ? '#fbbf24' : '#e5e7eb' }} />
                                                                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                                            {(project._count?.resenas > 0) ? Number(project.calificacion_promedio).toFixed(1) : 'Nuevo'}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#870a42' }}>
                                                                        {project.precio != null ? `$${project.precio}` : '—'}
                                                                    </Typography>
                                                                </Box>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 2, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                                    <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                                                    <Typography color="text.secondary">
                                                        No hay proyectos publicados en esta carrera.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}

                                    {/* Tab Panel 1: Students */}
                                    {activeTab === 1 && (
                                        <>
                                            {students.length > 0 ? (
                                                <Grid container spacing={2}>
                                                    {students.map((student) => (
                                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={student.id_usuario}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                                                    borderRadius: 3,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 2,
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        borderColor: '#870a42',
                                                                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(135,10,66,0.12)' : '#fff1f2'),
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 4px 12px rgba(135, 10, 66, 0.1)'
                                                                    }
                                                                }}
                                                                component={Link}
                                                                to={`/perfil/${student.id_usuario}`}
                                                                style={{ textDecoration: 'none' }}
                                                            >
                                                                <Avatar
                                                                    src={student.foto_perfil}
                                                                    sx={{ width: 50, height: 50, border: (theme) => `2px solid ${theme.palette.background.paper}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                                >
                                                                    {student.nombre?.charAt(0)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2 }}>
                                                                        {student.nombre} {student.apellido}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                        Estudiante
                                                                    </Typography>
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 2, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                                                    <Typography color="text.secondary">
                                                        No se encontraron estudiantes registrados en esta carrera.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Paper>
                            </>
                        )}
                    </Container>
                </Box>
            </Box>
        </Box >
    );
};
