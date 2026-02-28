import axios from 'axios';

// Create a configured Axios instance pointing to the backend
const api = axios.create({
    // @ts-ignore
    baseURL: process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api'),
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add auth token if available (for future use when login is built)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
