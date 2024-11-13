// client/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize isAdmin state from localStorage, defaulting to false
  const [isAdmin, setIsAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem('isAdmin');
    return storedAdmin ? JSON.parse(storedAdmin) : false;
  });

  // Update localStorage whenever isAdmin changes
  useEffect(() => {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/auth', {
          withCredentials: true
        });
        checkAdminStatus(res.data); // Check admin status based on received data
      } catch (err) {
        console.error('Auth check error:', err.response ? err.response.data : err.message);
        setIsAdmin(false); // Ensure isAdmin state is set to false on error
      }
    };
  
    checkAuth();
  }, []);
  
  const checkAdminStatus = (userData) => {
    setIsAdmin(userData && userData.role === 'admin');
  };

  const login = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData, {
        withCredentials: true,
      });
      checkAdminStatus(res.data); // Check admin status after login
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      throw err; // Handle login error
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        withCredentials: true,
      });
      setIsAdmin(false); // Ensure isAdmin state is reset on logout
      localStorage.removeItem('isAdmin');
    } catch (err) {
      console.error('Logout error:', err.response ? err.response.data : err.message);
      throw err; // Handle logout error
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
