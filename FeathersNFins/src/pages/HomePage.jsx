import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleAuthService } from '../services/googleAuth';
import './HomePage.css';
import Weather from '../components/Weather';
import LanguageSelector from '../components/LanguageSelector';
import TranslateText from '../components/TranslateText';
import homepage3 from '../assets/image/homepage_3.jpg';
import homepage4 from '../assets/image/homepage_4.jpg';
import homepage5 from '../assets/image/homepage_5.jpg';
import googleIcon from '../assets/google-icon.svg';
import restaurant from '../assets/image/Restaurant.png';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      
      setError('');
      setIsSubmitting(true);
      
      try {
        const result = await login(username, password);
        if (result.success) {
          onClose();
          onLoginSuccess();
          setUsername('');
          setPassword('');
        } else {
          setError(result.message || 'Invalid credentials');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('An error occurred during login');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleGoogleLogin = () => {
        window.location.href = googleAuthService.getAuthUrl();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
          <h2 className="modal-title"><TranslateText>Employee Login</TranslateText></h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username"><TranslateText>Username</TranslateText></label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password"><TranslateText>Password</TranslateText></label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter your password"
              />
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              <TranslateText>{isSubmitting ? 'Logging in...' : 'Sign In'}</TranslateText>
            </button>
          </form>

          <div className="auth-divider">
            <span><TranslateText>OR</TranslateText></span>
          </div>

          <div className="google-login-container">
            <button 
              onClick={handleGoogleLogin}
              className="google-login-button"
              disabled={isSubmitting}
            >
              <img 
                src={googleIcon}
                alt="Google"
                className="google-icon"
              />
              <TranslateText>Continue with Google</TranslateText>
            </button>
          </div>
        </div>
      </div>
    );
};

const AboutSection = () => {
  return (
    <div className="about-container">
      <div className="about-image">
        <img src={restaurant} alt="Restaurant" />
      </div>
      <div className="about-text">
        <h2>
          <span><TranslateText>About</TranslateText></span>
          <br />
          <span><TranslateText>Our Restaurant</TranslateText></span>
        </h2>
        <p>
          <TranslateText>
            Nestled in the heart of Galveston, TX, Feathers N' Fins was born from a passion for blending the best of land and sea. 
            Inspired by the coastal charm of our island home, we set out to create a dining experience where fresh Gulf seafood meets farm-raised poultry, paired with locally sourced ingredients and a touch of Southern hospitality. 
            Whether you're craving a crispy golden fried catch, tender grilled chicken, or our signature fusion dishes, every plate tells a story of flavor and tradition. 
            At Feathers N' Fins, we're more than a restaurant — we're a place where friends and family gather to savor great food and make unforgettable memories.
          </TranslateText>
        </p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const { isAuthenticated, logout, user } = useAuth();

  const updateMenuItems = () => {
    const publicMenuItems = [
      { path: '/', label: 'Home' },
      { path: '/menu', label: 'Menu' },
      { path: '/customer', label: 'Customer' }
    ];
  
    if (!isAuthenticated || !user) {
      setMenuItems(publicMenuItems);
      return;
    }
  
    // Only show private routes for credentials-based authentication
    if (user.authType === 'credentials') {
      const privateMenuItems = [];
      
      switch (user.role.toLowerCase()) {
        case 'manager':
          privateMenuItems.push(
            { path: '/manager', label: 'Manager' },
            { path: '/cashier', label: 'Cashier' },
            { path: '/kitchen', label: 'Kitchen' }
          );
          break;
        case 'cashier':
          privateMenuItems.push({ path: '/cashier', label: 'Cashier' });
          break;
        case 'kitchen':
          privateMenuItems.push({ path: '/kitchen', label: 'Kitchen' });
          break;
        case 'frontend lead':
        case 'frontend support':
        case 'backend lead':
        case 'backend support':
          privateMenuItems.push(
            { path: '/manager', label: 'Manager' },
            { path: '/cashier', label: 'Cashier' },
            { path: '/kitchen', label: 'Kitchen' }
          );
          break;
        default:
          break;
      }
      
      setMenuItems([...publicMenuItems, ...privateMenuItems]);
    } else {
      // Google-authenticated users only see public routes
      setMenuItems(publicMenuItems);
    }
  };

  useEffect(() => {
    updateMenuItems();
  }, [isAuthenticated, user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleLoginSuccess = () => {
    updateMenuItems();
  };

  const images = [homepage3, homepage4, homepage5];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [images.length]);
  
  return (
    <div className="min-h-screen bg-black">
      <header className="home-header">
        <button 
          className={`hamburger-btn ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
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
                    className="nav-links"
                    onClick={() => setIsOpen(false)}
                  >
                    <TranslateText>{item.label}</TranslateText>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="nav-controls">
                <LanguageSelector />
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
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <div className="carousel-container">
        <div className="welcome-overlay">
            <h2 className="welcome-text"><TranslateText>Welcome to</TranslateText> Feathers & Fins</h2>
        </div>

        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="carousel-image"
            />
          </div>
        ))}
        
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <AboutSection />
    </div>
  );
};

export default HomePage;