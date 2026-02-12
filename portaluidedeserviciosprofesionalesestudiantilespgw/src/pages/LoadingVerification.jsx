import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { useApp } from '../lib/context/AppContext';
import logo from '../styles/logo.png';

const LoadingVerification = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [profileImage, setProfileImage] = useState(user?.image || null);

    // Obtener la foto de perfil real del backend
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                if (user?.token) {
                    const response = await fetch('/api/usuarios/me', {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.foto_perfil) {
                            setProfileImage(data.foto_perfil);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile image:', error);
            }
        };
        fetchProfileImage();
    }, [user?.token]);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 3500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #870a42 0%, #4a0525 100%)',
                zIndex: 9999,
            }}
        >
            {/* Contenido principal */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    textAlign: 'center',
                    px: 3,
                }}
            >
                {/* Logo UIDE */}
                <Box
                    component="img"
                    src={logo}
                    alt="UIDE Logo"
                    sx={{
                        width: { xs: 120, md: 160 },
                        height: 'auto',
                        mb: 2,
                        filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))',
                    }}
                />

                {/* Avatar del usuario con animación */}
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Anillo animado */}
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            border: '4px solid rgba(255, 255, 255, 0.3)',
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                                '0%, 100%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                },
                                '50%': {
                                    transform: 'scale(1.1)',
                                    opacity: 0.7,
                                },
                            },
                        }}
                    />

                    {/* Avatar */}
                    <Avatar
                        src={profileImage}
                        alt={user?.name || 'Usuario'}
                        sx={{
                            width: 150,
                            height: 150,
                            bgcolor: '#fff',
                            color: '#870a42',
                            fontSize: '4rem',
                            fontWeight: 900,
                            border: '6px solid white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                </Box>

                {/* Texto de verificación */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: 'white',
                            fontWeight: 900,
                            fontSize: { xs: '1.8rem', md: '2.5rem' },
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Verificando...
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { xs: '1rem', md: '1.2rem' },
                            fontWeight: 500,
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        Bienvenido, {user?.name || 'Usuario'}
                    </Typography>

                    {/* Spinner de carga */}
                    <CircularProgress
                        size={50}
                        thickness={4}
                        sx={{
                            color: 'white',
                            mt: 2,
                            filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))',
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default LoadingVerification;
