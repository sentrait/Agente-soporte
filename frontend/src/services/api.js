import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

// Crear instancia base de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        console.log('Token actual:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Headers configurados:', config.headers);
        } else {
            console.warn('No hay token disponible');
            // Si no hay token y no estamos en la ruta de login, redirigir
            if (!config.url.includes('/auth/login/')) {
                window.location.href = '/login';
            }
        }
        return config;
    },
    (error) => {
        console.error('Error en el interceptor de request:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => {
        console.log('Respuesta recibida:', response);
        return response;
    },
    (error) => {
        console.error('Error en la respuesta:', error);
        if (error.response?.status === 401) {
            // Si el token es inválido, cerrar sesión
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = (credentials) => api.post('/auth/login/', credentials);

export const sendMessage = async (message) => {
    try {
        console.log('Enviando mensaje a:', `${API_URL}/chat/`);
        console.log('Mensaje:', message);
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No hay token de autenticación');
        }
        console.log('Token usado para la petición:', token);
        const response = await api.post('/chat/', { message });
        console.log('Respuesta completa:', response);
        return response.data;
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        console.error('Detalles del error:', error.response || error);
        throw error;
    }
};

export default api; 