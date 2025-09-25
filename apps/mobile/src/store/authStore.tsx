import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import { User, AuthTokens } from '../types';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => 
    set({ 
      user, 
      isAuthenticated: !!user 
    }),

  setTokens: (tokens) => 
    set({ tokens }),

  setLoading: (isLoading) => 
    set({ isLoading }),

  login: async (tokens, user) => {
    try {
      // Store tokens securely
      await storageService.storeTokens(tokens);
      
      // Update API service with new tokens
      apiService.setTokens(tokens);
      
      // Update state
      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login storage error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const { tokens } = get();
      
      // Call logout API if we have tokens
      if (tokens) {
        try {
          await apiService.logout(tokens.refreshToken);
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        }
      }
      
      // Clear stored tokens
      await storageService.clearTokens();
      
      // Clear API service tokens
      apiService.clearTokens();
      
      // Reset state
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force reset state even if cleanup fails
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...userData } });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Try to get stored tokens
      const storedTokens = await storageService.getTokens();
      
      if (storedTokens) {
        // Set tokens in API service
        apiService.setTokens(storedTokens);
        
        try {
          // Verify tokens by getting current user
          const userData = await apiService.getCurrentUser();
          
          set({
            user: userData.user,
            tokens: storedTokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.log('Token verification failed, clearing stored tokens');
          await storageService.clearTokens();
          apiService.clearTokens();
          
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Provider component for initialization
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

// Hook for easy access to auth state
export const useAuth = () => {
  const store = useAuthStore();
  return store;
};