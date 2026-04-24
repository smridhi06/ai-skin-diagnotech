import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }

    const loadUser = useCallback(async () => {
  if (!localStorage.getItem('token')) {
    setLoading(false);
    return;
  }

  try {
    const res = await authAPI.getMe();
    setUser(res.data.data);
  } catch (error) {
    console.error('Failed to load user:', error);
    logout();
  } finally {
    setLoading(false);
  }
}, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, data } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(data));

      setToken(newToken);
      setUser(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const { token: newToken, data } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(data));

      setToken(newToken);
      setUser(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;