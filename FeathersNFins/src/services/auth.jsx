// src/services/auth.jsx
import { userCredentials } from '../config/credentials';

export const authService = {
    login: async (username, password) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Find matching user from credentials.js
            const user = userCredentials.find(
                u => u.username === username && u.password === password
            );

            if (user) {
                // Give full access to all users regardless of role
                const userData = {
                    username: user.username,
                    role: user.role.toLowerCase(),
                    permissions: [
                        'manager', 
                        'cashier', 
                        'kitchen', 
                        'backend lead', 
                        'backend support', 
                        'frontend lead', 
                        'frontend support'
                    ],
                    fullAccess: true
                };

                // Store user data and auth state
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('isAuthenticated', 'true');

                console.log('Login successful:', userData);

                return {
                    success: true,
                    user: userData
                };
            }

            return {
                success: false,
                message: 'Invalid username or password'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Authentication failed'
            };
        }
    },

    logout: () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    isAuthenticated: () => {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    // All role checks return true for full access
    hasRole: () => true,
    isManager: () => true,
    isKitchen: () => true,
    isCashier: () => true,
    hasFullAccess: () => true,

    // Return all routes for every authenticated user
    getAvailableRoutes: () => {
        const user = authService.getCurrentUser();
        if (!user) return [
            { path: '/', label: 'Home' },
            { path: '/menu', label: 'Menu Board' },
            { path: '/customer', label: 'Customer' }
        ];

        // All users get access to all routes when authenticated
        return [
            { path: '/', label: 'Home' },
            { path: '/menu', label: 'Menu Board' },
            { path: '/customer', label: 'Customer' },
            { path: '/manager', label: 'Manager' },
            { path: '/cashier', label: 'Cashier' },
            { path: '/kitchen', label: 'Kitchen' }
        ];
    },

    // Helper method to get user role (keeping for info purposes)
    getUserRole: () => {
        try {
            const user = authService.getCurrentUser();
            return user?.role || null;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }
};