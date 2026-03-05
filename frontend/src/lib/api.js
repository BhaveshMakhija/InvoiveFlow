import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

// Inject Clerk token into every request
export function setupApiAuth(getToken) {
    api.interceptors.request.use(async (config) => {
        try {
            const token = await getToken();
            if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch (_) { }
        return config;
    });
}

// Invoices
export const invoiceApi = {
    list: (params) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    send: (id, data) => api.post(`/invoices/${id}/send`, data),
};

// Business Profile
export const businessApi = {
    getMyProfile: () => api.get('/businessProfile/me'),
    create: (formData) => api.post('/businessProfile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, formData) => api.put(`/businessProfile/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// AI
export const aiApi = {
    generateInvoice: (prompt) => api.post('/ai/generate', { prompt }),
};

export default api;
