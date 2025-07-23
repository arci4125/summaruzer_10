import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem('isAuthenticated');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.warn('Error reading localStorage key “isAuthenticated”:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    } catch (error) {
      console.warn('Error setting localStorage key “isAuthenticated”:', error);
    }
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
