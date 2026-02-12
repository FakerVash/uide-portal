import { createTheme } from '@mui/material/styles';

// Custom theme preserving the current design aesthetic
export const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#870a42', // Brand color
            light: '#a02d5e',
            dark: '#5e0730',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#047857', // Verde (Estudiante)
            light: '#059669',
            dark: '#065f46',
            contrastText: '#ffffff',
        },
        info: {
            main: '#0369a1', // Azul (Cliente)
            light: '#0284c7',
            dark: '#075985',
            contrastText: '#ffffff',
        },
        error: {
            main: '#dc2626',
            light: '#ef4444',
            dark: '#991b1b',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fafc',
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',
        },
        text: {
            primary: mode === 'dark' ? '#f8fafc' : '#111827', // gray-50
            secondary: mode === 'dark' ? '#94a3b8' : '#6b7280', // gray-400
        },
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 900,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontSize: '1.875rem',
            fontWeight: 900,
            letterSpacing: '-0.025em',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 700,
        },
        h4: {
            fontSize: '1.125rem',
            fontWeight: 700,
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        button: {
            fontWeight: 700,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12, // Rounded-xl equivalent
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 700,
                    padding: '12px 32px',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'scale(1.02)',
                    },
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                },
                sizeLarge: {
                    padding: '16px 40px',
                    fontSize: '1.125rem',
                },
                sizeSmall: {
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                        '& fieldset': {
                            borderColor: mode === 'dark' ? '#334155' : '#f3f4f6',
                            borderWidth: 2,
                        },
                        '&:hover fieldset': {
                            borderColor: mode === 'dark' ? '#475569' : '#e5e7eb',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#870a42',
                            borderWidth: 2,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: mode === 'dark' ? '#94a3b8' : '#374151',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#870a42',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.2s',
                    backgroundImage: 'none',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 900,
                    fontSize: '0.625rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderRadius: 9999,
                },
            },
        },
    },
});

export default getTheme;
