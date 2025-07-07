import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, tokenManager } from '../utils/api';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenManager.getToken();
        const userData = tokenManager.getUser();
        
        if (token && userData) {
          // Verify token is still valid by fetching user profile
          const result = await authAPI.getProfile();
          if (result.success) {
            setUser(result.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            tokenManager.removeToken();
            tokenManager.removeUser();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenManager.removeToken();
        tokenManager.removeUser();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        const { user, token } = result.data;
        
        // Store user data and token
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: { message: 'Login failed' } };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authAPI.register(userData);
      
      if (result.success) {
        const { user, token } = result.data;
        
        // Store user data and token
        tokenManager.setToken(token);
        tokenManager.setUser(user);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: { message: 'Registration failed' } };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      tokenManager.removeToken();
      tokenManager.removeUser();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const result = await authAPI.updateProfile(userData);
      
      if (result.success) {
        const updatedUser = result.data;
        tokenManager.setUser(updatedUser);
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: { message: 'Profile update failed' } };
    }
  };

  // Request password reset
  const requestPasswordReset = async (userData) => {
    try {
      const result = await authAPI.requestPasswordReset(userData);
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: { message: 'Password reset request failed' } };
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;