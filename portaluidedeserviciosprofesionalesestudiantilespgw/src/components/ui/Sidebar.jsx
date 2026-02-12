import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  Home,
  Search,
  ShoppingCart,
  MessageSquare,
  User,
  PlusCircle,
  Users,
  Briefcase,
  LogOut,
  Shield,
} from 'lucide-react';
import { useApp } from '../lib/context/AppContext';

export const Sidebar = () => {
  const { user, setUser } = useApp();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
  };

  const getRoleBadge = (role) => {
    const badges = {
      cliente: { text: 'CLIENTE', variant: 'info' },
      estudiante: { text: 'ESTUDIANTE', variant: 'success' },
      admin: { text: 'ADMIN', variant: 'gradient' },
    };
    return badges[role] || badges.cliente;
  };

  const getNavItems = () => {
    const common = [
      { icon: Home, label: 'Inicio', path: '/dashboard' },
      { icon: User, label: 'Mi Perfil', path: '/perfil' },
    ];

    const clienteItems = [
      { icon: Search, label: 'Buscar Servicios', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Carrito', path: '/carrito' },
      { icon: MessageSquare, label: 'Mensajes', path: '/chat' },
    ];

    const estudianteItems = [
      { icon: Briefcase, label: 'Mis Servicios', path: '/dashboard' },
      { icon: PlusCircle, label: 'Crear Servicio', path: '/crear-servicio' },
      { icon: MessageSquare, label: 'Mensajes', path: '/chat' },
    ];

    const adminItems = [
      { icon: Users, label: 'Usuarios', path: '/admin/usuarios' },
      { icon: Briefcase, label: 'Servicios', path: '/admin/servicios' },
      { icon: Shield, label: 'Panel Admin', path: '/dashboard' },
    ];

    if (user.role === 'admin') return [...common, ...adminItems];
    if (user.role === 'estudiante') return [...common, ...estudianteItems];
    return [...common, ...clienteItems];
  };

  const navItems = getNavItems();
  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="w-60 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl mb-2">
          <span className="gradient-text">UniServicios</span>
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Portal Estudiantil de Servicios
        </p>
        <div className="mt-3">
          <Badge variant={roleBadge.variant}>{roleBadge.text}</Badge>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? 'gradient-subtle-bg text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Perfil */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={user.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
