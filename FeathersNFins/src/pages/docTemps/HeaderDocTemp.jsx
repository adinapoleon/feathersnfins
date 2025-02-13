import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Weather from '../components/Weather';
import AuthModal from '../components/AuthModal';
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';
import "./Header.css";

  /**
   * State to manage the visibility of the navigation menu.
   * @type {boolean}
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * State to manage the menu items based on user authentication and role.
   * @type {Array<{ path: string, label: string }>}
   */
  const [menuItems, setMenuItems] = useState([]);

  /**
   * State to manage the visibility of the login modal.
   * @type {boolean}
   */
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  /**
   * Auth context providing authentication status, user information, and logout functionality.
   * @typedef {Object} AuthContext
   * @property {boolean} isAuthenticated - Whether the user is authenticated.
   * @property {Object} user - The user object containing user details.
   * @property {Function} logout - Function to log the user out.
   */
  const { isAuthenticated, user, logout } = useAuth();

  /**
   * React Router hook to access the current location object (URL).
   * @type {Object}
   */
  const location = useLocation();

  /**
   * Effect hook that updates the menu items when the authentication state or user role changes.
   * It conditionally displays private routes based on the user's role and authentication status.
   */
  useEffect(() => {
    // Array of public routes accessible to all users.
    const publicRoutes = [
      { path: '/', label: 'Home' },
      { path: '/menu', label: 'Menu Board' },
      { path: '/customer', label: 'Customer' }
    ];

    if (isAuthenticated && user) {
      // Only show private routes for credentials-based authentication.
      if (user.authType === 'credentials') {
        const privateRoutes = [];

        switch (user.role.toLowerCase()) {
          case 'manager':
            privateRoutes.push(
              { path: '/manager', label: 'Manager' },
              { path: '/cashier', label: 'Cashier' },
              { path: '/kitchen', label: 'Kitchen' }
            );
            break;
          case 'cashier':
            privateRoutes.push({ path: '/cashier', label: 'Cashier' });
            break;
          case 'kitchen':
            privateRoutes.push({ path: '/kitchen', label: 'Kitchen' });
            break;
          case 'frontend lead':
          case 'frontend support':
          case 'backend lead':
          case 'backend support':
            privateRoutes.push(
              { path: '/manager', label: 'Manager' },
              { path: '/cashier', label: 'Cashier' },
              { path: '/kitchen', label: 'Kitchen' }
            );
            break;
          default:
            break;
        }

        setMenuItems([...publicRoutes, ...privateRoutes]);
      } else {
        // Google-authenticated users only see public routes.
        setMenuItems(publicRoutes);
      }
    } else {
      setMenuItems(publicRoutes);
    }
  }, [isAuthenticated, user]);

  /**
   * Callback function triggered when the user successfully logs in.
   * Closes the login modal.
   */
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  /**
   * Callback function triggered when the user logs out.
   * Logs the user out and closes the navigation menu.
   */
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

export default Header;