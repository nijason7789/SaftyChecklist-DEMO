import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as storage from '../utils/storage';

// Define types for user and auth context
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Use our type-safe storage utility to get the token
        const token = storage.getItem<string>('auth_token');
        
        if (token) {
          // Simulate fetching user data
          // In a real app, you would make an API call to get the user data
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock user data
          setUser({
            id: '1',
            email: 'user@example.com',
            name: 'Test User',
          });
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setError('Failed to restore authentication state');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to authenticate
      // For now, we'll simulate a successful login with any credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const userData: User = {
        id: '1',
        email,
        name: 'Test User',
      };
      
      // Store token in localStorage using our type-safe utility
      storage.setItem<string>('auth_token', 'mock_token');
      
      setUser(userData);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials and try again.');
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to register the user
      // For now, we'll simulate a successful registration with any credentials
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
      };
      
      // Store token in localStorage using our type-safe utility
      storage.setItem<string>('auth_token', 'mock_token');
      
      setUser(userData);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again later.');
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    storage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
