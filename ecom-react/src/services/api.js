import axios from 'axios';

const API_GATEWAY_URL = 'http://localhost:8888';

const api = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
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

// Fonction pour récupérer les produits
export const getProducts = async (token) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/product-service/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
    }
};

// Fonction pour récupérer les commandes
export const getCommands = async (token) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/command-service/commands`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        throw error;
    }
};

export default api;