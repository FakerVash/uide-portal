import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../lib/context/AppContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useApp();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
