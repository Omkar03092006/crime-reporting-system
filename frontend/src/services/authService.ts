// services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Store the user in localStorage
export const setUser = (userData: any) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem('user') !== null;
};

// Register new user
export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password
    });
    setUser(response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw 'Unable to connect to server. Please try again later.';
  }
};

// Login user
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    setUser(response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw 'Unable to connect to server. Please try again later.';
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};