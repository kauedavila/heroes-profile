import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Character } from '../types/game';

const GAME_STATE_KEY = 'game_state';
const SAVE_SLOTS_KEY = 'save_slots';

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  playerLevel: number;
  playtime: number;
  gameState: GameState;
}

class StorageService {
  async saveGameState(gameState: GameState, slotName: string = 'Auto Save'): Promise<void> {
    try {
      const saveSlot: SaveSlot = {
        id: Date.now().toString(),
        name: slotName,
        timestamp: Date.now(),
        playerLevel: gameState.player.level,
        playtime: 0, // TODO: Implement playtime tracking
        gameState
      };

      // Save current game state
      await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));

      // Update save slots
      const existingSaves = await this.getSaveSlots();
      const updatedSaves = [...existingSaves, saveSlot];
      
      // Keep only the latest 5 saves
      const sortedSaves = updatedSaves
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      await AsyncStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(sortedSaves));
    } catch (error) {
      console.error('Error saving game state:', error);
      throw new Error('Failed to save game');
    }
  }

  async loadGameState(): Promise<GameState | null> {
    try {
      const savedState = await AsyncStorage.getItem(GAME_STATE_KEY);
      if (savedState) {
        const gameState = JSON.parse(savedState) as GameState;
        // Migrate old saves: add reserve array if missing
        if (!gameState.reserve) {
          gameState.reserve = [];
        }
        // Migrate old saves: add position to characters if missing
        gameState.party = gameState.party.map(char => ({
          ...char,
          position: char.position || "front"
        }));
        if (gameState.reserve) {
          gameState.reserve = gameState.reserve.map(char => ({
            ...char,
            position: char.position || "front"
          }));
        }
        return gameState;
      }
      return null;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  }

  async loadGameFromSlot(slotId: string): Promise<GameState | null> {
    try {
      const saveSlots = await this.getSaveSlots();
      const slot = saveSlots.find(save => save.id === slotId);
      
      if (slot) {
        const gameState = slot.gameState;
        // Migrate old saves: add reserve array if missing
        if (!gameState.reserve) {
          gameState.reserve = [];
        }
        // Migrate old saves: add position to characters if missing
        gameState.party = gameState.party.map(char => ({
          ...char,
          position: char.position || "front"
        }));
        if (gameState.reserve) {
          gameState.reserve = gameState.reserve.map(char => ({
            ...char,
            position: char.position || "front"
          }));
        }
        // Set as current game state
        await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
        return gameState;
      }
      return null;
    } catch (error) {
      console.error('Error loading game from slot:', error);
      return null;
    }
  }

  async getSaveSlots(): Promise<SaveSlot[]> {
    try {
      const savedSlots = await AsyncStorage.getItem(SAVE_SLOTS_KEY);
      if (savedSlots) {
        return JSON.parse(savedSlots) as SaveSlot[];
      }
      return [];
    } catch (error) {
      console.error('Error getting save slots:', error);
      return [];
    }
  }

  async deleteSaveSlot(slotId: string): Promise<void> {
    try {
      const saveSlots = await this.getSaveSlots();
      const updatedSlots = saveSlots.filter(slot => slot.id !== slotId);
      await AsyncStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(updatedSlots));
    } catch (error) {
      console.error('Error deleting save slot:', error);
      throw new Error('Failed to delete save');
    }
  }

  async createNewGame(): Promise<GameState> {
    const defaultCharacter: Character = {
      id: 'player_1',
      name: 'Hero',
      class: 'warrior',
      level: 1,
      stats: {
        hp: 80,
        attack: 15,
        defense: 12,
        speed: 8,
        magic: 2
      },
      experience: 0,
      moves: ['slash', 'guard'],
      equipment: {},
      position: 'front'
    };

    const newGameState: GameState = {
      player: {
        name: 'Player',
        level: 1,
        experience: 0,
        gold: 500
      },
      party: [defaultCharacter],
      reserve: [],
      completedMaps: [],
      unlockedRegions: ['starting_plains'],
      inventory: {
        'healing_potion': 3,
        'basic_sword': 1
      }
    };

    await this.saveGameState(newGameState, 'New Game');
    return newGameState;
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GAME_STATE_KEY);
      await AsyncStorage.removeItem(SAVE_SLOTS_KEY);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

export const storageService = new StorageService();