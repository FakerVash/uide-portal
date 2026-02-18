import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, TextField, Typography, Button, MenuItem, FormControl, InputLabel, Select, CircularProgress } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';

export const CreateRequirement = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const editMode = location.state?.mode === 'edit';
    const requirementToEdit = location.state?.requirement || null;
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        id_carrera: '',
        presupuesto: ''
    });

    useEffect(() => {
        fetchCarreras();
    }, []);

    // Prefill cuando venimos desde "Editar" en Mis Requerimientos
    useEffect(() => {
        if (editMode && requirementToEdit) {
            setFormData({
                titulo: requirementToEdit.titulo || '',
                descripcion: requirementToEdit.descripcion || '',
                id_carrera: requirementToEdit.id_carrera?.toString() || '',
                presupuesto: requirementToEdit.presupuesto ? String(requirementToEdit.presupuesto) : ''
            });
        }
    }, [editMode, requirementToEdit]);

    const fetchCarreras = async () => {
        try {
            const response = await fetch('/api/carreras');
            if (response.ok) {
                const data = await response.json();
                setCarreras(data);
            }
        } catch (error) {
            console.error('Error fetching carreras:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            id_carrera: parseInt(formData.id_carrera),
            presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : null
        };

        try {
            const url = editMode && requirementToEdit
                ? `/api/requerimientos/${requirementToEdit.id_requerimiento}`
                : '/api/requerimientos';

            const method = editMode ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editMode ? 'Requerimiento actualizado con éxito' : 'Requerimiento publicado con éxito');
                navigate('/mis-requerimientos');
            } else {
                const err = await response.json().catch(() => ({}));
                toast.error(err.message || (editMode ? 'Error al actualizar' : 'Error al publicar'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== 'cliente' && user.role !== 'estudiante')) {
        return <Box sx={{ p: 4 }}>Acceso restringido.</Box>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 2.5 }, display: 'flex', justifyContent: 'center', minHeight: '100%', backgroundImage: (theme) => theme.palette.mode === 'dark' ? 'none' : 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <Box sx={{ width: '100%', maxWidth: 800, flexShrink: 0 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: (theme) => theme.palette.text.primary, mb: 3 }}>
                            {editMode ? 'Editar Requerimiento' : 'Publicar Nuevo Requerimiento'}
                        </Typography>

                        <Paper
                            component="form"
                            onSubmit={handleSubmit}
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                bgcolor: (theme) => theme.palette.background.paper,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Título del Requerimiento"
                                placeholder="Ej: Necesito ayuda con diseño de logo"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                required
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Carrera Relacionada</InputLabel>
                                <Select
                                    value={formData.id_carrera}
                                    label="Carrera Relacionada"
                                    onChange={(e) => setFormData({ ...formData, id_carrera: e.target.value })}
                                    required
                                    sx={{ borderRadius: 2 }}
                                >
                                    {carreras.map((carrera) => (
                                        <MenuItem key={carrera.id_carrera} value={carrera.id_carrera}>
                                            {carrera.nombre_carrera}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label="Descripción Detallada"
                                placeholder="Describe lo que necesitas con el mayor detalle posible..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                required
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Presupuesto Estimado (Opcional)"
                                placeholder="Ej: 50.00"
                                type="number"
                                value={formData.presupuesto}
                                onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                                    sx: { borderRadius: 2 }
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        borderColor: (theme) => theme.palette.divider,
                                        color: (theme) => theme.palette.text.primary,
                                        '&:hover': {
                                            borderColor: (theme) => theme.palette.text.primary,
                                            bgcolor: (theme) => theme.palette.action.hover
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.main : '#111827',
                                        color: 'white',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1,
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#374151'
                                        }
                                    }}
                                >
                                    {loading
                                        ? <CircularProgress size={24} color="inherit" />
                                        : editMode
                                            ? 'Guardar Cambios'
                                            : 'Publicar Requerimiento'}
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
