import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Weather from '../components/Weather';
import AuthModal from '../components/AuthModal';
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';
import "./Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = [
      { path: '/', label: 'Home' },
      { path: '/menu', label: 'Menu Board' },
      { path: '/customer', label: 'Customer' }
    ];

    if (isAuthenticated && user) {
      // Only show private routes for credentials-based authentication
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
        // Google-authenticated users only see public routes
        setMenuItems(publicRoutes);
      }
    } else {
      setMenuItems(publicRoutes);
    }
  }, [isAuthenticated, user]);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="nav-header">
      <div className="container">
        <button 
          className={`hamburger-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <h1 className="brand-name">Feathers & Fins</h1>

        <div className="header-controls">
          <Weather />
        </div>

        <nav className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <div className="nav-menu-content">
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <TranslateText>{item.label}</TranslateText>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="user-section">
              {isAuthenticated && user && (
                <div className="user-info">
                  <span className="user-role">
                    {user.username} (<TranslateText>{user.role}</TranslateText>)
                    <TranslateText>{user.authType === 'google' && ' - Google User'}</TranslateText>
                  </span>
                </div>
              )}

              <div className="language-control">
                <LanguageSelector />
              </div>
              
              <button 
                className="login-button"
                onClick={() => {
                  if (isAuthenticated) {
                    handleLogout();
                  } else {
                    setIsLoginModalOpen(true);
                  }
                  setIsOpen(false);
                }}
              >
                <TranslateText>{isAuthenticated ? 'Logout' : 'Login'}</TranslateText>
              </button>
            </div>
          </div>
        </nav>

        <AuthModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          userType={location.pathname === '/customer' ? 'customer' : 'employee'}
        />
      </div>
    </header>
  );
};

export default Header;