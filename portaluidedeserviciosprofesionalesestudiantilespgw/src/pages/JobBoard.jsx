import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, Grid, Paper, Typography, Button, TextField, InputAdornment } from '@mui/material';
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

export const JobBoard = () => {
    const { user } = useApp();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && user.role === 'estudiante') {
            fetchRequirements();
        }
    }, [user]);

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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: '1600px', mx: 'auto', width: '100%', minHeight: '100%', backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>

                    {/* Header Section */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1, letterSpacing: '-0.025em' }}>
                                Bolsa de Trabajo
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                Oportunidades exclusivas para tu carrera: <strong>{user.career || 'Estudiante UIDE'}</strong>
                            </Typography>
                        </Box>

                        <TextField
                            placeholder="Buscar oportunidades..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#9ca3af' }} />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'white', borderRadius: 2, width: { xs: '100%', sm: '300px' } }
                            }}
                        />
                    </Box>

                    {/* Requirements Grid */}
                    {loading ? (
                        <Typography align="center" sx={{ mt: 4, color: '#6b7280' }}>Cargando ofertas...</Typography>
                    ) : filtered.length > 0 ? (
                        <Grid container spacing={2}>
                            {filtered.map((req) => (
                                <Grid item xs={12} md={6} lg={4} key={req.id_requerimiento}>
                                    <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Chip
                                                label={req.carrera?.nombre_carrera || 'General'}
                                                size="small"
                                                sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, borderRadius: 1.5 }}
                                            />
                                            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                                                {new Date(req.fecha_publicacion).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1, lineHeight: 1.3 }}>
                                            {req.titulo}
                                        </Typography>

                                        {/* Nombre del cliente */}
                                        {req.cliente && (
                                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5, fontSize: '0.875rem', fontWeight: 500 }}>
                                                Publicado por: <Box component="span" sx={{ fontWeight: 600, color: '#374151' }}>{req.cliente.nombre} {req.cliente.apellido}</Box>
                                            </Typography>
                                        )}

                                        <Typography variant="body2" sx={{ color: '#4b5563', mb: 3, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {req.descripcion}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, color: '#6b7280', fontSize: '0.875rem' }}>
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
                                                bgcolor: '#111827',
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                py: 1.5,
                                                '&:hover': { bgcolor: '#374151' }
                                            }}
                                        >
                                            Postularme Ahora
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 3, border: '1px dashed #e5e7eb' }}>
                            <SchoolIcon sx={{ fontSize: 60, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600 }}>No hay ofertas disponibles</Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>No hay requerimientos activos para tu carrera en este momento.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};
