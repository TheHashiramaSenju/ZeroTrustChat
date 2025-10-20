import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import socketService from '../services/socketService';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        socketService.connect(token);
      } catch (error) {
        console.log('Session expired or invalid');
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Check if MFA is required
      if (data.mfaRequired) {
        return { mfaRequired: true, mfaToken: data.mfaToken };
      }
      
      // Regular login success
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        socketService.connect(data.accessToken);
        return { success: true };
      }
      
      throw new Error('No access token received');
    } catch (error) {
      // Pass the full error response to LoginPage
      throw error;
    }
  };

  const register = async (email, password) => {
    return await authService.register(email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketService.disconnect();
      localStorage.removeItem('accessToken');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-mono text-sm">
        INITIALIZING...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
