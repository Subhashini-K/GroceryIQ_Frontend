import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Low stock on Organic Milk', read: false },
    { id: 2, message: 'Eggs expiring in 3 days', read: false }
  ]);
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.data || res.data);
        } catch (error) {
          console.error('Session restore failed:', error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token, ...userData } = res.data.data || res.data;
    const finalUser = userData.user || userData;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(finalUser));
    
    setToken(token);
    setUser(finalUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const markNotificationsRead = () => setNotifications(prev => prev.map(n => ({...n, read: true})));

  return (
    <AppContext.Provider value={{
      sidebarOpen,
      toggleSidebar,
      notifications,
      markNotificationsRead,
      user,
      token,
      loading,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
