import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDataUser, setDataUser as saveDataUser, rmDataUser } from '../../storages/user.model.jsx';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = getDataUser();
    return savedUser || null;
  });

  const [darkMode, setDarkMode] = useState(false);

  const [favorites, setFavorites] = useState([]);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      saveDataUser(user);
    } else {
      rmDataUser();
    }
  }, [user]);

  useEffect(() => {
    // Aplicar o remover clase dark del documento
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };



  const toggleFavorite = (serviceId) => {
    setFavorites((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        darkMode,
        toggleDarkMode,

        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
