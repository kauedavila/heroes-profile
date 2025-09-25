export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'master';
  vipLevel: number;
  vipExpiry?: string;
  gameData: {
    level: number;
    experience: number;
    gold: number;
    characters: Character[];
    inventory: InventoryItem[];
    currentStage: number;
  };
  isVip: boolean;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  class: 'warrior' | 'mage' | 'archer' | 'rogue';
  level: number;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  quantity: number;
}

export interface GameState {
  gameData: User['gameData'];
  isVip: boolean;
  vipLevel: number;
  vipMultiplier: number;
}

export interface BattleResult {
  victory: boolean;
  rewards?: {
    gold: number;
    experience: number;
    vipBonus: boolean;
  };
  playerState?: {
    level: number;
    experience: number;
    gold: number;
    currentStage: number;
  };
  message?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  vipRequired?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Game: undefined;
  Profile: undefined;
  Settings: undefined;
  Characters: undefined;
  Shop: undefined;
  Battle: { stageId: number };
  CharacterCreation: undefined;
};

export type MainTabParamList = {
  Game: undefined;
  Characters: undefined;
  Shop: undefined;
  Profile: undefined;
};