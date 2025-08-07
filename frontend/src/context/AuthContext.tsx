"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to normalize user data from backend
const normalizeUserData = (backendUser: any): User => {
  return {
    id: backendUser.id,
    username: backendUser.username || backendUser.user_name, // Handle both field names
    email: backendUser.email,
    role: backendUser.role
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(normalizeUserData(parsedUser));
        // Verify token is still valid with health check first
        checkBackendAndVerifyToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        logout();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkBackendAndVerifyToken = async (tokenToVerify: string) => {
    try {
      // First check if backend is available
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (healthResponse.ok) {
        // Backend is available, proceed with token verification
        verifyToken(tokenToVerify);
      } else {
        // Backend not available, keep existing session
        console.warn('Backend not available, keeping existing session');
        setIsLoading(false);
      }
    } catch (error) {
      // Network error, keep existing session
      console.warn('Cannot reach backend, keeping existing session');
      setIsLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          const normalizedUser = normalizeUserData(data.data.user);
          setUser(normalizedUser);
          setToken(tokenToVerify);
          // Update localStorage with normalized data
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } else {
          // Token is invalid
          logout();
        }
      } else {
        // Handle different error status codes
        if (response.status === 401 || response.status === 403) {
          // Token is invalid, logout
          logout();
        } else {
          // Server error, keep existing session but log warning
          console.warn('Token verification failed due to server error, keeping existing session');
        }
      }
    } catch (error) {
      // Network error or server not available
      console.warn('Token verification failed due to network error, keeping existing session');
      // Don't logout on network errors, just keep the existing session
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { user: userData, token: userToken } = data.data;
        const normalizedUser = normalizeUserData(userData);
        setUser(normalizedUser);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return { success: true };
      } else {
        // Translate Chinese error messages to English
        let errorMessage = data.message || 'Login failed';
        if (errorMessage.includes('用户名或密码错误')) {
          errorMessage = 'Invalid username or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('用户名已存在')) {
          errorMessage = 'This username is already taken.';
        } else if (errorMessage.includes('邮箱已存在')) {
          errorMessage = 'This email is already registered.';
        }
        
        console.error('Login failed:', data.message);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { user: userData, token: userToken } = data.data;
        const normalizedUser = normalizeUserData(userData);
        setUser(normalizedUser);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return { success: true };
      } else {
        // Translate Chinese error messages to English
        let errorMessage = data.message || 'Registration failed';
        if (errorMessage.includes('用户名已存在')) {
          errorMessage = 'This username is already taken. Please choose a different one.';
        } else if (errorMessage.includes('邮箱已存在')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        }
        
        console.error('Registration failed:', data.message);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoading(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading: isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 