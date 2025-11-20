import axios from 'axios';
import { Crime, invalidateCrimeCaches } from './apiService';
import API_BASE_URL from './config';

const ADMIN_API_URL = `${API_BASE_URL}/admin`;
const ADMIN_TOKEN_KEY = 'adminToken';

export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const adminLogin = async (username: string, password: string) => {
  const response = await axios.post(`${ADMIN_API_URL}/login`, { username, password });
  const token = response.data?.token;
  if (token) {
    setAdminToken(token);
  }
  return token;
};

export const adminLogout = async () => {
  const token = getAdminToken();
  if (token) {
    await axios.post(
      `${ADMIN_API_URL}/logout`,
      {},
      {
        headers: {
          'X-Admin-Token': token,
        },
      },
    );
  }
  clearAdminToken();
};

export const fetchAllCrimesForAdmin = async (): Promise<Crime[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Missing admin token');

  const response = await axios.get(`${ADMIN_API_URL}/crimes`, {
    headers: {
      'X-Admin-Token': token,
    },
  });
  return response.data;
};

export const updateCrimeStatus = async (crimeId: number, status: string): Promise<Crime> => {
  const token = getAdminToken();
  if (!token) throw new Error('Missing admin token');

  const response = await axios.patch(
    `${ADMIN_API_URL}/crimes/status`,
    {},
    {
      params: { crimeId, status },
      headers: {
        'X-Admin-Token': token,
      },
    },
  );
  invalidateCrimeCaches();
  return response.data;
};

export const deleteCrimeAsAdmin = async (crimeId: number): Promise<void> => {
  const token = getAdminToken();
  if (!token) throw new Error('Missing admin token');

  await axios.delete(`${ADMIN_API_URL}/crimes/${crimeId}`, {
    headers: {
      'X-Admin-Token': token,
    },
  });
  invalidateCrimeCaches();
};

