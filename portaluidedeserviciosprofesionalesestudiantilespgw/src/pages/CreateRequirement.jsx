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

    if (!user || user.role !== 'cliente') {
        return <Box sx={{ p: 4 }}>Acceso restringido a clientes.</Box>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '240px' } }}>
                <Header />
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 2.5 }, display: 'flex', justifyContent: 'center', minHeight: '100%', backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.9), rgba(249, 250, 251, 0.9)), url(/uide-watermark.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <Box sx={{ width: '100%', maxWidth: 1280, flexShrink: 0 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1.5 }}>
                        {editMode ? 'Editar Requerimiento' : 'Publicar Nuevo Requerimiento'}
                    </Typography>

                    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                        <TextField
                            fullWidth
                            label="Título del Requerimiento"
                            placeholder="Ej: Necesito ayuda con diseño de logo"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            sx={{ mb: 1.5 }}
                            required
                        />

                        <FormControl fullWidth sx={{ mb: 1.5 }}>
                            <InputLabel>Carrera Relacionada</InputLabel>
                            <Select
                                value={formData.id_carrera}
                                label="Carrera Relacionada"
                                onChange={(e) => setFormData({ ...formData, id_carrera: e.target.value })}
                                required
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
                            rows={4}
                            label="Descripción Detallada"
                            placeholder="Describe lo que necesitas..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            sx={{ mb: 1.5 }}
                            required
                        />



                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(-1)}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    bgcolor: '#111827',
                                    color: 'white',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 4,
                                    '&:hover': { bgcolor: '#374151' }
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
