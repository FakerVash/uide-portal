import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Grid, Paper, Typography, Button, TextField, InputAdornment, Tabs, Tab } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';

export const JobBoard = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [myApplications, setMyApplications] = useState([]);

    useEffect(() => {
        if (user && user.role === 'estudiante') {
            if (currentTab === 0) fetchRequirements();
            if (currentTab === 1) fetchMyApplications();
        }
    }, [user, currentTab]);

    const fetchRequirements = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/requerimientos', {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRequirements(data);
            } else {
                toast.error('Error al cargar ofertas');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/requerimientos/mis-postulaciones', {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMyApplications(data);
            } else {
                toast.error('Error al cargar postulaciones');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (reqId) => {
        try {
            const response = await fetch(`/api/requerimientos/${reqId}/postular`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });

            if (response.ok) {
                toast.success('¡Postulación enviada con éxito!');
                fetchRequirements(); // Refresh to update status if needed
            } else {
                const err = await response.json();
                toast.error(err.message || 'Error al postular');
            }
        } catch (e) {
            toast.error('Error de conexión');
        }
    };

    const filtered = requirements.filter(r =>
        r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || user.role !== 'estudiante') {
        return <Box sx={{ p: 4 }}>Acceso restringido a estudiantes.</Box>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{
                    flex: 1,
                    p: { xs: 2, md: 3 },
                    maxWidth: '1600px',
                    mx: 'auto',
                    width: '100%',
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
                }}>

                    {/* Header Section */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.025em' }}>
                                Bolsa de Trabajo
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                Oportunidades exclusivas para tu carrera: <strong>{user.career || 'Estudiante UIDE'}</strong>
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/publicar-requerimiento')}
                                sx={{
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#870a42' : '#111827',
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    height: 40,
                                    zIndex: 10,
                                    position: 'relative',
                                    '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#6b0835' : '#374151' }
                                }}
                            >
                                Publicar
                            </Button>

                            {currentTab === 0 && (
                                <TextField
                                    placeholder="Buscar oportunidades..."
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#9ca3af' }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                            borderRadius: 2,
                                            width: { xs: '100%', sm: '300px' }
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} aria-label="job board tabs" textColor="inherit" indicatorColor="primary">
                            <Tab label="Ofertas Disponibles" icon={<WorkIcon />} iconPosition="start" />
                            <Tab label="Mis Postulaciones" icon={<CheckCircleIcon />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    {/* Requirements Grid */}
                    {loading ? (
                        <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>Cargando...</Typography>
                    ) : currentTab === 0 ? (
                        /* OFFERTAS DISPONIBLES */
                        filtered.length > 0 ? (
                            <Grid container spacing={2}>
                                {filtered.map((req) => (
                                    <Grid item xs={12} md={6} lg={4} key={req.id_requerimiento}>
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Chip
                                                    label={req.carrera?.nombre_carrera || 'General'}
                                                    size="small"
                                                    sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(29, 78, 216, 0.25)' : '#eff6ff'), color: (theme) => (theme.palette.mode === 'dark' ? '#60a5fa' : '#1d4ed8'), fontWeight: 700, borderRadius: 1.5 }}
                                                />
                                                <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#9ca3af', fontWeight: 600 }}>
                                                    {new Date(req.fecha_publicacion).toLocaleDateString()}
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, lineHeight: 1.3 }}>
                                                {req.titulo}
                                            </Typography>

                                            {/* Nombre del cliente */}
                                            {req.cliente && (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontSize: '0.875rem', fontWeight: 500 }}>
                                                    Publicado por: <Box component="span" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#374151' }}>{req.cliente.nombre} {req.cliente.apellido}</Box>
                                                </Typography>
                                            )}

                                            <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#4b5563', mb: 3, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {req.descripcion}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#6b7280', fontSize: '0.875rem' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoneyIcon fontSize="small" sx={{ color: '#10b981' }} />
                                                    <Typography fontWeight={600} color="#10b981">Precio a negociar</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <WorkIcon fontSize="small" />
                                                    <Typography>Modalidad flexible</Typography>
                                                </Box>
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleApply(req.id_requerimiento)}
                                                sx={{
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#870a42' : '#111827',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    borderRadius: 2,
                                                    py: 1.5,
                                                    boxShadow: (theme) => theme.palette.mode === 'dark'
                                                        ? '0 4px 8px rgba(135, 10, 66, 0.3)'
                                                        : '0 4px 8px rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#6b0835' : '#374151',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                                            ? '0 8px 16px rgba(135, 10, 66, 0.4)'
                                                            : '0 8px 16px rgba(0,0,0,0.2)'
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(0)',
                                                        boxShadow: (theme) => theme.palette.mode === 'dark'
                                                            ? '0 4px 8px rgba(135, 10, 66, 0.3)'
                                                            : '0 4px 8px rgba(0,0,0,0.1)'
                                                    }
                                                }}
                                            >
                                                Postularme Ahora
                                            </Button>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', borderRadius: 3, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                <SchoolIcon sx={{ fontSize: 60, color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#d1d5db', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>No hay ofertas disponibles</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No hay requerimientos activos para tu carrera en este momento.</Typography>
                            </Box>
                        )
                    ) : (
                        /* MIS POSTULACIONES */
                        myApplications.length > 0 ? (
                            <Grid container spacing={2}>
                                {myApplications.map((post) => (
                                    <Grid item xs={12} key={post.id_postulacion}>
                                        <Paper sx={{ p: 2.5, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                        {post.requerimiento.titulo}
                                                    </Typography>
                                                    <Chip
                                                        label={post.estado}
                                                        color={post.estado === 'ACEPTADA' ? 'success' : post.estado === 'RECHAZADA' ? 'error' : 'warning'}
                                                        size="small"
                                                        sx={{ fontWeight: 700, borderRadius: 1 }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Postulado el: {new Date(post.fecha_postulacion).toLocaleDateString()}
                                                </Typography>
                                                {post.requerimiento.cliente && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                                        Cliente: {post.requerimiento.cliente.nombre} {post.requerimiento.cliente.apellido}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Box sx={{ textAlign: 'right' }}>
                                                {post.estado === 'ACEPTADA' && (
                                                    <Typography sx={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CheckCircleIcon fontSize="small" /> ¡Seleccionado!
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', borderRadius: 3, border: (theme) => `1px dashed ${theme.palette.divider}` }}>
                                <WorkIcon sx={{ fontSize: 60, color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#d1d5db', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>No te has postulado a nada aún</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Revisa las ofertas disponibles y postúlate a la que te interese.</Typography>
                            </Box>
                        )
                    )}
                </Box>
            </Box>
        </Box>
    );
};
