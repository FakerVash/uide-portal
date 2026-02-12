import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider, useApp } from './lib/context/AppContext';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import getTheme from './theme/muiTheme.js';

const AppContent = () => {
  const { darkMode } = useApp();

  // Memorizar el tema para evitar recreaciones innecesarias
  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}