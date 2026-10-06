import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pmb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pmb_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('pmb_token');
      if (savedToken) {
        try {
          const res = await request.get(API_ENDPOINTS.AUTH.PROFILE);
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('pmb_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, {
      username: username.trim(),
      password
    });

    if (res.success && res.token) {
      localStorage.setItem('pmb_token', res.token);
      localStorage.setItem('pmb_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Gagal melakukan login');
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('pmb_token');
    localStorage.removeItem('pmb_user');
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Anda telah berhasil keluar (logout)');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.AUTH.PROFILE);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('pmb_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
