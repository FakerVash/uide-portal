import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider,
    useTheme, alpha
} from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

export const MyRequirements = () => {
    const { user } = useApp();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, id: null });
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        if (user && user.role === 'cliente') {
            fetchMyRequirements();
        }
    }, [user]);

    const fetchMyRequirements = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/requerimientos?mis_requerimientos=true${showArchived ? '&ver_archivados=true' : ''}`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const mapped = data.map(r => ({
                    ...r,
                    archivado: !!r.archivado
                }));
                setRequirements(mapped);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.role === 'cliente' || user.role === 'estudiante')) {
            fetchMyRequirements();
        }
    }, [user, showArchived]);

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

    const handleContactCandidate = (candidate) => {
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
    };

    const [confirmDialog, setConfirmDialog] = useState(false);
    const [candidateToSelect, setCandidateToSelect] = useState(null);

    const handleOpenConfirm = (candidate) => {
        setCandidateToSelect(candidate);
        setConfirmDialog(true);
    };

    const handleArchiveRequirement = async (id, archivado) => {
        try {
            const response = await fetch(`/api/requerimientos/${id}/archivar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archivado })
            });

            if (response.ok) {
                toast.success(archivado ? 'Anuncio archivado correctamente' : 'Anuncio restaurado correctamente');
                fetchMyRequirements();
            } else {
                toast.error('Error al procesar la solicitud');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    const handleAcceptCandidate = async () => {
        if (!candidateToSelect) return;

        try {
            const response = await fetch(`/api/requerimientos/${selectedReq.id_requerimiento}/seleccionar/${candidateToSelect.id_postulacion}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                toast.success('Candidato seleccionado correctamente. El requerimiento ha sido cerrado.');
                setOpenDialog(false);
                setConfirmDialog(false);
                fetchMyRequirements(); // Refrescar lista
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al seleccionar candidato');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    const handleDeleteRequirement = async (id) => {
        try {
            await handleArchiveRequirement(id, true);
        } catch (error) {
            console.error(error);
        } finally {
            setConfirmDeleteDialog({ open: false, id: null });
        }
    };

    if (!user || (user.role !== 'cliente' && user.role !== 'estudiante')) {
        return <Box sx={{ p: 4 }}>Acceso restringido.</Box>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{
                    flex: 1,
                    p: { xs: 2, md: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100%',
                    backgroundImage: isDark
                        ? 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url(/uide-watermark.png)'
                        : 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                    <Box sx={{ width: '100%', maxWidth: 1280, flexShrink: 0 }}>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    Mis Anuncios
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => setShowArchived(!showArchived)}
                                    startIcon={showArchived ? <VisibilityIcon /> : <ArchiveIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        color: showArchived ? 'primary.main' : 'text.secondary',
                                        bgcolor: showArchived ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        '&:hover': {
                                            bgcolor: showArchived ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.text.secondary, 0.05)
                                        },
                                        borderRadius: 2,
                                        px: 2
                                    }}
                                >
                                    {showArchived ? 'Ocultar Archivados' : 'Mostrar Archivados'}
                                </Button>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/publicar-requerimiento')}
                                sx={{
                                    bgcolor: isDark ? '#ffffff' : '#111827',
                                    color: isDark ? '#000000' : 'white',
                                    '&:hover': { bgcolor: isDark ? '#f3f4f6' : '#374151' },
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
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        mb: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderLeft: `6px solid ${req.estado === 'ABIERTO' ? '#10b981' : isDark ? '#4b5563' : '#9ca3af'}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                        transition: 'all 0.2s',
                                        opacity: req.archivado ? 0.75 : 1,
                                        '&:hover': {
                                            boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            transform: 'translateY(-2px)',
                                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : undefined,
                                            opacity: 1
                                        }
                                    }}
                                >
                                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem' }}>{req.titulo}</Typography>
                                            <Chip
                                                label={req.estado}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontWeight: 700,
                                                    bgcolor: req.estado === 'ABIERTO'
                                                        ? (isDark ? alpha('#10b981', 0.2) : '#ecfdf5')
                                                        : (isDark ? alpha('#9ca3af', 0.1) : '#f3f4f6'),
                                                    color: req.estado === 'ABIERTO'
                                                        ? (isDark ? '#34d399' : '#059669')
                                                        : (isDark ? '#9ca3af' : '#4b5563'),
                                                    border: '1px solid',
                                                    borderColor: req.estado === 'ABIERTO'
                                                        ? (isDark ? alpha('#10b981', 0.3) : '#a7f3d0')
                                                        : (isDark ? alpha('#9ca3af', 0.2) : '#e5e7eb')
                                                }}
                                            />
                                            {req.archivado && (
                                                <Chip
                                                    label="Archivado"
                                                    size="small"
                                                    variant="outlined"
                                                    icon={<ArchiveIcon sx={{ fontSize: '14px !important' }} />}
                                                    sx={{
                                                        height: 24,
                                                        fontWeight: 700,
                                                        color: 'text.secondary',
                                                        borderColor: 'divider',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                    Publicado el {new Date(req.fecha_publicacion).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                    {req._count?.postulaciones || 0} Postulantes
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Mostrar candidato seleccionado si existe */}
                                        {req.postulaciones && req.postulaciones.length > 0 && (
                                            <Paper variant="outlined" sx={{
                                                mt: 2, p: 2,
                                                bgcolor: isDark ? alpha(theme.palette.success.main, 0.1) : '#f0fdf4',
                                                borderColor: isDark ? alpha(theme.palette.success.main, 0.3) : '#86efac',
                                                display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2
                                            }}>
                                                <Avatar
                                                    src={req.postulaciones[0].estudiante.foto_perfil}
                                                    alt={req.postulaciones[0].estudiante.nombre}
                                                    sx={{ width: 44, height: 44, border: '2px solid #fff' }}
                                                >
                                                    {req.postulaciones[0].estudiante.nombre[0]}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="caption" sx={{ color: isDark ? theme.palette.success.light : '#15803d', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                        TRABAJANDO CON
                                                    </Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? theme.palette.success.main : '#14532d' }}>
                                                        {req.postulaciones[0].estudiante.nombre} {req.postulaciones[0].estudiante.apellido}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="medium"
                                                    variant="contained"
                                                    color="success"
                                                    sx={{ textTransform: 'none', borderRadius: 5, boxShadow: 'none', fontWeight: 700, px: 2 }}
                                                    onClick={() => handleContactCandidate(req.postulaciones[0])}
                                                >
                                                    WhatsApp
                                                </Button>
                                            </Paper>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewCandidates(req)}
                                            sx={{
                                                borderRadius: 5,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                                borderColor: 'divider',
                                                '&:hover': { borderColor: isDark ? 'text.secondary' : '#9ca3af', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb' }
                                            }}
                                        >
                                            Ver Candidatos
                                        </Button>

                                        <IconButton
                                            onClick={() => navigate('/publicar-requerimiento', { state: { mode: 'edit', requirement: req } })}
                                            sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                                            title="Editar"
                                        >
                                            <EditIcon />
                                        </IconButton>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={req.archivado ? <UnarchiveIcon /> : (req.estado === 'ABIERTO' ? <ArchiveIcon /> : <DeleteIcon />)}
                                            onClick={() => req.archivado ? handleArchiveRequirement(req.id_requerimiento, false) : setConfirmDeleteDialog({ open: true, id: req.id_requerimiento })}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                px: 2,
                                                bgcolor: req.archivado
                                                    ? '#10b981' // Verde sólido
                                                    : (isDark ? '#ef4444' : 'error.main'),
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: req.archivado
                                                        ? '#059669' // Verde oscuro
                                                        : (isDark ? '#dc2626' : 'error.dark'),
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }
                                            }}
                                        >
                                            {req.archivado ? 'Restaurar' : 'Eliminar (Archivar)'}
                                        </Button>
                                    </Box>
                                </Paper>
                            ))
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ color: 'text.secondary' }}>No has publicado requerimientos aún</Typography>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 2, bgcolor: isDark ? 'primary.main' : '#111827', textTransform: 'none', '&:hover': { bgcolor: isDark ? 'primary.dark' : '#374151' } }}
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
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    width: '100%',
                                                    gap: { xs: 1, sm: 2 },
                                                    py: 2
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flex: 1, gap: 2, width: '100%', minWidth: 0 }}>
                                                    <ListItemAvatar sx={{ minWidth: 'auto', mt: 1 }}>
                                                        <Avatar src={cand.estudiante.foto_perfil} alt={cand.estudiante.nombre}>
                                                            {cand.estudiante.nombre[0]}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                <Typography fontWeight={600} variant="subtitle1">
                                                                    {cand.estudiante.nombre} {cand.estudiante.apellido}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isDark ? alpha('#f59e0b', 0.15) : '#fffbed', px: 0.5, borderRadius: 1 }}>
                                                                    <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, ml: 0.5, color: isDark ? '#f59e0b' : 'inherit' }}>{cand.estudiante.calificacion_promedio || 'New'}</Typography>
                                                                </Box>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {cand.estudiante.bio || 'Sin biografía disponible'}
                                                            </Typography>
                                                        }
                                                        sx={{ m: 0 }}
                                                    />
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    alignItems: 'center',
                                                    mt: { xs: 1, sm: 0 },
                                                    width: { xs: '100%', sm: 'auto' },
                                                    justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                                                }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => navigate(`/perfil/${cand.estudiante.id_usuario}`)}
                                                        sx={{ textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}
                                                    >
                                                        Ver Perfil
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        sx={{ color: 'white', textTransform: 'none', borderRadius: 2 }}
                                                        onClick={() => handleOpenConfirm(cand)}
                                                        disabled={selectedReq?.estado !== 'ABIERTO'}
                                                    >
                                                        Seleccionar
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{ bgcolor: isDark ? 'primary.main' : '#111827', color: 'white', textTransform: 'none', borderRadius: 2 }}
                                                        onClick={() => handleContactCandidate(cand)}
                                                    >
                                                        Contactar
                                                    </Button>
                                                </Box>
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay postulantes aún.</Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Confirmation Dialog */}
                    <Dialog
                        open={confirmDialog}
                        onClose={() => setConfirmDialog(false)}
                        PaperProps={{
                            sx: { borderRadius: 3, p: 1 }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ¿Confirmar Selección?
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <Typography>
                                    Estás a punto de seleccionar a <strong>{candidateToSelect?.estudiante.nombre} {candidateToSelect?.estudiante.apellido}</strong> para este requerimiento.
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: isDark ? 'action.hover' : '#f9fafb', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        • El requerimiento se marcará como <strong>CERRADO</strong>.<br />
                                        • Se notificará al estudiante que ha sido seleccionado.<br />
                                        • Podrás contactarlo directamente.
                                    </Typography>
                                </Paper>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => setConfirmDialog(false)} sx={{ color: '#6b7280', borderRadius: 2 }}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAcceptCandidate}
                                variant="contained"
                                color="success"
                                sx={{ color: 'white', borderRadius: 2, px: 3 }}
                            >
                                Confirmar Selección
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Confirm Delete Dialog */}
                    <Dialog
                        open={confirmDeleteDialog.open}
                        onClose={() => setConfirmDeleteDialog({ open: false, id: null })}
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                padding: 1,
                                bgcolor: isDark ? '#1e293b' : '#fff'
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 'bold' }}>¿Archivar anuncio?</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary">
                                El anuncio se ocultará de la lista pública pero podrás recuperarlo activando la opción "Mostrar Archivados".
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ pb: 2, px: 3 }}>
                            <Button
                                onClick={() => setConfirmDeleteDialog({ open: false, id: null })}
                                color="inherit"
                                sx={{ textTransform: 'none', fontWeight: 'bold' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleDeleteRequirement(confirmDeleteDialog.id)}
                                variant="contained"
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                Archivar
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Box>
            </Box>
        </Box >
    );
};
