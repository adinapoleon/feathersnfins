// src/services/googleAuth.jsx
import { GOOGLE_CONFIG } from '../config/google';

class GoogleAuthService {
  constructor() {
    this.clientId = GOOGLE_CONFIG.CLIENT_ID;
    this.clientSecret = GOOGLE_CONFIG.CLIENT_SECRET;
  }

  getCurrentRedirectUri() {
    return GOOGLE_CONFIG.REDIRECT_URI; // This will now dynamically get the correct URI
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getCurrentRedirectUri(),
      response_type: 'code',
      scope: GOOGLE_CONFIG.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${GOOGLE_CONFIG.ENDPOINTS.AUTH}?${params.toString()}`;
  }

  async getTokens(code) {
    try {
      const response = await fetch(GOOGLE_CONFIG.ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.getCurrentRedirectUri(), // Use dynamic redirect URI here
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to get tokens');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await fetch(GOOGLE_CONFIG.ENDPOINTS.USER_INFO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await response.json();
      return {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        role: this.mapUserRole(userData.email)
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  mapUserRole(email) {
    if (email.endsWith('@feathersnfins.com')) {
      return 'employee';
    }
    return 'customer';
  }

  async handleCallback(code) {
    try {
      const tokens = await this.getTokens(code);
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      // Store tokens
      localStorage.setItem('google_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('google_refresh_token', tokens.refresh_token);
      }

      return {
        success: true,
        user: userInfo
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  logout() {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
  }
}

export const googleAuthService = new GoogleAuthService();