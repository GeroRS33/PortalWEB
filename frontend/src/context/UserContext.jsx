import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists and fetch user details on load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (role, credentials) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', {
        role,
        ...credentials
      });

      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('stock_notified');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
