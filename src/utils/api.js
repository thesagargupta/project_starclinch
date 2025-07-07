import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('users/login/', credentials);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Login failed' },
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('users/register/', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Registration failed' },
      };
    }
  },

  logout: async () => {
    try {
      await api.post('users/logout/');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return {
        success: true,
      };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return {
        success: false,
        error: error.response?.data || { message: 'Logout failed' },
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('users/profile/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch profile' },
      };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('users/profile/', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update profile' },
      };
    }
  },

  // Password reset (if implemented in backend)
  requestPasswordReset: async (userData) => {
    try {
      // This would need to be implemented in your Django backend
      const response = await api.post('users/password-reset/', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Password reset request failed' },
      };
    }
  },
};

// Incidents API functions
export const incidentsAPI = {
  getIncidents: async (params = {}) => {
    try {
      const response = await api.get('incidents/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch incidents' },
      };
    }
  },

  createIncident: async (incidentData) => {
    try {
      console.log('Creating incident with data:', incidentData);
      const response = await api.post('incidents/', incidentData);
      console.log('Incident created successfully:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Create incident API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to create incident' },
      };
    }
  },

  getIncident: async (id) => {
    try {
      const response = await api.get(`incidents/${id}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch incident' },
      };
    }
  },

  updateIncident: async (id, incidentData) => {
    try {
      const response = await api.put(`incidents/${id}/`, incidentData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update incident' },
      };
    }
  },

  deleteIncident: async (id) => {
    try {
      await api.delete(`incidents/${id}/`);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to delete incident' },
      };
    }
  },

  searchIncidents: async (query, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        incident_id: query,
        ...params
      }).toString();
      const response = await api.get(`incidents/search/?${queryParams}`);
      return {
        success: true,
        data: [response.data], // Backend returns single incident, wrap in array for consistency
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Search failed' },
      };
    }
  },

  getIncidentStats: async (params = {}) => {
    try {
      const response = await api.get('incidents/stats/');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch stats' },
      };
    }
  },

  updateIncident: async (id, data) => {
    try {
      const response = await api.put(`incidents/${id}/`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to update incident' },
      };
    }
  },

  closeIncident: async (id) => {
    try {
      const response = await api.post(`incidents/${id}/close/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to close incident' },
      };
    }
  },
};

// Utility functions
export const utilsAPI = {
  lookupPincode: async (pincode) => {
    try {
      const response = await api.get(`users/pincode/${pincode}/`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Pincode lookup failed' },
      };
    }
  },
};

// Helper functions for local storage
export const tokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  
  getUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user) => localStorage.setItem('userData', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('userData'),
  
  isAuthenticated: () => !!localStorage.getItem('authToken'),
};

export default api;