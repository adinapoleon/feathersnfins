// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import { googleAuthService } from '../services/googleAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        return storedAuth === 'true';
    });
    
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = async (username, password) => {
        try {
            const result = await authService.login(username, password);
            if (result.success) {
                setIsAuthenticated(true);
                setUser({
                    ...result.user,
                    authType: 'credentials'
                });
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    ...result.user,
                    authType: 'credentials'
                }));
                localStorage.setItem('authType', 'credentials');
            }
            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    };

    const handleGoogleCallback = async (code) => {
        try {
            const result = await googleAuthService.handleCallback(code);
            if (result.success) {
                setIsAuthenticated(true);
                setUser({
                    ...result.user,
                    authType: 'google'
                });
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    ...result.user,
                    authType: 'google'
                }));
                localStorage.setItem('authType', 'google');

                // Get the saved location
                const savedLocation = localStorage.getItem('preAuthLocation');
                localStorage.removeItem('preAuthLocation'); // Clean up
                
                return {
                    success: true,
                    redirectTo: savedLocation || '/'
                };
            }
            return result;
        } catch (error) {
            console.error('Google auth error:', error);
            return { success: false, error: 'Google authentication failed' };
        }
    };

    const logout = () => {
        const authType = localStorage.getItem('authType');
        if (authType === 'google') {
            googleAuthService.logout();
        } else {
            authService.logout();
        }
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('authType');
        // No navigation here - let components handle navigation if needed
    };

    useEffect(() => {
        const checkAuth = () => {
            const storedAuth = localStorage.getItem('isAuthenticated');
            const storedUser = localStorage.getItem('user');
            if (storedAuth === 'true' && storedUser) {
                setIsAuthenticated(true);
                setUser(JSON.parse(storedUser));
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login,
            handleGoogleCallback,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};