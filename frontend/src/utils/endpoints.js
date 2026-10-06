/**
 * API Endpoints Centralized Configuration
 * PMB Rumah Maryam
 * Production URL: https://api.kingcreativestudio.my.id/pmb-rumah-maryam
 */

// Base Server and API URLs
export const SERVER_BASE_URL = 
  import.meta.env.VITE_SERVER_URL || 'https://api.kingcreativestudio.my.id/pmb-rumah-maryam';

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || `${SERVER_BASE_URL}/api`;

/**
 * Helper to construct full URL for uploaded media/files
 * @param {string} path - relative or absolute file path
 * @returns {string} full accessible URL
 */
export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },

  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  CONFIG: {
    GET: '/config',
    UPDATE: '/config',
  },

  DASHBOARD: {
    STATS: '/dashboard/stats',
  },

  PASIEN: {
    LIST: '/pasien',
    DETAIL: (id) => `/pasien/${id}`,
    CREATE: '/pasien',
    UPDATE: (id) => `/pasien/${id}`,
    DELETE: (id) => `/pasien/${id}`,
  },

  LAYANAN: {
    LIST: '/layanan',
    DETAIL: (id) => `/layanan/${id}`,
    CREATE: '/layanan',
    UPDATE: (id) => `/layanan/${id}`,
    DELETE: (id) => `/layanan/${id}`,
  },

  KUNJUNGAN: {
    LIST: '/kunjungan',
    DETAIL: (id) => `/kunjungan/${id}`,
    CREATE: '/kunjungan',
    UPDATE: (id) => `/kunjungan/${id}`,
    DELETE: (id) => `/kunjungan/${id}`,
    UPDATE_PAYMENT: (id) => `/kunjungan/${id}/status-pembayaran`,
  },

  TRANSAKSI: {
    LIST: '/transaksi',
    CREATE: '/transaksi',
    UPDATE: (id) => `/transaksi/${id}`,
    DELETE: (id) => `/transaksi/${id}`,
  },

  WA_LOG: {
    LIST: '/wa-log',
    CREATE: '/wa-log',
  },

  UPLOAD: {
    FILE: '/upload',
  }
};
