import api from '../lib/axios';

export const authService = {
  async register(email, password) {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async oauthCallback(accessToken) {
    const { data } = await api.post('/auth/oauth/callback', { accessToken });
    return data;
  },
};
