import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Skeleton,
  Grow,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import ButtonMui from '../components/ButtonMui.jsx';
import { toast } from 'sonner';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';

const AdminCarreras = () => {
  const theme = useTheme();
  const [carreras, setCarreras] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, title: '' });

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFacultad, setFilterFacultad] = useState('');

  const [formData, setFormData] = useState({
    id_facultad: '',
    nombre_carrera: '',
    descripcion_carrera: '',
    duracion_anios: 4,
    tipo_carrera: 'PREGRADO',
    activo: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const [carrerasRes, facultadesRes] = await Promise.all([
        fetch('/api/carreras', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/facultades', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (carrerasRes.ok && facultadesRes.ok) {
        const carrerasData = await carrerasRes.json();
        const facultadesData = await facultadesRes.json();
        setCarreras(carrerasData);
        setFacultades(facultadesData);
      } else {
        toast.error('Error al cargar datos');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCarrera(null);
    setFormData({
      id_facultad: '',
      nombre_carrera: '',
      descripcion_carrera: '',
      duracion_anios: 4,
      tipo_carrera: 'PREGRADO',
      activo: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (carrera) => {
    setEditingCarrera(carrera);
    setFormData({
      id_facultad: carrera.id_facultad.toString(),
      nombre_carrera: carrera.nombre_carrera,
      descripcion_carrera: carrera.descripcion_carrera || '',
      duracion_anios: carrera.duracion_anios || 4,
      tipo_carrera: carrera.tipo_carrera || 'PREGRADO',
      activo: carrera.activo !== false
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const url = editingCarrera
        ? `/api/carreras/${editingCarrera.id_carrera}`
        : '/api/carreras';

      const method = editingCarrera ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          id_facultad: parseInt(formData.id_facultad),
          duracion_anios: parseInt(formData.duracion_anios)
        })
      });

      if (response.ok) {
        toast.success(`Carrera ${editingCarrera ? 'actualizada' : 'creada'} exitosamente`);
        setDialogOpen(false);
        fetchData();
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving carrera:', error);
      toast.error('Error al guardar carrera');
    }
  };

  const handleDelete = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/carreras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Carrera eliminada exitosamente');
        fetchData();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting carrera:', error);
      toast.error('Error al eliminar carrera');
    } finally {
      setConfirmDialog({ open: false, id: null, title: '' });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/carreras/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Estado actualizado exitosamente');
        fetchData();
      } else {
        throw new Error('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error toggling carrera:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleImageUpload = async (id, file, tipo = 'imagen') => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const userData = JSON.parse(localStorage.getItem('app_user_data') || '{}');
      const token = userData.token;

      const response = await fetch(`/api/carreras/${id}/upload?tipo=${tipo}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        toast.success('Imagen subida exitosamente');
        fetchData();
      } else {
        throw new Error('Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen');
    }
  };

  const filteredCarreras = carreras.filter(carrera => {
    const matchesSearch = carrera.nombre_carrera.toLowerCase().includes(searchTerm.toLowerCase());
    const filterId = filterFacultad === '' ? '' : filterFacultad;
    const matchesFacultad = filterId ? carrera.id_facultad.toString() === filterId : true;
    return matchesSearch && matchesFacultad;
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
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
        <Box component="main" sx={{
          flex: 1,
          p: 4,
          overflowY: 'auto',
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
          <Container maxWidth="xl">
            {/* Header */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 2, fontSize: 40, color: (theme) => theme.palette.mode === 'dark' ? '#870a42' : theme.palette.primary.main }} />
                  Gestión de Carreras
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Administra las carreras y programas académicos
                </Typography>
              </Box>
              <ButtonMui
                text="Nueva Carrera"
                onClick={handleCreate}
                startIcon={<AddIcon />}
              />
            </Box>

            {/* Filters */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Buscar carrera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : 'action' }} />
                        </InputAdornment>
                      ),
                      sx: { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white' }
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}>Filtrar por Facultad</InputLabel>
                    <Select
                      value={filterFacultad}
                      label="Filtrar por Facultad"
                      onChange={(e) => setFilterFacultad(e.target.value)}
                      sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'inherit'
                        },
                        '& .MuiSvgIcon-root': {
                          color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : 'inherit'
                        }
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : 'inherit' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">Todas las facultades</MenuItem>
                      {facultades.map((facultad) => (
                        <MenuItem key={facultad.id_facultad} value={facultad.id_facultad.toString()}>
                          {facultad.nombre_facultad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip
                    label={`${filteredCarreras.length} Resultados`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold', width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Content */}
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} md={6} lg={4} key={item}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
              </Grid>
            ) : filteredCarreras.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron carreras
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Intenta con otros filtros o crea una nueva carrera
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredCarreras.map((carrera, index) => (
                  <Grow in={true} timeout={(index + 1) * 200} key={carrera.id_carrera}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      {/* Image/Avatar */}
                      <Avatar
                        variant="rounded"
                        src={carrera.imagen_carrera}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          mr: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main'
                        }}
                      >
                        <SchoolIcon fontSize="large" />
                      </Avatar>

                      {/* Info Section */}
                      <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="bold" noWrap sx={{ color: 'text.primary' }}>
                            {carrera.nombre_carrera}
                          </Typography>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: carrera.activo ? 'success.main' : 'error.main'
                            }}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom noWrap sx={{ color: 'text.secondary' }}>
                          {carrera.facultad?.nombre_facultad}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={carrera.tipo_carrera}
                            size="small"
                            color="success"
                            variant="filled"
                            sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark', borderRadius: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            • {carrera.duracion_anios} años
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            • {carrera._count?.usuarios || 0} estudiantes
                          </Typography>
                        </Box>
                      </Box>

                      {/* Actions Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={carrera.activo !== false}
                              onChange={() => handleToggleActive(carrera.id_carrera)}
                              color="success"
                            />
                          }
                          label={<Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Visible</Typography>}
                        />

                        <Tooltip title="Actualizar Imagen">
                          <IconButton
                            component="label"
                            size="small"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                          >
                            <ImageIcon fontSize="small" />
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleImageUpload(carrera.id_carrera, e.target.files[0])}
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => handleEdit(carrera)}
                            size="small"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => setConfirmDialog({ open: true, id: carrera.id_carrera, title: carrera.nombre_carrera })}
                            size="small"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grow>
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* Modernized Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {editingCarrera ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {editingCarrera ? 'Editar Carrera' : 'Nueva Carrera'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingCarrera ? 'Actualiza los datos de la carrera' : 'Ingresa los datos para crear una nueva carrera'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Facultad Selection & Career Name - Side by Side */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Facultad</InputLabel>
                  <Select
                    value={formData.id_facultad}
                    label="Facultad"
                    onChange={(e) => setFormData({ ...formData, id_facultad: e.target.value })}
                    startAdornment={
                      <InputAdornment position="start">
                        <SchoolIcon fontSize="small" color="action" />
                      </InputAdornment>
                    }
                  >
                    {facultades.map((facultad) => (
                      <MenuItem key={facultad.id_facultad} value={facultad.id_facultad.toString()}>
                        {facultad.nombre_facultad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre de la Carrera"
                  value={formData.nombre_carrera}
                  onChange={(e) => setFormData({ ...formData, nombre_carrera: e.target.value })}
                  required
                  variant="outlined"
                  placeholder="Ej. Ingeniería en Sistemas"
                />
              </Grid>

              {/* Description - Full Width */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={4}
                  value={formData.descripcion_carrera}
                  onChange={(e) => setFormData({ ...formData, descripcion_carrera: e.target.value })}
                  placeholder="Describe brevemente la carrera..."
                  variant="outlined"
                />
              </Grid>

              {/* Duration & Degree Type - Side by Side */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duración"
                  type="number"
                  value={formData.duracion_anios}
                  onChange={(e) => setFormData({ ...formData, duracion_anios: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Años</InputAdornment>,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Grado</InputLabel>
                  <Select
                    value={formData.tipo_carrera}
                    label="Tipo de Grado"
                    onChange={(e) => setFormData({ ...formData, tipo_carrera: e.target.value })}
                    startAdornment={
                      <InputAdornment position="start">
                        <VerifiedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="PREGRADO">Pregrado</MenuItem>
                    <MenuItem value="POSTGRADO">Postgrado</MenuItem>
                    <MenuItem value="MAESTRIA">Maestría</MenuItem>
                    <MenuItem value="DOCTORADO">Doctorado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Active Switch */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: (theme) => formData.activo ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.text.disabled, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: formData.activo ? 'success.main' : 'text.disabled'
                      }}
                    >
                      {formData.activo ? <VerifiedIcon /> : <DeleteIcon />}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Estado de la Carrera
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.activo ? 'La carrera será visible para los usuarios' : 'La carrera estará oculta'}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    color="success"
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}>
              Cancelar
            </Button>
            <ButtonMui
              name={editingCarrera ? 'Guardar Cambios' : 'Crear Carrera'}
              type="submit"
              fullWidth={false}
              sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            />
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, title: '' })}
        PaperProps={{ sx: { borderRadius: 4, minWidth: 380 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Eliminar carrera</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ¿Estás seguro de que quieres eliminar la carrera <strong>{confirmDialog.title}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDialog({ open: false, id: null, title: '' })} color="inherit" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <ButtonMui
            onClick={() => handleDelete(confirmDialog.id)}
            name="Eliminar"
            type="button"
            fullWidth={false}
            sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCarreras;
