import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, Chip,
    Avatar, Grid, Divider, useTheme, alpha
} from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EventIcon from '@mui/icons-material/Event';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

export const MyOrders = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/pedidos', {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (pedidoId) => {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/archivar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            if (response.ok) {
                toast.success('Pedido archivado');
                setOrders(prev => prev.map(o => o.id_pedido === pedidoId ? { ...o, archivado: true } : o));
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || 'Error al archivar el pedido');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    const handleUnarchive = async (pedidoId) => {
        try {
            // Reusing the same logic but setting it to false on the backend if supported, 
            // or we might need another endpoint. 
            // Let's check PedidoController to see if archive(true/false) is possible. 
            // Current PedidoController implementation sets it to TRUE hardcoded.
            // I'll need to update the controller to accept a boolean.

            const response = await fetch(`/api/pedidos/${pedidoId}/archivar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archivado: false })
            });
            if (response.ok) {
                toast.success('Pedido restaurado');
                setOrders(prev => prev.map(o => o.id_pedido === pedidoId ? { ...o, archivado: false } : o));
            } else {
                toast.error('Error al restaurar el pedido');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDIENTE': return 'warning';
            case 'EN_PROCESO': return 'info';
            case 'CASI_TERMINADO': return 'secondary';
            case 'COMPLETADO': return 'success';
            case 'CANCELADO': return 'error';
            default: return 'default';
        }
    };

    const handleContactProvider = (order) => {
        const provider = order.servicio?.usuario || {};
        const phone = provider.telefono || provider.celular || provider.whatsapp;
        if (!phone) {
            toast.error('No hay número de contacto disponible');
            return;
        }
        window.open(`https://wa.me/593${phone.replace(/^0+/, '')}`, '_blank');
    };

    if (!user) return null;

    const filteredOrders = orders.filter(o =>
        o.id_cliente === user.id_usuario &&
        (showArchived ? true : !o.archivado)
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                                    <ShoppingBagIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                        Mis Pedidos
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                        Historial de servicios contratados y su estado actual
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="outlined"
                                onClick={() => setShowArchived(!showArchived)}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 3,
                                    borderColor: showArchived ? 'primary.main' : 'divider',
                                    color: showArchived ? 'primary.main' : 'text.secondary',
                                    bgcolor: showArchived ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                    fontWeight: 700
                                }}
                            >
                                {showArchived ? 'Ocultar Archivados' : 'Mostrar Archivados'}
                            </Button>
                        </Box>

                        {loading ? (
                            <Typography>Cargando pedidos...</Typography>
                        ) : filteredOrders.length > 0 ? (
                            <Grid container spacing={3}>
                                {filteredOrders.map((order) => {
                                    return (
                                        <Grid item xs={12} key={order.id_pedido}>
                                            <Paper sx={{
                                                p: 0,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: isDark ? 'background.paper' : '#fff',
                                                transition: 'box-shadow 0.3s',
                                                '&:hover': {
                                                    boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : undefined
                                                }
                                            }}>
                                                <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

                                                    {/* Imagen del Servicio (Placeholder o real) */}
                                                    <Box sx={{ width: { xs: '100%', md: 120 }, height: 120, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                                                        <img
                                                            src={order.servicio?.imagen_portada || 'https://source.unsplash.com/random?service'}
                                                            alt={order.servicio?.titulo}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                                {order.servicio?.titulo}
                                                            </Typography>
                                                            <Chip
                                                                label={order.estado.replace('_', ' ')}
                                                                color={getStatusColor(order.estado)}
                                                                size="small"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {order.servicio?.descripcion}
                                                        </Typography>

                                                        <Divider sx={{ my: 1.5 }} />

                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    Iniciado el {new Date(order.fecha_pedido).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>

                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                                ${order.monto_total}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Acciones */}
                                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, justifyContent: 'center', gap: 1, borderLeft: { md: '1px solid' }, borderColor: { md: 'divider' }, pl: { md: 3 }, minWidth: { md: 160 } }}>
                                                        <Button
                                                            variant="contained"
                                                            startIcon={<WhatsAppIcon />}
                                                            color="success"
                                                            onClick={() => handleContactProvider(order)}
                                                            sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
                                                        >
                                                            Contactar
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => navigate(`/service/${order.servicio.id_servicio}`)}
                                                            sx={{ textTransform: 'none', borderRadius: 2 }}
                                                        >
                                                            Ver Servicio
                                                        </Button>
                                                        {(order.estado === 'COMPLETADO' || order.estado === 'CANCELADO') && (
                                                            !order.archivado ? (
                                                                <Button
                                                                    variant="text"
                                                                    startIcon={<ArchiveIcon />}
                                                                    onClick={() => handleArchive(order.id_pedido)}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        borderRadius: 2,
                                                                        color: 'text.secondary',
                                                                        '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) }
                                                                    }}
                                                                >
                                                                    Archivar
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="text"
                                                                    startIcon={<UnarchiveIcon />}
                                                                    onClick={() => handleUnarchive(order.id_pedido)}
                                                                    sx={{
                                                                        textTransform: 'none',
                                                                        borderRadius: 2,
                                                                        color: 'primary.main',
                                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                                                    }}
                                                                >
                                                                    Desarchivar
                                                                </Button>
                                                            )
                                                        )}
                                                    </Box>

                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ color: 'text.secondary' }}>No has contratado ningún servicio aún.</Typography>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 2, bgcolor: isDark ? 'primary.main' : '#111827', textTransform: 'none', '&:hover': { bgcolor: isDark ? 'primary.dark' : '#374151' } }}
                                    onClick={() => navigate('/')}
                                >
                                    Explorar Servicios
                                </Button>
                            </Paper>
                        )}

                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
