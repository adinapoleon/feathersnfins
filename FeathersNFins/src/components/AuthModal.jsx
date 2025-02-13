import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleAuthService } from '../services/googleAuth';
import googleIcon from '../assets/google-icon.svg';

const AuthModal = ({ isOpen, onClose, onLoginSuccess, userType = 'employee' }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const location = useLocation();
  
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
        // Save current location before redirecting
        localStorage.setItem('preAuthLocation', location.pathname);
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
          <h2 className="modal-title">
            {userType === 'employee' ? 'Employee Login' : 'Customer Login'}
          </h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
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
              <label htmlFor="password">Password</label>
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
              {isSubmitting ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
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
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
};

export default AuthModal;