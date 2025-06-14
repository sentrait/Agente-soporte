import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = 'http://localhost:8000/api';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 segundo

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            console.log(`Enviando mensaje a: ${API_URL}/chat/ (Intento ${attempt + 1})`);
            console.log('Mensaje:', message);
            const token = useAuthStore.getState().token;
            if (!token) {
                // No reintentar si no hay token, es un error de autenticación inmediato.
                throw new Error('No hay token de autenticación');
            }
            console.log('Token usado para la petición:', token);
            const response = await api.post('/chat/', { message });
            console.log('Respuesta completa:', response);
            return response.data; // Éxito, retornar la data
        } catch (error) {
            lastError = error;
            console.error(`Error en intento ${attempt + 1} al enviar mensaje:`, error.response || error);

            const status = error.response?.status;
            const headers = error.response?.headers;

            if ((status === 429 || status === 503) && attempt < MAX_RETRIES - 1) {
                let delay = INITIAL_RETRY_DELAY * (2 ** attempt); // Exponential backoff por defecto
                const retryAfterHeader = headers?.['retry-after'];

                if (retryAfterHeader) {
                    const retryAfterSeconds = parseInt(retryAfterHeader, 10);
                    if (!isNaN(retryAfterSeconds)) {
                        delay = retryAfterSeconds * 1000; // Convertir a milisegundos
                        console.warn(`Servidor solicitó reintentar después de ${retryAfterSeconds} segundos.`);
                    } else {
                        // Podría ser una fecha HTTP, intentar parsearla
                        const retryAfterDate = new Date(retryAfterHeader);
                        if (!isNaN(retryAfterDate.getTime())) {
                            const delayMs = retryAfterDate.getTime() - Date.now();
                            if (delayMs > 0) {
                                delay = delayMs;
                                console.warn(`Servidor solicitó reintentar después de una fecha específica. Esperando ${delayMs}ms.`);
                            }
                        }
                    }
                }

                console.warn(`Reintentando en ${delay}ms...`);
                await sleep(delay);
            } else {
                // No es un error retriable o se superaron los reintentos
                console.error('Error no retriable o reintentos agotados. Lanzando error.');
                throw lastError;
            }
        }
    }
    // Si el bucle termina, significa que todos los reintentos fallaron.
    console.error('Todos los reintentos fallaron. Lanzando el último error.');
    throw lastError;
};

export default api; 