import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import ButtonMui from '../components/ButtonMui.jsx';
import InputMui from '../components/InputMui.jsx';
import ModalMui from '../components/ModalMui.jsx';
import logo from '../styles/logo.png';

import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyIcon from '@mui/icons-material/Key';

import { useApp } from '../lib/context/AppContext';
import { mockUsers } from '../lib/mockData.js';
import { setDataUser, rmDataUser } from '../storages/user.model.jsx';
import loginBg from '../assets/login-bg.webm';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);

  // 2FA State
  const [step, setStep] = useState(1); // 1: Credentials, 2: Code
  const [code, setCode] = useState('');

  const [stateModal, setStateModal] = useState({
    open: false,
    title: 'Titulo Modal',
    message: 'Este es el mensaje del modal',
    status: 'info',
  });

  const handleCloseModal = () => {
    setStateModal({ ...stateModal, open: false });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStateModal({
          open: true,
          title: 'Error de autenticación',
          message: data.message || 'Credenciales inválidas',
          status: 'error',
        });
        return;
      }

      if (data.message === '2FA_REQUIRED') {
        setStep(2);
        setStateModal({
          open: true,
          title: 'Código Enviado',
          message: `Hemos enviado un código de verificación a ${data.email}. Por favor ingrésalo.`,
          status: 'info',
        });
        return;
      }

      // Should not be reached if 2FA is enforced, but keep as fallback or for future logic
      processLoginSuccess(data);

    } catch (error) {
      console.error('Login error:', error);
      setStateModal({
        open: true,
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Intente más tarde.',
        status: 'error',
      });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        setStateModal({
          open: true,
          title: 'Error de verificación',
          message: data.message || 'Código incorrecto',
          status: 'error'
        });
        return;
      }

      processLoginSuccess(data);

    } catch (error) {
      console.error('2FA Error:', error);
      setStateModal({
        open: true,
        title: 'Error',
        message: 'Error al verificar el código',
        status: 'error'
      });
    }
  };

  const processLoginSuccess = (data) => {
    // Mapear usuario del backend al frontend
    const userToSave = {
      id: data.usuario.id_usuario.toString(),
      id_usuario: data.usuario.id_usuario,
      name: data.usuario.nombre,
      email: data.usuario.email,
      role: data.usuario.rol.toLowerCase(), // Backend devuelve MAYÚSCULAS
      token: data.token, // Guardamos el token para futuras peticiones
      image: data.usuario.foto_perfil || `https://ui-avatars.com/api/?name=${data.usuario.nombre}&background=870a42&color=fff`,
      lastname: data.usuario.apellido,
      bio: data.usuario.bio,
      banner: data.usuario.banner,
      phone: data.usuario.telefono,
      university: data.usuario.university,
      career: data.usuario.career || data.usuario.carrera?.nombre_carrera // Fallback to relation if exists
    };

    setUser(userToSave);
    console.log('🚀 processLoginSuccess: Usuario guardado, navegando a /verifying', userToSave);
    // setDataUser(userToSave); // AppContext already effects this change

    // Forzar navegación real del navegador
    window.location.href = '/verifying';
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  useEffect(() => {
    // Limpiar usuario al cargar login (logout implícito)
    setUser(null);
    rmDataUser();
  }, []);

  return (
    <>
      <ModalMui
        open={stateModal.open}
        title={stateModal.title}
        message={stateModal.message}
        status={stateModal.status}
        handleClose={handleCloseModal}
      />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          bgcolor: 'white',
          fontFamily: 'system-ui',
        }}
      >
        {/* SECCIÓN IZQUIERDA: Branding */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            width: { lg: '50%' },
            position: 'relative',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { lg: 6, xl: 8 },
            color: 'white',
            bgcolor: '#870a42',
            overflow: 'hidden'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: 0.4
            }}
          >
            <source src={loginBg} type="video/webm" />
          </video>

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              zIndex: 1
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 10, maxWidth: '28rem', textAlign: 'center' }}>
            <Box
              sx={{
                mb: 3,
                display: 'inline-flex',
                p: 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 3,
                backdropFilter: 'blur(8px)',
                mx: 'auto'
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: '1.75rem', color: 'white' }} />
            </Box>
            <Box
              component="img"
              src={logo}
              alt="UIDE Servicios"
              sx={{
                width: '100%',
                maxWidth: '250px',
                height: 'auto',
                mb: 4,
                mx: 'auto',
                display: 'block'
              }}
            />
            <Box
              component="p"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.125rem',
                lineHeight: 1.7,
                fontWeight: 500,
                mb: 0
              }}
            >
              La plataforma donde el talento universitario se conecta con
              oportunidades reales.
            </Box>

            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'left' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </Box>
                Crea tu perfil profesional
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  2
                </Box>
                Publica tus habilidades
              </Box>
            </Box>
          </Box>
        </Box>


        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 4, sm: 8 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '28rem' }}>
            {/* Logo móvil */}
            <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 6 }}>
              <Box
                component="img"
                src={logo}
                alt="UIDE Servicios"
                sx={{
                  width: '100%',
                  maxWidth: '200px',
                  height: 'auto',
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box
                component="h2"
                sx={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #111827 0%, #870a42 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  letterSpacing: '-0.025em',
                }}
              >
                {step === 1 ? 'Bienvenido' : 'Verificación 2FA'}
              </Box>
              <Box
                component="p"
                sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                  fontSize: '1.125rem',
                }}
              >
                {step === 1
                  ? 'Gestiona tus servicios y conecta con nuevos clientes hoy.'
                  : `Ingresa el código enviado a ${email}`
                }
              </Box>
            </Box>

            <Box
              component="form"
              onSubmit={step === 1 ? handleLogin : handleVerifyCode}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Grid container spacing={2}>
                {step === 1 ? (
                  <>
                    <Grid item xs={12}>
                      <InputMui
                        startIcon={<PersonIcon />}
                        placeholder="nombre@universidad.edu"
                        label="Correo Institucional"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InputMui
                        endIcon={
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        }
                        placeholder="••••••••"
                        label="contraseña"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <InputMui
                      startIcon={<KeyIcon />}
                      placeholder="123456"
                      label="Código de Verificación"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      type="text"
                    />
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ cursor: 'pointer', color: '#870a42' }} onClick={() => setStep(1)}>
                        Volver a Login
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {step === 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box
                    component="button"
                    type="button"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#9ca3af',
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: '#870a42',
                      },
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Box>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ButtonMui name={step === 1 ? "Entrar al Panel" : "Verificar Código"} backgroundColor="#870a42" />
                </Grid>
              </Grid>
            </Box>

            {/* Enlace a Registro */}
            {step === 1 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Box component="p" sx={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
                  ¿No tienes cuenta?{' '}
                  <Box
                    component="button"
                    type="button"
                    onClick={handleRegister}
                    sx={{
                      fontWeight: 900,
                      color: '#870a42',
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Regístrate aquí
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};