import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Container, Grid, Paper, Typography, Chip, Card, CardContent, CardMedia, CardActions, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Rating } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import StarIcon from '@mui/icons-material/Star';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import { IconButton } from '@mui/material';

export const MyServices = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // CRM State
    const [crmDialogOpen, setCrmDialogOpen] = useState(false);
    const [selectedServiceForCrm, setSelectedServiceForCrm] = useState(null);
    const [servicePedidos, setServicePedidos] = useState([]);
    const [loadingCrm, setLoadingCrm] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/servicios');
                if (response.ok) {
                    const data = await response.json();
                    const mappedServices = data.map(s => ({
                        id: s.id_servicio,
                        providerId: s.id_usuario,
                        title: s.titulo,
                        description: s.descripcion,
                        price: s.precio,
                        image: s.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000',
                        category: s.categoria?.nombre_categoria || 'Sin categoría',
                        providerName: s.usuario ? `${s.usuario.nombre} ${s.usuario.apellido}` : 'Usuario',
                        rating: s.calificacion_promedio ?? null,
                        reviews: s._count?.resenas ?? 0
                    }));
                    setServices(mappedServices);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                toast.error('Error al cargar tus servicios');
            }
        };

        if (user) {
            fetchServices();
        }
    }, [user]);

    const handleOpenCrm = async (service) => {
        setSelectedServiceForCrm(service);
        setCrmDialogOpen(true);
        setLoadingCrm(true);

        try {
            // Fetch ALL active orders (pedidos) and filter by this service
            // Ideally we should have an endpoint /api/pedidos/servicio/:id, 
            // but reusing /api/pedidos is quicker for now if the list isn't huge.
            const response = await fetch('/api/pedidos', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (response.ok) {
                const allPedidos = await response.json();
                // Filter: Only for this service, AND active status (or completed to show history)
                const filtered = allPedidos.filter(p =>
                    p.id_servicio === service.id &&
                    p.estado !== 'CANCELADO' &&
                    !p.archivado
                );
                setServicePedidos(filtered);
            } else {
                toast.error('Error al cargar clientes');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de conexión');
        } finally {
            setLoadingCrm(false);
        }
    };

    const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                toast.success('Estado actualizado');
                // Update UI instantly
                setServicePedidos(prev => prev.map(p =>
                    p.id_pedido === pedidoId ? { ...p, estado: nuevoEstado } : p
                ));
            } else {
                toast.error('Error al actualizar estado');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de red');
        }
    };

    const handleArchive = async (pedidoId) => {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/archivar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                toast.success('Pedido archivado (oculto de la vista)');
                setServicePedidos(prev => prev.filter(p => p.id_pedido !== pedidoId));
            } else {
                toast.error(`Error al archivar (ID: ${pedidoId})`);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de red');
        }
    };

    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await fetch(`/api/servicios/${serviceToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                toast.success('Servicio eliminado exitosamente');
                setServices(services.filter(s => s.id !== serviceToDelete.id));
                setDeleteDialogOpen(false);
                setServiceToDelete(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.error || 'Error al eliminar el servicio');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Error al eliminar el servicio');
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
    };

    if (!user) return null;

    const myServices = services.filter(s => s.providerId === user.id_usuario);

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
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
                                Mis Servicios
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
                                Gestiona y monitorea tus servicios publicados
                            </Typography>
                        </Box>

                        {myServices.length > 0 ? (
                            <Grid container spacing={2}>
                                {myServices.map((service) => (
                                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                maxWidth: '100%',
                                                mx: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 4,
                                                border: '1px solid #f3f4f6',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={service.image}
                                                alt={service.title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <CardContent sx={{ flex: 1, p: 2 }}>
                                                <Chip
                                                    label={service.category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(135, 10, 66, 0.1)',
                                                        color: '#870a42',
                                                        fontWeight: 700,
                                                        fontSize: '0.625rem',
                                                        mb: 1,
                                                    }}
                                                />

                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#111827', mb: 1 }}>
                                                    {service.title}
                                                </Typography>

                                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                                    {service.description.substring(0, 100)}...
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <StarIcon sx={{ fontSize: '1rem', color: '#fbbf24' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                                        {service.rating != null ? service.rating.toFixed(1) : '—'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                                        ({service.reviews} reseñas)
                                                    </Typography>
                                                </Box>

                                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#870a42' }}>
                                                    ${service.price}
                                                </Typography>
                                            </CardContent>

                                            <CardActions sx={{ p: 1.5, pt: 0, display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => navigate(`/editar-servicio/${service.id}`)}
                                                        sx={{
                                                            bgcolor: '#870a42',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontSize: '0.75rem',
                                                            py: 0.75,
                                                            '&:hover': {
                                                                bgcolor: '#6b0835',
                                                            },
                                                        }}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => navigate(`/service/${service.id}`)}
                                                        sx={{
                                                            borderColor: '#870a42',
                                                            color: '#870a42',
                                                            fontWeight: 700,
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontSize: '0.75rem',
                                                            py: 0.75,
                                                            '&:hover': {
                                                                borderColor: '#6b0835',
                                                                bgcolor: 'rgba(135, 10, 66, 0.04)',
                                                            },
                                                        }}
                                                    >
                                                        Ver Detalles
                                                    </Button>
                                                </Box>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDeleteClick(service)}
                                                    sx={{
                                                        bgcolor: '#ef4444',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                        py: 0.75,
                                                        '&:hover': {
                                                            bgcolor: '#dc2626',
                                                        },
                                                    }}
                                                >
                                                    Eliminar
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpenCrm(service)}
                                                    sx={{
                                                        bgcolor: '#111827',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                        py: 0.75,
                                                        mt: 1,
                                                        '&:hover': {
                                                            bgcolor: '#374151',
                                                        },
                                                    }}
                                                >
                                                    Ver Clientes (CRM)
                                                </Button>

                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper
                                sx={{
                                    textAlign: 'center',
                                    py: 12,
                                    borderRadius: 6,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 96,
                                        height: 96,
                                        bgcolor: '#f9fafb',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                    }}
                                >
                                    <AddCircleIcon sx={{ fontSize: '3rem', color: '#d1d5db' }} />
                                </Box>
                                <Typography variant="h5" sx={{ color: '#374151', fontWeight: 900, mb: 1 }}>
                                    Aún no has publicado ningún servicio
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4, maxWidth: 500, mx: 'auto' }}>
                                    Crea tu primer servicio para comenzar a ofrecer tus habilidades y conectar con clientes
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleIcon />}
                                    onClick={() => navigate('/crear-servicio')}
                                    sx={{
                                        bgcolor: '#870a42',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 15px -3px rgba(135, 10, 66, 0.3)',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            bgcolor: '#6b0835',
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                >
                                    Publicar Primer Servicio
                                </Button>
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* CRM Dialog */}
            <Dialog
                open={crmDialogOpen}
                onClose={() => setCrmDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 2 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: '#111827', fontSize: '1.5rem' }}>
                    Gestión de Clientes: {selectedServiceForCrm?.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Administra el progreso de tus trabajos activos con estos clientes.
                    </DialogContentText>

                    {loadingCrm ? (
                        <Typography>Cargando información...</Typography>
                    ) : servicePedidos.length > 0 ? (
                        <Grid container spacing={2}>
                            {servicePedidos.map((pedido) => (
                                <Grid item xs={12} key={pedido.id_pedido}>
                                    <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={pedido.cliente?.foto_perfil} alt={pedido.cliente?.nombre} />
                                            <Box>
                                                <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: '1rem' }}>
                                                    {pedido.cliente?.nombre || 'Cliente'} {pedido.cliente?.apellido || ''}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                                    {pedido.cliente?.email}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Status Controls - Approval Flow */}
                                        {pedido.estado === 'COMPLETADO' ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
                                                    label="Finalizado"
                                                    sx={{
                                                        bgcolor: '#10b981',
                                                        color: 'white',
                                                        fontWeight: 900,
                                                        px: 1
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={() => handleArchive(pedido.id_pedido)}
                                                    size="small"
                                                    title="Archivar (Quitar de la lista)"
                                                    sx={{
                                                        color: '#64748b',
                                                        '&:hover': { color: '#870a42', bgcolor: 'rgba(135, 10, 66, 0.05)' }
                                                    }}
                                                >
                                                    <ArchiveIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                bgcolor: '#f1f5f9',
                                                p: 0.5,
                                                borderRadius: 99,
                                                border: '1px solid #e2e8f0',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {pedido.estado === 'PENDIENTE' ? (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(pedido.id_pedido, 'EN_PROCESO')}
                                                        fullWidth
                                                        sx={{
                                                            borderRadius: 99,
                                                            px: 4,
                                                            py: 0.5,
                                                            textTransform: 'none',
                                                            fontWeight: 900,
                                                            fontSize: '0.75rem',
                                                            bgcolor: '#870a42',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: '#6b0835' },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        Aprobar Solicitud
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(pedido.id_pedido, 'EN_PROCESO')}
                                                            sx={{
                                                                borderRadius: 99,
                                                                px: 3,
                                                                py: 0.5,
                                                                textTransform: 'none',
                                                                fontWeight: 800,
                                                                fontSize: '0.75rem',
                                                                bgcolor: pedido.estado === 'EN_PROCESO' ? '#3b82f6' : 'transparent',
                                                                color: pedido.estado === 'EN_PROCESO' ? 'white' : '#64748b',
                                                                boxShadow: pedido.estado === 'EN_PROCESO' ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                                                                '&:hover': { bgcolor: pedido.estado === 'EN_PROCESO' ? '#2563eb' : 'rgba(0,0,0,0.05)' },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            Iniciar
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(pedido.id_pedido, 'CASI_TERMINADO')}
                                                            sx={{
                                                                borderRadius: 99,
                                                                px: 3,
                                                                py: 0.5,
                                                                textTransform: 'none',
                                                                fontWeight: 800,
                                                                fontSize: '0.75rem',
                                                                bgcolor: pedido.estado === 'CASI_TERMINADO' ? '#8b5cf6' : 'transparent',
                                                                color: pedido.estado === 'CASI_TERMINADO' ? 'white' : '#64748b',
                                                                boxShadow: pedido.estado === 'CASI_TERMINADO' ? '0 2px 4px rgba(139, 92, 246, 0.3)' : 'none',
                                                                '&:hover': { bgcolor: pedido.estado === 'CASI_TERMINADO' ? '#7c3aed' : 'rgba(0,0,0,0.05)' },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            En Revisión
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(pedido.id_pedido, 'COMPLETADO')}
                                                            sx={{
                                                                borderRadius: 99,
                                                                px: 3,
                                                                py: 0.5,
                                                                textTransform: 'none',
                                                                fontWeight: 800,
                                                                fontSize: '0.75rem',
                                                                bgcolor: pedido.estado === 'COMPLETADO' ? '#10b981' : 'transparent',
                                                                color: pedido.estado === 'COMPLETADO' ? 'white' : '#64748b',
                                                                boxShadow: pedido.estado === 'COMPLETADO' ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none',
                                                                '&:hover': { bgcolor: pedido.estado === 'COMPLETADO' ? '#059669' : 'rgba(0,0,0,0.05)' },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            Finalizar
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        )}

                                        {/* Reseña del Cliente (si existe) */}
                                        {pedido.estado === 'COMPLETADO' && pedido.resena && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff7ed', borderRadius: 3, border: '1px solid #fed7aa', width: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <StarIcon sx={{ color: '#f59e0b', fontSize: '18px' }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#9a3412' }}>
                                                        CALIFICACIÓN DEL CLIENTE
                                                    </Typography>
                                                </Box>
                                                <Rating value={pedido.resena.calificacion} size="small" readOnly sx={{ mb: 1 }} />
                                                <Typography variant="body2" sx={{ color: '#7c2d12', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                    "{pedido.resena.comentario || 'Sin comentario'}"
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9fafb', borderRadius: 3 }}>
                            <Typography sx={{ color: '#9ca3af' }}>No hay pedidos activos para este servicio.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCrmDialogOpen(false)} sx={{ fontWeight: 700, color: '#6b7280' }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700, color: '#111827' }}>
                    ¿Eliminar servicio?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description" sx={{ color: '#6b7280' }}>
                        ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.title}"? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCancelDelete}
                        sx={{
                            color: '#6b7280',
                            fontWeight: 700,
                            textTransform: 'none'
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            bgcolor: '#dc2626',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: '#b91c1c'
                            }
                        }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
