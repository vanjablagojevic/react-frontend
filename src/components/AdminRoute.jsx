import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
    const token = sessionStorage.getItem('jwt');

    if (!token) return <Navigate to="/login" replace />;

    try {
        const decoded = jwtDecode(token);
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (role !== 'Admin') return <Navigate to="/dashboard" replace />;
        return children;
    } catch {
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;
