// src/pages/auth/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        console.log('Authorization code:', code); // Debug

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('Attempting callback...'); // Debug
        const result = await handleGoogleCallback(code);
        console.log('Callback result:', result); // Debug

        if (result.success) {
          const from = location.state?.from?.pathname || '/';
          console.log('Redirecting to:', from); // Debug
          navigate(from);
        } else {
          throw new Error(result.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Detailed callback error:', error);
        console.error('Error state:', error.message, error.stack); // Debug
        navigate('/');
      }
    };

    handleCallback();
}, [searchParams, handleGoogleCallback, navigate, location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f4f4f4'
    }}>
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2>Authenticating...</h2>
        <div style={{
          display: 'inline-block',
          width: '30px',
          height: '30px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    </div>
  );
}

export default GoogleCallback;