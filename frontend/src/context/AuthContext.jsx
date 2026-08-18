import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { clearSessionGreeting } from '../utils/hinglishGreetings';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (token) {
      try {
        // If token exists, fetch current user profile
        const res = await api.get('/auth/me');
        setUser(res.data);
        return res.data;
      } catch (err) {
        console.error('Failed to load user profile with token:', err.message);
        // Token is invalid/expired, clear it
        logout();
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    loadUser().finally(() => setLoading(false));
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  // Signup handler
  const signup = async (name, email, password, gym) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, gym });
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    clearSessionGreeting();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        loadUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
