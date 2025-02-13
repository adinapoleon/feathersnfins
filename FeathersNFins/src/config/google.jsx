// src/config/google.jsx
const GOOGLE_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    
    get REDIRECT_URI() {
        const isProduction = window.location.hostname === 'project-3-staticsite.onrender.com';
        return isProduction 
            ? 'https://project-3-staticsite.onrender.com/auth/google/callback'
            : `http://localhost:${window.location.port}/auth/google/callback`;
    },
    
    SCOPES: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    
    ENDPOINTS: {
        AUTH: 'https://accounts.google.com/o/oauth2/v2/auth',
        TOKEN: 'https://oauth2.googleapis.com/token',
        USER_INFO: 'https://www.googleapis.com/oauth2/v2/userinfo'
    }
};

export { GOOGLE_CONFIG };