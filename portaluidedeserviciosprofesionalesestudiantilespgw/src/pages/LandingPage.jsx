import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    alpha,
    keyframes
} from '@mui/material';
import { useApp } from '../lib/context/AppContext';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CreateIcon from '@mui/icons-material/Create';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupsIcon from '@mui/icons-material/Groups';
import loginBg from '../assets/login-bg.webm';

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const subtlePulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
`;

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(words, speed = 90, pause = 2000) {
    const [display, setDisplay] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = words[wordIdx];
        const timeout = setTimeout(() => {
            if (!deleting) {
                setDisplay(current.slice(0, charIdx + 1));
                if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
                else setCharIdx(c => c + 1);
            } else {
                setDisplay(current.slice(0, charIdx - 1));
                if (charIdx - 1 === 0) {
                    setDeleting(false); setCharIdx(0);
                    setWordIdx(i => (i + 1) % words.length);
                } else setCharIdx(c => c - 1);
            }
        }, deleting ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, wordIdx, words, speed, pause]);

    return display;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const typed = useTypewriter(['diseñadores', 'desarrolladores', 'analistas', 'comunicadores', 'líderes']);

    const features = [
        {
            icon: <CreateIcon sx={{ fontSize: 28 }} />,
            title: 'Publica tus servicios',
            description: 'Ofrece tus habilidades y genera experiencia profesional real mientras estudias.',
            tag: 'Para estudiantes'
        },
        {
            icon: <SearchIcon sx={{ fontSize: 28 }} />,
            title: 'Contrata talento UIDE',
            description: 'Encuentra estudiantes calificados y comprometidos para tus proyectos.',
            tag: 'Para clientes'
        },
        {
            icon: <SchoolIcon sx={{ fontSize: 28 }} />,
            title: 'Explora por carrera',
            description: 'Servicios organizados por especialización académica y área de conocimiento.',
            tag: 'Todas las facultades'
        },
        {
            icon: <GroupsIcon sx={{ fontSize: 28 }} />,
            title: 'Comunidad profesional',
            description: 'Construye tu red de contactos y accede a oportunidades desde el primer día.',
            tag: 'Red UIDE'
        },
    ];

    const steps = [
        { n: '01', icon: <EmojiObjectsIcon />, title: 'Regístrate', desc: 'Crea tu perfil en minutos, como estudiante o como cliente.' },
        { n: '02', icon: <TrendingUpIcon />, title: 'Explora o Publica', desc: 'Navega servicios disponibles o muestra tus habilidades al mundo.' },
        { n: '03', icon: <HandshakeIcon />, title: 'Conecta y Crece', desc: 'Trabaja en proyectos reales y construye tu portafolio profesional.' },
    ];



    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f4f2', color: '#1a1a1a', fontFamily: '"DM Sans", sans-serif', overflow: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
                * { box-sizing: border-box; }
                ::selection { background: #870a42; color: white; }
                ::-webkit-scrollbar { width: 6px; background: #f7f4f2; }
                ::-webkit-scrollbar-thumb { background: #c9b8b0; border-radius: 3px; }
            `}</style>

            {/* ══════════════════════════════════════════
                HERO — video background
            ══════════════════════════════════════════ */}
            <Box sx={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex', alignItems: 'center',
                overflow: 'hidden',
            }}>
                {/* ── Video background ── */}
                <Box
                    component="video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src={loginBg}
                    sx={{
                        position: 'absolute', inset: 0, zIndex: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />

                {/* ── Dark overlay so text stays readable ── */}
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.62) 0%, rgba(80,0,30,0.45) 100%)'
                }} />

                {/* ── Top color bar ── */}
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 2,
                    background: 'linear-gradient(90deg, #870a42 0%, #c9174e 60%, #e8486f 100%)'
                }} />

                {/* ── Content ── */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 14, md: 0 } }}>
                    <Box sx={{ maxWidth: 700 }}>
                        {/* Badge */}
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 1,
                            px: 2, py: 0.6, mb: 4, borderRadius: 1,
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(8px)',
                            animation: `${fadeUp} 0.6s ease both`
                        }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff7aaa', animation: `${subtlePulse} 2s ease infinite` }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Portal Estudiantil UIDE
                            </Typography>
                        </Box>

                        {/* Headline */}
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: { xs: '2.8rem', sm: '3.8rem', md: '5rem' },
                            fontWeight: 900, lineHeight: 1.05,
                            color: '#fff', mb: 1.5,
                            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                            animation: `${fadeUp} 0.7s ease 0.1s both`
                        }}>
                            Talento estudiantil
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: { xs: '2.8rem', sm: '3.8rem', md: '5rem' },
                            fontWeight: 700, fontStyle: 'italic',
                            lineHeight: 1.05, color: '#ffaac8', mb: 4,
                            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                            animation: `${fadeUp} 0.7s ease 0.15s both`
                        }}>
                            al servicio de todos.
                        </Typography>

                        {/* Subtext */}
                        <Typography sx={{
                            fontSize: { xs: '1rem', md: '1.15rem' },
                            color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 1.8,
                            maxWidth: 540,
                            animation: `${fadeUp} 0.7s ease 0.25s both`
                        }}>
                            Conectamos empresas y personas con{' '}
                            <Box component="span" sx={{ color: '#ffaac8', fontWeight: 700, minWidth: 160, display: 'inline-block' }}>
                                {typed}
                                <Box component="span" sx={{ borderRight: '2px solid #ffaac8', ml: '2px', animation: `${subtlePulse} 1s step-end infinite` }}>&nbsp;</Box>
                            </Box>
                            {' '}de la UIDE listos para trabajar en proyectos reales.
                        </Typography>

                        {/* CTAs */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', animation: `${fadeUp} 0.7s ease 0.35s both` }}>
                            <Button
                                onClick={() => navigate(user ? '/dashboard' : '/registro')}
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    px: 4, py: 1.6,
                                    fontSize: '0.95rem', fontWeight: 700,
                                    borderRadius: 1.5, textTransform: 'none',
                                    bgcolor: '#870a42', color: '#fff',
                                    boxShadow: '0 4px 24px rgba(135,10,66,0.5)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        bgcolor: '#6d0835',
                                        boxShadow: '0 6px 32px rgba(135,10,66,0.65)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {user ? 'Ir al Dashboard' : 'Comenzar gratis'}
                            </Button>
                            <Button
                                onClick={() => navigate(user ? '/perfil' : '/login')}
                                sx={{
                                    px: 4, py: 1.6,
                                    fontSize: '0.95rem', fontWeight: 600,
                                    borderRadius: 1.5, textTransform: 'none',
                                    color: '#fff',
                                    border: '1.5px solid rgba(255,255,255,0.5)',
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        border: '1.5px solid rgba(255,255,255,0.9)',
                                        bgcolor: 'rgba(255,255,255,0.16)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {user ? 'Mi Perfil' : 'Iniciar sesión'}
                            </Button>
                        </Box>
                    </Box>
                </Container>

                {/* ── Bottom fade into next section ── */}
                <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 2,
                    background: 'linear-gradient(to top, #f7f4f2, transparent)'
                }} />
            </Box>

            {/* ══════════════════════════════════════════
                FEATURES
            ══════════════════════════════════════════ */}
            <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#f7f4f2' }}>
                <Container maxWidth="lg">
                    <Box sx={{ mb: 8 }}>
                        <Typography sx={{
                            fontSize: '0.75rem', letterSpacing: '0.18em',
                            color: '#870a42', fontWeight: 700,
                            textTransform: 'uppercase', mb: 1.5
                        }}>Funcionalidades</Typography>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: { xs: '2rem', md: '2.8rem' },
                            fontWeight: 900, color: '#1a1a1a', maxWidth: 500, lineHeight: 1.15
                        }}>
                            ¿Qué puedes hacer en la plataforma?
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Box sx={{
                                    p: 3.5, height: '100%', borderRadius: 2,
                                    background: '#fff',
                                    border: '1px solid #e8e0db',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        borderColor: '#870a42',
                                        transform: 'translateY(-6px)',
                                        boxShadow: '0 12px 40px ' + alpha('#870a42', 0.1),
                                        '& .ficon': { color: '#870a42', bgcolor: alpha('#870a42', 0.08) }
                                    }
                                }}>
                                    <Typography sx={{
                                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
                                        textTransform: 'uppercase', color: '#870a42',
                                        mb: 3, opacity: 0.7
                                    }}>{f.tag}</Typography>

                                    <Box className="ficon" sx={{
                                        width: 52, height: 52, borderRadius: 2,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: '#f7f4f2', color: '#555',
                                        mb: 2.5, transition: 'all 0.3s ease'
                                    }}>
                                        {f.icon}
                                    </Box>

                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 1.5, color: '#1a1a1a' }}>
                                        {f.title}
                                    </Typography>
                                    <Typography sx={{ color: '#6b6b6b', fontSize: '0.875rem', lineHeight: 1.7 }}>
                                        {f.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ══════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════ */}
            <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#fff', borderTop: '1px solid #e8e0db', borderBottom: '1px solid #e8e0db' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography sx={{
                            fontSize: '0.75rem', letterSpacing: '0.18em',
                            color: '#870a42', fontWeight: 700,
                            textTransform: 'uppercase', mb: 1.5
                        }}>Proceso simple</Typography>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: { xs: '2rem', md: '2.8rem' },
                            fontWeight: 900, color: '#1a1a1a', lineHeight: 1.15
                        }}>
                            Tres pasos para empezar
                        </Typography>
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                        <Box sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'absolute', top: 32, left: '20%', right: '20%', height: 1,
                            borderTop: '2px dashed #e0d0cc',
                        }} />

                        <Grid container spacing={5}>
                            {steps.map((s, i) => (
                                <Grid item xs={12} md={4} key={i}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: 64, height: 64, mx: 'auto', mb: 4,
                                            borderRadius: '50%',
                                            background: i === 1
                                                ? 'linear-gradient(135deg, #870a42, #c9174e)'
                                                : '#fff',
                                            border: `2px solid ${i === 1 ? 'transparent' : '#d9ccc7'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative', zIndex: 1,
                                            boxShadow: i === 1 ? '0 8px 24px ' + alpha('#870a42', 0.3) : '0 2px 12px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { transform: 'scale(1.08)', boxShadow: '0 10px 30px ' + alpha('#870a42', 0.25) }
                                        }}>
                                            <Typography sx={{
                                                fontFamily: '"Playfair Display", serif',
                                                fontSize: '1.3rem', fontWeight: 900,
                                                color: i === 1 ? '#fff' : '#870a42'
                                            }}>{s.n}</Typography>
                                        </Box>

                                        <Box sx={{ color: '#870a42', mb: 2, '& svg': { fontSize: 28, opacity: 0.8 } }}>
                                            {s.icon}
                                        </Box>

                                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1.5, color: '#1a1a1a' }}>
                                            {s.title}
                                        </Typography>
                                        <Typography sx={{ color: '#6b6b6b', lineHeight: 1.7, maxWidth: 260, mx: 'auto', fontSize: '0.9rem' }}>
                                            {s.desc}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>

            {/* ══════════════════════════════════════════
                CTA FINAL
            ══════════════════════════════════════════ */}
            <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#f7f4f2' }}>
                <Container maxWidth="sm">
                    <Box sx={{
                        textAlign: 'center',
                        background: '#fff',
                        border: '1px solid #e8e0db',
                        borderRadius: 3, p: { xs: 5, md: 7 },
                        boxShadow: '0 8px 48px rgba(0,0,0,0.06)',
                        position: 'relative',
                        '&::before': {
                            content: '""', position: 'absolute',
                            top: 0, left: '15%', right: '15%', height: 3,
                            background: 'linear-gradient(90deg, #870a42, #c9174e)',
                            borderRadius: '0 0 4px 4px'
                        }
                    }}>
                        <HandshakeIcon sx={{ fontSize: 48, color: '#870a42', mb: 2.5, opacity: 0.85 }} />

                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: { xs: '1.8rem', md: '2.4rem' },
                            fontWeight: 900, lineHeight: 1.2, mb: 2, color: '#1a1a1a'
                        }}>
                            ¿Listo para comenzar<Box component="span" sx={{ color: '#870a42' }}>?</Box>
                        </Typography>

                        <Typography sx={{ color: '#6b6b6b', mb: 5, lineHeight: 1.8, fontSize: '0.95rem' }}>
                            Únete a la comunidad de estudiantes profesionales de la UIDE y empieza a construir tu futuro hoy mismo.
                        </Typography>

                        <Button
                            onClick={() => navigate(user ? '/dashboard' : '/registro')}
                            endIcon={<ArrowForwardIcon />}
                            fullWidth
                            sx={{
                                py: 1.8, mb: 2,
                                fontSize: '1rem', fontWeight: 700,
                                borderRadius: 1.5, textTransform: 'none',
                                bgcolor: '#870a42', color: '#fff',
                                boxShadow: '0 4px 20px ' + alpha('#870a42', 0.3),
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    bgcolor: '#6d0835',
                                    boxShadow: '0 6px 28px ' + alpha('#870a42', 0.45),
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {user ? 'Ir al Dashboard' : 'Registrarse gratis'}
                        </Button>

                        {!user && <Typography sx={{ color: '#9a9a9a', fontSize: '0.875rem' }}>
                            ¿Ya tienes cuenta?{' '}
                            <Box
                                component="span"
                                onClick={() => navigate('/login')}
                                sx={{ color: '#870a42', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Inicia sesión aquí →
                            </Box>
                        </Typography>}
                    </Box>
                </Container>
            </Box>

            {/* ══════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════ */}
            <Box sx={{ py: 4, bgcolor: '#1a1a1a', borderTop: '3px solid #870a42' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700, fontSize: '1rem', color: '#fff'
                        }}>
                            UIDE <Box component="span" sx={{ color: '#870a42' }}>Servicios</Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
                            © 2024 Universidad Internacional del Ecuador · Portal de Servicios Profesionales
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};