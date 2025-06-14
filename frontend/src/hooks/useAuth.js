import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, setToken, logout, isAuthenticated } = useAuthStore();

  const login = useCallback(async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  }, [navigate, setToken, setUser]);

  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrarse',
      };
    }
  }, [navigate, setToken, setUser]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return {
    login,
    register,
    logout: handleLogout,
    isAuthenticated,
  };
}; 