import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  GameState,
  BattleResult,
  ShopItem,
  Character,
  ApiResponse,
} from '../types';
import { storageService } from './storageService';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://your-production-api.com/api';

export class ApiService {
  private api: AxiosInstance;
  private tokens: AuthTokens | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.tokens?.refreshToken) {
            // No refresh token, redirect to login
            this.clearTokens();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const newTokens = await this.refreshAccessToken();
            this.setTokens(newTokens);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
  }

  clearTokens() {
    this.tokens = null;
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;
    this.refreshPromise = this.api
      .post('/auth/refresh', { refreshToken: this.tokens.refreshToken })
      .then((response) => {
        const newTokens = response.data;
        this.tokens = newTokens;
        storageService.storeTokens(newTokens);
        return newTokens;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.api.post('/auth/logout', { refreshToken });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // User endpoints
  async updateProfile(data: { name?: string; avatar?: string }): Promise<{ user: User }> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  async updateGameData(gameData: Partial<User['gameData']>): Promise<{ gameData: User['gameData'] }> {
    const response = await this.api.put('/users/game-data', { gameData });
    return response.data;
  }

  // Game endpoints
  async getGameState(): Promise<GameState> {
    const response = await this.api.get('/game/state');
    return response.data;
  }

  async createCharacter(character: { name: string; class: string }): Promise<{ character: Character }> {
    const response = await this.api.post('/game/character', character);
    return response.data;
  }

  async battle(data: { characterId: string; stageId: number }): Promise<BattleResult> {
    const response = await this.api.post('/game/battle', data);
    return response.data;
  }

  async getShop(): Promise<{
    items: ShopItem[];
    playerGold: number;
    isVip: boolean;
    vipLevel: number;
  }> {
    const response = await this.api.get('/game/shop');
    return response.data;
  }

  async purchaseItem(data: { itemId: string; quantity?: number }): Promise<{
    item: { id: string; name: string; quantity: number; totalCost: number };
    remainingGold: number;
  }> {
    const response = await this.api.post('/game/shop/purchase', data);
    return response.data;
  }

  async autoBattle(data: { characterId: string; duration: number }): Promise<{
    duration: number;
    rewards: { gold: number; experience: number; vipMultiplier: number };
    playerState: { level: number; experience: number; gold: number };
  }> {
    const response = await this.api.post('/game/auto-battle', data);
    return response.data;
  }

  // Error handling helper
  handleApiError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
}

export const apiService = new ApiService();