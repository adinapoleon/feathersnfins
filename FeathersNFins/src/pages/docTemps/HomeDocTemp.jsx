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

  
  /**
   * Modal component for user login, allowing username/password authentication or Google login.
   *
   * @param {Object} props - The props for the modal.
   * @param {boolean} props.isOpen - Flag indicating if the modal is open.
   * @param {Function} props.onClose - Function to close the modal.
   * @param {Function} props.onLoginSuccess - Function to handle login success.
   * 
   * @returns {JSX.Element|null} - The rendered modal or null if the modal is closed.
   */
  const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
  
    /**
     * Handles the form submission for logging in with username and password.
     * It manages error handling and submission state.
     * 
     * @param {React.FormEvent} e - The form submit event.
     */
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

    /**
     * Initiates the Google login process by redirecting the user to the Google authentication URL.
     */
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

  /**
   * AboutSection component that displays information about the restaurant.
   *
   * @returns {JSX.Element} - The rendered about section.
   */
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

  /**
   * Updates the menu items based on the user's authentication status and role.
   * Displays different menu items for authenticated users with specific roles.
   */
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

  /**
   * Toggles the visibility of the navigation menu.
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handles the logout functionality.
   * Logs the user out and closes the navigation menu.
   */
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  /**
   * Callback function triggered when login is successful.
   * Updates the menu items to reflect the authenticated user.
   */
  const handleLoginSuccess = () => {
    updateMenuItems();
  };

  /**
   * Array of image URLs for the homepage image carousel.
   * @type {Array<string>}
   */
  const images = [homepage3, homepage4, homepage5];

  /**
   * Effect hook that controls the automatic image carousel.
   * Changes the displayed image every 5 seconds.
   */
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
  

export default HomePage;