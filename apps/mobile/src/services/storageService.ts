import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '../types';

const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  GAME_SETTINGS: 'game_settings',
  OFFLINE_DATA: 'offline_data',
};

export class StorageService {
  // Secure storage for sensitive data (tokens)
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }

      return null;
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      // Don't throw here, we want to continue with logout
    }
  }

  // Regular AsyncStorage for non-sensitive data
  async storeUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error storing user preferences:', error);
    }
  }

  async getUserPreferences(): Promise<Record<string, any> | null> {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async storeGameSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error storing game settings:', error);
    }
  }

  async getGameSettings(): Promise<Record<string, any> | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting game settings:', error);
      return null;
    }
  }

  async storeOfflineData(data: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  async getOfflineData(): Promise<Record<string, any> | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.clearTokens(),
        AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export const storageService = new StorageService();