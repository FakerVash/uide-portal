import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Checkbox, FormControlLabel, keyframes, MenuItem } from '@mui/material';
import ButtonMui from '../components/ButtonMui.jsx';
import InputMui from '../components/InputMui.jsx';
import logo from '../styles/logo.png';

import MailIcon from '@mui/icons-material/Mail';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useApp } from '../lib/context/AppContext';
import { toast } from 'sonner';
import loginBg from '../assets/login-bg.webm';

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    role: 'cliente',
    universidad: 'Universidad Internacional del Ecuador',
    id_carrera: '',
  });
  const [carreras, setCarreras] = useState([]);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await fetch('/api/carreras');
        if (response.ok) {
          const data = await response.json();
          setCarreras(data);
        }
      } catch (error) {
        console.error('Error fetching careers:', error);
      }
    };
    fetchCarreras();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!formData.codigo) {
      toast.error('Debes ingresar el código de verificación enviado a tu correo');
      return;
    }

    // Validaci�n de correo seg�n el rol
    const isInstitucional = formData.email.toLowerCase().endsWith('@uide.edu.ec');

    if (formData.role === 'estudiante' && !isInstitucional) {
      toast.error('Los estudiantes deben usar su correo institucional @uide.edu.ec');
      return;
    }

    if (formData.role === 'cliente' && isInstitucional) {
      toast.error('Los clientes deben usar un correo personal (Gmail, Outlook, etc.)');
      return;
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email.trim().toLowerCase(),
          contrasena: formData.password,
          telefono: formData.telefono,
          rol: formData.role.toUpperCase(),
          codigo: formData.codigo.trim(),
          id_carrera: formData.role === 'estudiante' ? parseInt(formData.id_carrera) : undefined,
          university: formData.universidad
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      toast.success('¡Cuenta creada exitosamente! Por favor inicia sesión.');
      navigate('/'); // Redirigir al login
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc', fontFamily: 'system-ui', position: 'relative', overflow: 'hidden' }}>
      {/* Fondo animado decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(135, 10, 66, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%)',
          filter: 'blur(60px)',
          animation: `${float} 6s ease-in-out infinite`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.08) 0%, rgba(135, 10, 66, 0.04) 100%)',
          filter: 'blur(60px)',
          animation: `${float} 8s ease-in-out infinite`,
          zIndex: 0,
        }}
      />

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
          overflow: 'hidden',
          zIndex: 1,
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

      {/* SECCIÓN DERECHA: Formulario */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, sm: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '28rem', animation: `${fadeIn} 0.8s ease-out` }}>
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

          {/* Botón de regreso */}
          {step > 1 && (
            <Box
              component="button"
              onClick={() => navigate('/')}
              type="button"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#6b7280',
                fontWeight: 700,
                mb: 3,
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#870a42',
                  transform: 'translateX(-4px)',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: '1rem' }} />
              Volver
            </Box>
          )}

          {/* PASO 1: Selección de Tipo de Usuario */}
          {step === 1 && (
            <Box>
              <Box sx={{ mb: 5 }}>
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
                  Crear Cuenta
                </Box>
                <Box component="p" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
                  Selecciona cómo quieres usar UniServicios
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => handleRoleSelect('cliente')}
                  sx={{
                    width: '100%',
                    p: 4,
                    borderRadius: 5,
                    border: '2px solid #e5e7eb',
                    bgcolor: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#870a42',
                      bgcolor: 'rgba(135, 10, 66, 0.03)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(135, 10, 66, 0.15)',
                      '& .icon-box': {
                        transform: 'rotate(10deg) scale(1.1)',
                        bgcolor: '#870a42',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box
                      className="icon-box"
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(135, 10, 66, 0.1)',
                        color: '#870a42',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: '2rem' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        component="h3"
                        sx={{
                          fontSize: '1.4rem',
                          fontWeight: 900,
                          color: '#111827',
                          mb: 0.5,
                        }}
                      >
                        Cliente
                      </Box>
                      <Box component="p" sx={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 500, lineHeight: 1.6 }}>
                        Contrata servicios de estudiantes universitarios para tus proyectos
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={() => handleRoleSelect('estudiante')}
                  sx={{
                    width: '100%',
                    p: 4,
                    borderRadius: 5,
                    border: '2px solid #e5e7eb',
                    bgcolor: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#870a42',
                      bgcolor: 'rgba(135, 10, 66, 0.03)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(135, 10, 66, 0.15)',
                      '& .icon-box': {
                        transform: 'rotate(10deg) scale(1.1)',
                        bgcolor: '#870a42',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box
                      className="icon-box"
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: 'rgba(135, 10, 66, 0.1)',
                        color: '#870a42',
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: '2rem' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        component="h3"
                        sx={{
                          fontSize: '1.4rem',
                          fontWeight: 900,
                          color: '#111827',
                          mb: 0.5,
                        }}
                      >
                        Estudiante
                      </Box>
                      <Box component="p" sx={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 500, lineHeight: 1.6 }}>
                        Ofrece tus servicios a la comunidad universitaria y gana experiencia
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 6, pt: 4, borderTop: '2px solid #f3f4f6', textAlign: 'center' }}>
                <Box component="p" sx={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 500 }}>
                  ¿Ya tienes cuenta?{' '}
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate('/')}
                    sx={{
                      fontWeight: 900,
                      color: '#870a42',
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#a21654',
                      },
                    }}
                  >
                    Inicia sesión
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* PASO 2: Formulario de Registro */}
          {step === 2 && (
            <Box>
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
                  Crear Cuenta
                </Box>
                <Box component="p" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '1.125rem' }}>
                  Completa tus datos para comenzar
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InputMui
                      type="text"
                      label="Nombre"
                      name="nombre"
                      placeholder="Usurario"
                      value={formData.nombre}
                      onChange={handleChange}
                      startIcon={<PersonIcon />}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InputMui
                      type="text"
                      label="Apellido"
                      name="apellido"
                      placeholder="Apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      startIcon={<PersonIcon />}
                      required
                    />
                  </Grid>
                </Grid>

                <InputMui
                  type="email"
                  label="Correo Electrónico"
                  name="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  startIcon={<MailIcon />}
                  required
                />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
                  <Box sx={{ flex: { xs: '1', sm: '3' } }}>
                    <InputMui
                      type="text"
                      label="Código de Verificación"
                      name="codigo"
                      placeholder="123456"
                      value={formData.codigo || ''}
                      onChange={handleChange}
                      startIcon={<LockIcon />}
                      required
                    />
                  </Box>
                  <ButtonMui
                    name="Enviar"
                    type="button"
                    fullWidth={false}
                    onClick={async () => {
                      if (!formData.email) return toast.error('Ingresa tu correo primero');
                      try {
                        const res = await fetch('/api/auth/request-code', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
                        });
                        const data = await res.json();
                        if (res.ok) toast.success(data.message);
                        else toast.error(data.message);
                      } catch (e) { toast.error('Error al enviar código'); }
                    }}
                    sx={{
                      mt: { xs: 0, sm: 3.5 },
                      px: 2.5,
                      py: 1.5,
                      fontSize: '0.875rem',
                      minWidth: 'auto',
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(107, 114, 128, 0.3)',
                      },
                    }}
                  />
                </Box>

                <InputMui
                  type="tel"
                  label="Teléfono"
                  name="telefono"
                  placeholder="+593 123 456 7890"
                  value={formData.telefono}
                  onChange={handleChange}
                  startIcon={<PhoneIcon />}
                  required
                />

                {formData.role === 'estudiante' && (
                  <>
                    <InputMui
                      type="text"
                      label="Universidad"
                      name="universidad"
                      placeholder=""
                      value={formData.universidad}
                      onChange={handleChange}
                      disabled
                      inputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#111827',
                          color: '#111827',
                        },
                        '& .MuiOutlinedInput-root.Mui-disabled': {
                          backgroundColor: '#f8fafc',
                        }
                      }}
                      startIcon={<BusinessIcon />}
                      required
                    />

                    <InputMui
                      select
                      label="Carrera"
                      name="id_carrera"
                      value={formData.id_carrera}
                      onChange={handleChange}
                      startIcon={<SchoolIcon />}
                      required
                    >
                      {carreras.map((carrera) => (
                        <MenuItem key={carrera.id_carrera} value={carrera.id_carrera}>
                          {carrera.nombre_carrera}
                        </MenuItem>
                      ))}
                    </InputMui>
                  </>
                )}

                <InputMui
                  type="password"
                  label="Contraseña"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  startIcon={<LockIcon />}
                  required
                />

                <InputMui
                  type="password"
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  startIcon={<LockIcon />}
                  required
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 3,
                    bgcolor: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    borderRadius: 4,
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <FormControlLabel
                    required
                    control={
                      <Checkbox
                        sx={{
                          color: '#870a42',
                          '&.Mui-checked': {
                            color: '#870a42',
                          },
                        }}
                      />
                    }
                    label={
                      <Box component="span" sx={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: 500 }}>
                        Acepto los{' '}
                        <Box component="span" sx={{ color: '#870a42', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { textDecoration: 'underline', color: '#a21654' } }}>
                          términos y condiciones
                        </Box>{' '}
                        y la{' '}
                        <Box component="span" sx={{ color: '#870a42', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { textDecoration: 'underline', color: '#a21654' } }}>
                          política de privacidad
                        </Box>
                      </Box>
                    }
                  />
                </Box>

                <ButtonMui
                  name="Crear Cuenta"
                  backgroundColor="#870a42"
                  type="submit"
                  sx={{
                    py: 2.5,
                    fontSize: '1.125rem',
                    fontWeight: 900,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #870a42 0%, #a21654 50%, #c91f67 100%)',
                    backgroundSize: '200% 200%',
                    boxShadow: '0 20px 40px -10px rgba(135, 10, 66, 0.4)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 24px 48px -12px rgba(135, 10, 66, 0.5)',
                      animation: `${gradientMove} 3s ease infinite`,
                    },
                    '&:active': {
                      transform: 'scale(0.98) translateY(-1px)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Box component="p" sx={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 500 }}>
                  ¿Ya tienes cuenta?{' '}
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate('/')}
                    sx={{
                      fontWeight: 900,
                      color: '#870a42',
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#a21654',
                      },
                    }}
                  >
                    Inicia sesión
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
