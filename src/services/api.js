// src/services/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'https://localhost:7263/api',
});

// Automatski dodaje JWT u header svakog zahtjeva
API.interceptors.request.use(config => {
    const token = sessionStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
