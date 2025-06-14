import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expiró o no es válido, redirigir al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const sendMessage = async (message) => {
  try {
    const response = await api.post('/chat/', { message });
    return response;
  } catch (error) {
    console.error('Error en la respuesta:', error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    throw error;
  }
}; 