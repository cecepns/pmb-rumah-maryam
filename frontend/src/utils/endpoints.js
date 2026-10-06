/**
 * API Endpoints Centralized Configuration
 * PMB Rumah Maryam
 * All endpoint paths MUST be defined here according to project rules.
 */

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
