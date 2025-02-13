import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userCredentials } from '../config/credentials';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Only allow access to protected routes for credentials-based users
    if (user?.authType === 'google') {
        console.log('Access denied: Google users cannot access protected routes');
        return <Navigate to="/" replace />;
    }

    // Check if the user exists in credentials
    const isValidUser = userCredentials.some(cred => cred.username === user.username);
    
    if (!isValidUser) {
        console.log(`Access denied: User ${user?.username} not in credentials list`);
        return <Navigate to="/" replace />;
    }

    return children;
};