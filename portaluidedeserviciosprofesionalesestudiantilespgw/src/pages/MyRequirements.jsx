import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider
} from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';

export const MyRequirements = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (user && user.role === 'cliente') {
            fetchMyRequirements();
        }
    }, [user]);

    const fetchMyRequirements = async () => {
        try {
            const response = await fetch('/api/requerimientos?mis_requerimientos=true', {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRequirements(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCandidates = async (req) => {
        setSelectedReq(req);
        setOpenDialog(true);
        setLoadingCandidates(true);
        try {
            const response = await fetch(`/api/requerimientos/${req.id_requerimiento}/postulaciones`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCandidates(data);
            }
        } catch (error) {
            toast.error('Error al cargar candidatos');
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleSelectCandidate = (candidate) => {
        // Abrir contacto de WhatsApp del estudiante seleccionado
        const estudiante = candidate.estudiante || {};
        const rawPhone =
            estudiante.telefono ||
            estudiante.phone ||
            estudiante.celular ||
            estudiante.whatsapp;

        if (!rawPhone) {
            toast.error('Este estudiante no tiene un número de contacto registrado.');
            return;
        }

        // Normalizar número (quitar espacios, guiones, paréntesis, puntos)
        let cleanedPhone = String(rawPhone).replace(/[^0-9+]/g, '');

        if (!cleanedPhone) {
            toast.error('Número de WhatsApp inválido para este estudiante.');
            return;
        }

        // Si empieza con +, quitarlo temporalmente para procesar
        const hasPlus = cleanedPhone.startsWith('+');
        if (hasPlus) {
            cleanedPhone = cleanedPhone.substring(1);
        }

        // Si el número tiene menos de 10 dígitos o no empieza con código de país, agregar +593 (Ecuador)
        if (cleanedPhone.length < 10) {
            toast.error('El número de teléfono parece estar incompleto.');
            return;
        }

        // Si empieza con 0, quitarlo (formato local)
        if (cleanedPhone.startsWith('0')) {
            cleanedPhone = cleanedPhone.substring(1);
        }

        // Si no empieza con código de país (593 para Ecuador), agregarlo
        if (!cleanedPhone.startsWith('593')) {
            cleanedPhone = '593' + cleanedPhone;
        }

        const nombreEstudiante = `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim();
        const tituloReq = selectedReq?.titulo || 'tu requerimiento publicado en la plataforma UIDE';

        const mensaje = `Hola ${nombreEstudiante},

Te contacto desde el Portal Estudiantil de Servicios de la UIDE por el requerimiento: "${tituloReq}".

¿Podemos coordinar los detalles del trabajo?`;

        const encodedMsg = encodeURIComponent(mensaje);
        // WhatsApp necesita el número sin el + en la URL
        const waUrl = `https://wa.me/${cleanedPhone}?text=${encodedMsg}`;

        // Redirigir directamente al chat de WhatsApp
        window.location.href = waUrl;
        toast.success(`Redirigiendo a WhatsApp con ${nombreEstudiante || 'el estudiante'}...`);
        setOpenDialog(false);
    };

    if (!user || user.role !== 'cliente') {
        return <Box sx={{ p: 4 }}>Acceso restringido a clientes.</Box>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <Box sx={{ width: '100%', maxWidth: 1280, flexShrink: 0 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                            Mis Requerimientos
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/publicar-requerimiento')}
                            sx={{
                                bgcolor: '#111827',
                                color: 'white',
                                '&:hover': { bgcolor: '#374151' },
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                        >
                            Publicar Nuevo
                        </Button>
                    </Box>

                    {loading ? (
                        <Typography>Cargando...</Typography>
                    ) : requirements.length > 0 ? (
                        requirements.map((req) => (
                            <Paper
                                key={req.id_requerimiento}
                                sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 3,
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{req.titulo}</Typography>
                                        <Chip
                                            label={req.estado}
                                            size="small"
                                            color={req.estado === 'ABIERTO' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Publicado el {new Date(req.fecha_publicacion).toLocaleDateString()} • {req._count?.postulaciones || 0} Postulantes
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleViewCandidates(req)}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Ver Candidatos
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/publicar-requerimiento', { state: { mode: 'edit', requirement: req } })}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={async () => {
                                            const confirmDelete = window.confirm('¿Seguro que deseas eliminar este requerimiento? No se mostrará más en la plataforma, pero quedará registrado en el sistema.');
                                            if (!confirmDelete) return;

                                            try {
                                                const response = await fetch(`/api/requerimientos/${req.id_requerimiento}/eliminar`, {
                                                    method: 'PATCH',
                                                    headers: { 'Authorization': `Bearer ${user?.token}` }
                                                });
                                                if (response.ok) {
                                                    toast.success('Requerimiento eliminado (guardado en historial).');
                                                    setRequirements((prev) =>
                                                        prev.filter((r) => r.id_requerimiento !== req.id_requerimiento)
                                                    );
                                                } else {
                                                    const err = await response.json().catch(() => ({}));
                                                    toast.error(err.message || 'Error al eliminar requerimiento');
                                                }
                                            } catch (error) {
                                                console.error(error);
                                                toast.error('Error de conexión al eliminar requerimiento');
                                            }
                                        }}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Eliminar
                                    </Button>
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #e5e7eb' }}>
                            <Typography variant="h6" sx={{ color: '#9ca3af' }}>No has publicado requerimientos aún</Typography>
                            <Button
                                variant="contained"
                                sx={{ mt: 2, bgcolor: '#111827', textTransform: 'none' }}
                                onClick={() => navigate('/publicar-requerimiento')}
                            >
                                Publicar el primero
                            </Button>
                        </Paper>
                    )}
                    </Box>

                    {/* Candidates Dialog */}
                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            Postulantes para: {selectedReq?.titulo}
                        </DialogTitle>
                        <DialogContent dividers>
                            {loadingCandidates ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}><Typography>Cargando candidatos...</Typography></Box>
                            ) : candidates.length > 0 ? (
                                <List>
                                    {candidates.map((cand) => (
                                        <React.Fragment key={cand.id_postulacion}>
                                            <ListItem alignItems="flex-start" secondaryAction={
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    sx={{ bgcolor: '#111827', color: 'white' }}
                                                    onClick={() => handleSelectCandidate(cand)}
                                                >
                                                    Contactar
                                                </Button>
                                            }>
                                                <ListItemAvatar>
                                                    <Avatar src={cand.estudiante.foto_perfil} alt={cand.estudiante.nombre}>
                                                        {cand.estudiante.nombre[0]}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography fontWeight={600}>{cand.estudiante.nombre} {cand.estudiante.apellido}</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                                                <Typography variant="caption">{cand.estudiante.calificacion_promedio || 'N/A'}</Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                            {cand.estudiante.bio || 'Sin biografía'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography align="center" sx={{ py: 4, color: '#9ca3af' }}>No hay postulantes aún.</Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>

                </Box>
            </Box>
        </Box>
    );
};
