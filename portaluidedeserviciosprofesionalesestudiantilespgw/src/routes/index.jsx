import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../lib/context/AppContext';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import LoadingVerification from '../pages/LoadingVerification';
import { LandingPage } from '../pages/LandingPage';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { CarreraDetails } from '../pages/CarreraDetails';
import { Carreras } from '../pages/Carreras';

import { CreateService } from '../pages/CreateService';
import { MyServices } from '../pages/MyServices';
import { JobBoard } from '../pages/JobBoard';
import { CreateRequirement } from '../pages/CreateRequirement';
import { MyRequirements } from '../pages/MyRequirements';
import { MyOrders } from '../pages/MyOrders';


import { AdminUsers } from '../pages/AdminUsers';
import { AdminServices } from '../pages/AdminServices';
import AdminCarreras from '../pages/AdminCarreras';
import { ServiceDetails } from '../pages/ServiceDetails';
import { UpdateService } from '../pages/UpdateService';

export const AppRoutes = () => {
    const { user } = useApp();

    return (
        <Routes>

            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/registro" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/verifying" element={<LoadingVerification />} />

            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/service/:id" element={<ServiceDetails />} />



            <Route
                path="/perfil"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route path="/perfil/:id" element={<Profile />} />

            <Route path="/carrera/:id" element={<CarreraDetails />} />
            <Route path="/carreras" element={<Carreras />} />






            <Route
                path="/mis-servicios"
                element={
                    <ProtectedRoute allowedRoles={['estudiante']}>
                        <MyServices />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/crear-servicio"
                element={
                    <ProtectedRoute allowedRoles={['estudiante']}>
                        <CreateService />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/editar-servicio/:id"
                element={
                    <ProtectedRoute allowedRoles={['estudiante']}>
                        <UpdateService />
                    </ProtectedRoute>
                }
            />

            {/* Requerimientos (Bolsa de Trabajo) - ESTUDIANTE */}
            <Route
                path="/bolsa-trabajo"
                element={
                    <ProtectedRoute allowedRoles={['estudiante']}>
                        <JobBoard />
                    </ProtectedRoute>
                }
            />

            {/* Requerimientos - CLIENTE */}
            <Route
                path="/publicar-requerimiento"
                element={
                    <ProtectedRoute allowedRoles={['cliente', 'estudiante']}>
                        <CreateRequirement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/mis-requerimientos"
                element={
                    <ProtectedRoute allowedRoles={['cliente', 'estudiante']}>
                        <MyRequirements />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/mis-pedidos"
                element={
                    <ProtectedRoute allowedRoles={['cliente', 'estudiante']}>
                        <MyOrders />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/admin/usuarios"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/servicios"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminServices />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/carreras"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminCarreras />
                    </ProtectedRoute>
                }
            />




            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
