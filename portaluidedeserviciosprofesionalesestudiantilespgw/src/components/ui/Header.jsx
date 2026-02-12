import React from 'react';
import { Search, Moon, Sun, ShoppingCart, MessageSquare } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onSearch }) => {
  const { darkMode, toggleDarkMode, user, cart } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.hours, 0);

  return (
    <header className="h-18 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Iconos de acción */}
        <div className="flex items-center gap-2">
          {/* Toggle Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mensajes (solo para Cliente y Estudiante) */}
          {user && (user.role === 'cliente' || user.role === 'estudiante') && (
            <button
              onClick={() => navigate('/chat')}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Mensajes"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Carrito (solo para Cliente) */}
          {user && user.role === 'cliente' && (
            <button
              onClick={() => navigate('/carrito')}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
