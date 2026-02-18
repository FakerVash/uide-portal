import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Chip, Divider, Grid, Paper, Rating, TextField, Typography, IconButton, Modal } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';

import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ReviewsIcon from '@mui/icons-material/Reviews';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { toast } from 'sonner';

// Función para obtener características según categoría
const getServiceFeatures = (category) => {
    const features = {
        'Desarrollo Web': ['Código limpio', 'Responsive', 'SEO', 'Soporte 30 días'],
        'Diseño Gráfico': ['3 revisiones', 'Archivos AI/SVG', 'Guía de uso', 'Formatos web/print'],
        'Tutorías': ['Clases 1:1', 'Material didáctico', 'Ejercicios', 'Seguimiento'],
        'Multimedia': ['Color grading', 'Efectos', 'Música libre', 'Multi-formato'],
        'Asesorías': ['Sesiones estructuradas', 'Revisión docs', 'Feedback', 'Referencias'],
    };
    return features[category] || ['Entrega rápida', 'Revisiones', 'Comunicación directa', 'Calidad garantizada'];
};

const getExtendedDescription = (category) => {
    const descriptions = {
        'Desarrollo Web': 'Desarrollo full-stack con tecnologías modernas. Código limpio siguiendo las mejores prácticas, responsive y optimizado.',
        'Diseño Gráfico': 'Diseño profesional que captura la esencia de tu marca. Incluye archivos en formatos vectoriales y rasterizados.',
        'Tutorías': 'Sesiones personalizadas adaptadas a tu ritmo. Uso de ejemplos prácticos y ejercicios progresivos.',
        'Multimedia': 'Edición profesional con software de última generación. Incluye corrección de color y efectos visuales.',
        'Asesorías': 'Acompañamiento integral en tu proyecto. Enfoque práctico orientado a resultados.',
    };
    return descriptions[category] || 'Servicio profesional ofrecido por talento UIDE. Trabajo garantizado.';
};

const getDeliveryTime = (category) => {
    const times = {
        'Desarrollo Web': '3-5 días',
        'Diseño Gráfico': '2-3 días',
        'Tutorías': 'Inmediata',
        'Multimedia': '3-4 días',
        'Asesorías': '1-2 días',
    };
    return times[category] || '2-4 días';
};

export const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useApp();

    const [service, setService] = React.useState(null);
    const [provider, setProvider] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [activePedido, setActivePedido] = React.useState(null);
    const [ratingOpen, setRatingOpen] = React.useState(false);
    const [valCalificacion, setValCalificacion] = React.useState(5);
    const [valComentario, setValComentario] = React.useState('');
    const [submittingRating, setSubmittingRating] = React.useState(false);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const fetchService = React.useCallback(async () => {
        if (!id) return;
        try {
            const response = await fetch(`/api/servicios/${id}`);
            if (!response.ok) throw new Error('Error al cargar servicio');
            const data = await response.json();
            const mappedService = {
                id_servicio: data.id_servicio,
                id: data.id_servicio.toString(),
                title: data.titulo,
                description: data.description || data.descripcion,
                price: parseFloat(data.precio),
                image: data.imagen_portada || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
                images: data.imagenes || [],
                category: data.categoria ? data.categoria.nombre_categoria : 'General',
                rating: (data.resenas?.length > 0)
                    ? data.resenas.reduce((s, r) => s + r.calificacion, 0) / data.resenas.length
                    : (data.usuario?.calificacion_promedio ? parseFloat(data.usuario.calificacion_promedio) : null),
                reviews: data._count ? data._count.resenas : 0,
                providerId: data.usuario?.id_usuario,
                providerName: data.usuario ? `${data.usuario.nombre} ${data.usuario.apellido}` : 'Usuario',
                providerImage: data.usuario?.foto_perfil,
                deliveryTime: data.tiempo_entrega,
                resenas: data.resenas || []
            };
            const mappedProvider = {
                id: data.usuario?.id_usuario,
                name: data.usuario ? `${data.usuario.nombre} ${data.usuario.apellido}` : 'Usuario',
                email: data.usuario?.email,
                phone: data.usuario?.telefono,
                image: data.usuario?.foto_perfil,
                career: data.usuario?.carrera?.nombre_carrera || 'Estudiante UIDE',
                city: 'Quito, EC',
            };
            setService(mappedService);
            setProvider(mappedProvider);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }, [id]);

    React.useEffect(() => {
        const fetchPedidoStatus = async () => {
            try {
                const res = await fetch(`/api/pedidos/estado/${id}`, { headers: { 'Authorization': `Bearer ${user?.token}` } });
                if (res.ok) {
                    const data = await res.json();

                    // Si el pedido pasa a COMPLETADO y no tiene reseña, abrir modal automáticamente
                    if (data && data.estado === 'COMPLETADO' && !data.resena && (!activePedido || activePedido.estado !== 'COMPLETADO')) {
                        setRatingOpen(true);
                    }

                    setActivePedido(data);
                }
            } catch (e) { }
        };

        const load = async () => {
            setLoading(true);
            await fetchService();
            setLoading(false);
            if (user) fetchPedidoStatus();
        };
        if (id) load();
        const poll = setInterval(() => { if (user && id) fetchPedidoStatus(); }, 5000);
        return () => clearInterval(poll);
    }, [id, user, fetchService]);

    const handleOpenLightbox = (index) => { setCurrentImageIndex(index); setLightboxOpen(true); };
    const handleCloseLightbox = () => setLightboxOpen(false);
    const handlePrevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1));
    const handleNextImage = () => setCurrentImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1));

    const handleSubmitRating = async () => {
        try {
            setSubmittingRating(true);
            const response = await fetch('/api/resenas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                body: JSON.stringify({ id_servicio: parseInt(id), id_pedido: activePedido.id_pedido, calificacion: valCalificacion, comentario: valComentario })
            });
            if (response.ok) {
                setRatingOpen(false);
                await fetchService();
                const res = await fetch(`/api/pedidos/estado/${id}`, { headers: { 'Authorization': `Bearer ${user?.token}` } });
                if (res.ok) setActivePedido(await res.json());
                toast.success('¡Gracias por tu valoración! Tu reseña ya está publicada.');
            } else {
                toast.error('Error al enviar valoración');
            }
        } catch (e) { toast.error('Error de conexión'); } finally { setSubmittingRating(false); }
    };

    const handleContactClick = async () => {
        if (provider?.phone) {
            const toastId = toast.loading('Contactando...');
            try {
                // Crear el pedido en el backend
                const response = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                    body: JSON.stringify({ id_servicio: parseInt(id), monto_total: service.price, notas: 'Contacto vía WhatsApp' })
                });

                if (response.ok) {
                    await fetchPedidoStatus();
                    toast.success('Servicio añadido a tus pedidos', { id: toastId });
                } else {
                    // Si el pedido ya existe, el backend podría retornar el objeto pero con otro status o simplemente el objeto
                    // Si ya existe, actualizamos el estado y no mostramos error
                    const data = await response.json();
                    if (data && data.id_pedido) {
                        await fetchPedidoStatus();
                        toast.success('Continuando con tu pedido existente', { id: toastId });
                    } else {
                        console.error('Error creating order:', data);
                        toast.error('No se pudo registrar el pedido, pero abriendo chat...', { id: toastId });
                    }
                }
            } catch (e) {
                console.error(e);
                // Si falla la red, igual abrimos WhatsApp
                toast.dismiss(toastId);
            }

            // Abrir WhatsApp siempre
            const phone = provider.phone.replace(/\D/g, '');
            const fmtPhone = phone.startsWith('593') ? phone : `593${phone.startsWith('0') ? phone.substring(1) : phone}`;
            const msg = encodeURIComponent(`Hola, vi tu servicio "${service.title}" en el Portal UIDE y me interesa.`);
            window.open(`https://api.whatsapp.com/send?phone=${fmtPhone}&text=${msg}`, '_blank');
        } else {
            toast.error('Número no disponible');
        }
    };

    const features = service ? getServiceFeatures(service.category) : [];
    const extendedDescription = service ? getExtendedDescription(service.category) : '';
    const deliveryTime = service?.deliveryTime || (service ? getDeliveryTime(service.category) : '');

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: '1600px', mx: 'auto', width: '100%', minHeight: '100%', backgroundImage: (theme) => theme.palette.mode === 'dark' ? 'none' : 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><Typography>Cargando...</Typography></Box>
                    ) : service ? (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
                            {/* Columna izquierda: Contenido del servicio */}
                            <Box sx={{ flex: 3, minWidth: 0, order: 1, width: '100%' }}>
                                {/* Header Info */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Chip label={service.category} size="small" sx={{ borderRadius: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb', fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#4b5563' }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <StarIcon sx={{ fontSize: '1rem', color: service.rating > 0 ? '#fbbf24' : '#e5e7eb' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary }}>
                                                {service.rating > 0 ? service.rating.toFixed(1) : 'Nuevo'}
                                            </Typography>
                                            {service.reviews > 0 && (
                                                <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, ml: 0.5 }}>
                                                    ({service.reviews} reseñas)
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 800, color: (theme) => theme.palette.text.primary, mb: 2, letterSpacing: '-0.025em' }}>
                                        {service.title}
                                    </Typography>
                                </Box>

                                {/* Gallery / Main Image */}
                                <Box
                                    onClick={() => handleOpenLightbox(0)}
                                    sx={{
                                        width: '100%',
                                        height: { xs: '250px', sm: '350px', md: '400px' },
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        mb: { xs: 3, md: 4 },
                                        border: '1px solid #e5e7eb',
                                        position: 'relative',
                                        '&:hover': { opacity: 0.95 }
                                    }}
                                >
                                    <Box component="img" src={service.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Button
                                        variant="contained"
                                        startIcon={<ArrowForwardIosIcon />}
                                        onClick={() => {
                                            if (service && service.images && service.images.length > 0) {
                                                setCurrentImageIndex(0);
                                                setLightboxOpen(true);
                                            } else {
                                                // Si no hay imágenes adicionales, mostrar mensaje
                                                toast.info('Este servicio no tiene imágenes adicionales en la galería');
                                            }
                                        }}
                                        sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: (theme) => theme.palette.background.paper, color: (theme) => theme.palette.text.primary, '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}
                                    >
                                        Ver Galería
                                    </Button>
                                </Box>

                                {/* Panel: Precio, Estado, Botones, Contacto - Visible en móvil/tablet (después de imagen) */}
                                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, overflow: 'hidden', bgcolor: (theme) => theme.palette.background.paper }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #f3f4f6' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6b7280' }}>Precio Total</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669' }}>${service.price}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#4b5563' }}>
                                            <AccessTimeIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                                            <Typography variant="body2">Entrega estimada: {deliveryTime}</Typography>
                                        </Box>
                                        {activePedido && (
                                            <Chip label={`Estado: ${activePedido.estado}`} size="medium" sx={{ width: '100%', mb: 2, py: 1.5, fontWeight: 700, borderRadius: 2, bgcolor: activePedido.estado === 'COMPLETADO' ? (theme) => theme.palette.success.light : (theme) => theme.palette.warning.light, color: activePedido.estado === 'COMPLETADO' ? (theme) => theme.palette.success.dark : (theme) => theme.palette.warning.dark, borderColor: 'transparent' }} />
                                        )}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                                            {user && service.providerId === user.id_usuario ? (
                                                <Box sx={{ textAlign: 'center', py: 2, px: 3, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                                                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Este es tu propio servicio
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                                        No puedes contratarte a ti mismo
                                                    </Typography>
                                                </Box>
                                            ) : user && user.role === 'admin' ? (
                                                <Box sx={{ textAlign: 'center', py: 2, px: 3, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                                                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Vista de Administrador
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                                        Los administradores no pueden realizar contrataciones
                                                    </Typography>
                                                </Box>
                                            ) : activePedido ? (
                                                <>
                                                    {activePedido.estado === 'COMPLETADO' && (
                                                        <Button fullWidth variant="contained" onClick={handleContactClick} sx={{ bgcolor: (theme) => theme.palette.text.primary, color: (theme) => theme.palette.background.paper, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}>Volver a Contratar</Button>
                                                    )}
                                                    {activePedido.estado === 'COMPLETADO' && !activePedido.resena && (
                                                        <Button fullWidth variant="outlined" onClick={() => setRatingOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: (theme) => theme.palette.warning.main, color: (theme) => theme.palette.warning.dark }}>Dejar reseña</Button>
                                                    )}
                                                    <Button fullWidth variant="contained" startIcon={<WhatsAppIcon />} onClick={() => { const phone = provider.phone.replace(/\D/g, ''); const fmtPhone = phone.startsWith('593') ? phone : `593${phone.startsWith('0') ? phone.substring(1) : phone}`; window.open(`https://api.whatsapp.com/send?phone=${fmtPhone}&text=${encodeURIComponent(`Hola, tengo una consulta sobre mi pedido del servicio "${service.title}".`)}`, '_blank'); }} sx={{ bgcolor: '#25D366', color: 'white', py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#128C7E' } }}>Continuar Chat</Button>
                                                </>
                                            ) : (
                                                <Button fullWidth variant="contained" onClick={handleContactClick} startIcon={<WhatsAppIcon />} sx={{ bgcolor: (theme) => theme.palette.text.primary, color: (theme) => theme.palette.background.paper, py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: (theme) => theme.palette.action.hover } }}>Contactar y Contratar</Button>
                                            )}
                                        </Box>
                                        <Box sx={{ pt: 2, borderTop: '1px solid #f3f4f6' }}>
                                            <Typography variant="overline" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.disabled, fontSize: '0.7rem' }}>Acerca del Estudiante</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, mb: 1.5 }}>
                                                <Avatar src={provider.image} sx={{ width: 40, height: 40 }} />
                                                <Box><Typography variant="subtitle2" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary }}>{provider.name}</Typography><Typography variant="caption" sx={{ color: (theme) => theme.palette.text.secondary }}>{provider.career}</Typography></Box>
                                            </Box>
                                            <Button fullWidth variant="outlined" size="small" onClick={() => navigate(`/perfil/${provider.id}`)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: (theme) => theme.palette.divider, color: (theme) => theme.palette.text.primary, '&:hover': { borderColor: (theme) => theme.palette.text.secondary, bgcolor: (theme) => theme.palette.action.hover } }}>Ver Perfil Completo</Button>
                                        </Box>
                                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: (theme) => theme.palette.text.disabled }}>Garantía de satisfacción UIDE</Typography>
                                    </Paper>
                                </Box>

                                {/* About Service */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 4, width: '100%', maxWidth: 'none', bgcolor: (theme) => theme.palette.background.paper }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: (theme) => theme.palette.text.primary }}>Acerca del servicio</Typography>
                                    <Typography paragraph sx={{ color: (theme) => theme.palette.text.secondary, lineHeight: 1.7 }}>
                                        {service.description || extendedDescription}
                                    </Typography>


                                </Paper>

                                {/* Reseñas */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, width: '100%', maxWidth: 'none', bgcolor: (theme) => theme.palette.background.paper }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary }}>Reseñas</Typography>
                                        {service.reviews > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <StarIcon sx={{ color: '#fbbf24' }} />
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{service.rating.toFixed(1)}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />

                                    {service.resenas && service.resenas.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {service.resenas.map((r, i) => (
                                                <Box key={i}>
                                                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                        <Avatar src={r.usuario?.foto_perfil} sx={{ width: 40, height: 40 }} />
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{[r.usuario?.nombre, r.usuario?.apellido].filter(Boolean).join(' ') || 'Usuario'}</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Rating value={r.calificacion} size="small" readOnly />
                                                                <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.disabled }}>{new Date(r.fecha_resena).toLocaleDateString()}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, pl: 7 }}>"{r.comentario}"</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography color="text.secondary" align="center">Aún no hay reseñas.</Typography>
                                    )}
                                </Paper>
                            </Box>

                            {/* Columna derecha: Panel SIEMPRE en el mismo lugar - Precio, Estado, Botones, Contacto */}
                            <Box sx={{ flex: 1, maxWidth: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        position: 'sticky',
                                        top: 24,
                                        p: 0,
                                        borderRadius: 3,
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                        overflow: 'hidden',
                                        bgcolor: (theme) => theme.palette.background.paper,
                                    }}
                                >
                                    {/* Sección 1: Precio y Entrega */}
                                    <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.secondary }}>Precio Total</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: (theme) => theme.palette.success.main }}>${service.price}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: (theme) => theme.palette.text.secondary }}>
                                            <AccessTimeIcon fontSize="small" sx={{ color: (theme) => theme.palette.text.disabled }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Entrega estimada: {deliveryTime}</Typography>
                                        </Box>
                                    </Box>

                                    {/* Sección 2: Estado y Acciones */}
                                    <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        {activePedido && (
                                            <Chip
                                                label={`Estado: ${activePedido.estado}`}
                                                size="medium"
                                                sx={{
                                                    width: '100%',
                                                    mb: 2,
                                                    py: 1.5,
                                                    fontWeight: 700,
                                                    borderRadius: 2,
                                                    bgcolor: activePedido.estado === 'COMPLETADO' ? (theme) => theme.palette.success.light : activePedido.estado === 'PENDIENTE' ? (theme) => theme.palette.warning.light : (theme) => theme.palette.info.light,
                                                    color: activePedido.estado === 'COMPLETADO' ? (theme) => theme.palette.success.dark : activePedido.estado === 'PENDIENTE' ? (theme) => theme.palette.warning.dark : (theme) => theme.palette.info.dark,
                                                    borderColor: 'transparent',
                                                }}
                                            />
                                        )}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {user && service.providerId === user.id_usuario ? (
                                                <Box sx={{ textAlign: 'center', py: 2, px: 3, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                                                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Este es tu propio servicio
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                                        No puedes contratarte a ti mismo
                                                    </Typography>
                                                </Box>
                                            ) : user && user.role === 'admin' ? (
                                                <Box sx={{ textAlign: 'center', py: 2, px: 3, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                                                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Vista de Administrador
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                                        Los administradores no pueden realizar contrataciones
                                                    </Typography>
                                                </Box>
                                            ) : activePedido ? (
                                                <>
                                                    {activePedido.estado === 'COMPLETADO' && (
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            onClick={handleContactClick}
                                                            sx={{
                                                                bgcolor: (theme) => theme.palette.text.primary,
                                                                color: (theme) => theme.palette.background.paper,
                                                                py: 1.5,
                                                                fontWeight: 600,
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                '&:hover': { bgcolor: (theme) => theme.palette.action.hover }
                                                            }}
                                                        >
                                                            Volver a Contratar
                                                        </Button>
                                                    )}
                                                    {activePedido.estado === 'COMPLETADO' && !activePedido.resena && (
                                                        <Button fullWidth variant="outlined" onClick={() => setRatingOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: (theme) => theme.palette.warning.main, color: (theme) => theme.palette.warning.dark }}>
                                                            Dejar reseña
                                                        </Button>
                                                    )}
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        startIcon={<WhatsAppIcon />}
                                                        onClick={() => {
                                                            const phone = provider.phone.replace(/\D/g, '');
                                                            const fmtPhone = phone.startsWith('593') ? phone : `593${phone.startsWith('0') ? phone.substring(1) : phone}`;
                                                            const msg = encodeURIComponent(`Hola, tengo una consulta sobre mi pedido del servicio "${service.title}".`);
                                                            window.open(`https://api.whatsapp.com/send?phone=${fmtPhone}&text=${msg}`, '_blank');
                                                        }}
                                                        sx={{ bgcolor: '#25D366', color: 'white', py: 1.5, fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#128C7E' } }}
                                                    >
                                                        Continuar Chat
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={handleContactClick}
                                                    startIcon={<WhatsAppIcon />}
                                                    sx={{
                                                        bgcolor: (theme) => theme.palette.text.primary,
                                                        color: (theme) => theme.palette.background.paper,
                                                        py: 1.5,
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: (theme) => theme.palette.action.hover }
                                                    }}
                                                >
                                                    Contactar y Contratar
                                                </Button>
                                            )}
                                        </Box>
                                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: (theme) => theme.palette.text.disabled }}>
                                            Garantía de satisfacción UIDE
                                        </Typography>
                                    </Box>

                                    {/* Sección 3: Acerca del Estudiante (siempre en la misma posición) */}
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="overline" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.disabled, letterSpacing: 1, fontSize: '0.7rem' }}>
                                            Acerca del Estudiante
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 2 }}>
                                            <Avatar src={provider.image} sx={{ width: 48, height: 48, border: (theme) => `2px solid ${theme.palette.divider}` }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: (theme) => theme.palette.text.primary }}>{provider.name}</Typography>
                                                <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.career}</Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="medium"
                                            onClick={() => navigate(`/perfil/${provider.id}`)}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: (theme) => theme.palette.divider, color: (theme) => theme.palette.text.primary, '&:hover': { borderColor: (theme) => theme.palette.text.secondary, bgcolor: (theme) => theme.palette.action.hover } }}
                                        >
                                            Ver Perfil Completo
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    ) : (
                        <Typography>No encontrado</Typography>
                    )}
                </Box>
            </Box>

            {/* Modal: Calificar servicio (cuando el estudiante marca Finalizar, el cliente puede valorar) */}
            <Modal
                open={ratingOpen}
                onClose={() => setRatingOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
            >
                <Paper
                    sx={{
                        p: 4,
                        maxWidth: 440,
                        width: '100%',
                        borderRadius: 3,
                        outline: 'none',
                        bgcolor: (theme) => theme.palette.background.paper,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: (theme) => theme.palette.text.primary }}>¿Cómo fue tu experiencia?</Typography>
                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 3 }}>Califica el servicio que recibiste. Tu reseña será visible para otros usuarios.</Typography>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Calificación</Typography>
                        <Rating
                            value={valCalificacion}
                            onChange={(_, v) => setValCalificacion(v || 5)}
                            size="large"
                            sx={{ color: '#fbbf24' }}
                        />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Comentario (opcional)</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Cuéntanos tu experiencia..."
                            value={valComentario}
                            onChange={(e) => setValComentario(e.target.value)}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" onClick={() => setRatingOpen(false)} sx={{ flex: 1, borderRadius: 2 }}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSubmitRating} disabled={submittingRating} sx={{ flex: 1, borderRadius: 2, bgcolor: '#870a42', '&:hover': { bgcolor: '#6b0835' } }}>
                            {submittingRating ? 'Enviando...' : 'Publicar reseña'}
                        </Button>
                    </Box>
                </Paper>
            </Modal>

            {/* Lightbox Modal */}
            <Modal
                open={lightboxOpen}
                onClose={handleCloseLightbox}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.9)' }}
            >
                <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
                    <IconButton onClick={handleCloseLightbox} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>
                        <CloseIcon />
                    </IconButton>
                    {service?.images && service.images[currentImageIndex] && (
                        <Box component="img" src={service.images[currentImageIndex]} sx={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
                    )}
                    {service?.images && service.images.length > 1 && (
                        <>
                            <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 10, top: '50%', color: 'white' }}><ArrowBackIosNewIcon /></IconButton>
                            <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 10, top: '50%', color: 'white' }}><ArrowForwardIosIcon /></IconButton>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};
