import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// --- INVENTORY ---
export const fetchProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/products/all`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const addProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_URL}/products/add`, productData);
        return response.data;
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

// --- SALES ---
export const recordSale = async (saleData) => {
    try {
        const response = await axios.post(`${API_URL}/sales/add`, saleData);
        return response.data;
    } catch (error) {
        console.error("Error recording sale:", error);
        throw error;
    }
};

export const undoLastSale = async () => {
    try {
        const response = await axios.delete(`${API_URL}/sales/undo-last`);
        return response.data;
    } catch (error) {
        console.error("Error undoing sale:", error);
        throw error;
    }
};

// --- AI PREDICTION ---
export const fetchPrediction = async (features) => {
    try {
        // Updated to use the new Node.js aggregator endpoint
        const response = await axios.post(`${API_URL}/sales/predict-demand`, features);
        return response.data;
    } catch (error) {
        console.error("Error getting prediction:", error);
        throw error;
    }
};

export const fetchSeasonalForecast = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/forecast/seasonal/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching seasonal forecast:", error);
        throw error;
    }
};

// --- ANALYTICS SERVICES ---
export const fetchSalesAnalytics = async () => {
    try {
        const response = await axios.get(`${API_URL}/sales/analytics/daily`);
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
};

export const fetchProfitLoss = async () => {
    try {
        const response = await axios.get(`${API_URL}/analytics/profit-loss`);
        return response.data;
    } catch (error) {
        console.error("Error fetching profit loss data:", error);
        throw error;
    }
};

export const fetchInsights = async (month = 'current', status = 'active') => {
    try {
        const response = await axios.get(`${API_URL}/sales/insights?month=${month}&status=${status}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching insights:", error);
        return []; // Return empty array on error to prevent crash
    }
};

export const fetchInsightsHistory = async (filters = {}) => {
    try {
        const { product, month, type } = filters;
        let query = "?";
        if (product) query += `product=${product}&`;
        if (month) query += `month=${month}&`;
        if (type) query += `type=${type}&`;

        const response = await axios.get(`${API_URL}/sales/insights/history${query}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// --- ADMIN SERVICES ---
export const resetSystem = async () => {
    try {
        const response = await axios.delete(`${API_URL}/admin/reset-system`);
        return response.data;
    } catch (error) {
        console.error("Error resetting system:", error);
        throw error;
    }
};