// services/apiService.ts
import axios from 'axios';
import { getCurrentUser } from './authService';
import API_BASE_URL from './config';

// API Configuration
const API_URL = API_BASE_URL;

// Axios configuration
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Cache configuration
const CACHE_DURATION = 60000; // 1 minute

// Cache implementation
interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: { [key: string]: CacheItem } = {};

const getFromCache = (key: string): any | null => {
  const item = cache[key];
  if (!item) return null;
  
  if (Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data;
  }
  
  delete cache[key];
  return null;
};

const setInCache = (key: string, data: any) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

const clearFromCache = (key: string) => {
  delete cache[key];
};

export const invalidateCrimeCaches = () => {
  Object.keys(cache).forEach((key) => {
    if (key.includes('/crimes')) {
      clearFromCache(key);
    }
  });
};

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const user = getCurrentUser();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Add response caching
axios.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = response.config.url;
      if (cacheKey) {
        setInCache(cacheKey, response.data);
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

// Type definitions
export interface Crime {
  id: number;
  crimeType: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  reportedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  reportedBy?: {
    id: number;
    name?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// Get all crimes with caching
export const getAllCrimes = async (): Promise<Crime[]> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const url = `${API_URL}/crimes`;
    const cachedData = getFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (response.data) {
      setInCache(url, response.data);
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching crimes:', error);
    throw error;
  }
};

// Get crime by ID with caching
export const getCrimeById = async (id: number): Promise<Crime> => {
  try {
    const url = `${API_URL}/crimes/${id}`;
    const cachedData = getFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get(url);
    setInCache(url, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crime with ID ${id}:`, error);
    throw error;
  }
};

// Report a new crime
export const reportCrime = async (crimeData: Partial<Crime>): Promise<Crime> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    if (!crimeData.latitude || !crimeData.longitude) {
      throw new Error('Location (latitude & longitude) is required');
    }

    const dataToSend = {
      ...crimeData,
      reportedBy: { id: user.id },
    };

    const response = await axios.post(`${API_URL}/crimes`, dataToSend);
    
    // Clear all crime-related caches after new report
    Object.keys(cache).forEach(key => {
      if (key.includes('/crimes')) {
        clearFromCache(key);
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error reporting crime:', error.response?.data || error.message);
    throw error;
  }
};

// Alias for reportCrime to match the import in CrimeReportForm
export const createCrime = reportCrime;

// Get user's crimes with caching
export const getUserCrimes = async (): Promise<Crime[]> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const url = `${API_URL}/crimes/user/${user.id}`;
    const cachedData = getFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get(url);
    setInCache(url, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user crimes:', error);
    throw error;
  }
};

// Delete a crime
export const deleteCrime = async (crimeId: number): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await axios.delete(`${API_URL}/crimes/${crimeId}`);
    
    // Clear crime-related caches
    Object.keys(cache).forEach(key => {
      if (key.includes('/crimes')) {
        clearFromCache(key);
      }
    });
  } catch (error: any) {
    console.error('Error deleting crime:', error.response?.data || error.message);
    throw error;
  }
};