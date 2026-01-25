import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token by fetching current user
      getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await apiSignIn(email, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error.response?.data || { message: 'Sign in failed' };
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await apiSignUp(userData);
      const { token, user: newUser } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || 'Sign up failed';
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
