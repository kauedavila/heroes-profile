import { Monster, GameMap, WorldMap } from '../types/game';
import { DataLoader } from './dataLoader';

export class GameDataService {
  private monstersData: Monster[] | null = null;
  private mapsData: GameMap[] | null = null;
  private worldMapData: WorldMap | null = null;

  constructor(initialData?: {
    monsters?: Monster[];
    maps?: GameMap[];
    worldMap?: WorldMap | null;
  }) {
    if (initialData) {
      this.monstersData = initialData.monsters || null;
      this.mapsData = initialData.maps || null;
      this.worldMapData = initialData.worldMap || null;
    }
  }

  async loadMonsters(): Promise<Monster[]> {
    if (this.monstersData) {
      return this.monstersData;
    }

    try {
      this.monstersData = await DataLoader.loadMonsters();
      return this.monstersData;
    } catch (error) {
      console.error('Error loading monsters:', error);
      return [];
    }
  }

  async loadMaps(): Promise<GameMap[]> {
    if (this.mapsData) {
      return this.mapsData;
    }

    try {
      this.mapsData = await DataLoader.loadMaps();
      return this.mapsData;
    } catch (error) {
      console.error('Error loading maps:', error);
      return [];
    }
  }

  async loadWorldMap(): Promise<WorldMap | null> {
    if (this.worldMapData) {
      return this.worldMapData;
    }

    try {
      this.worldMapData = await DataLoader.loadWorldMap();
      return this.worldMapData;
    } catch (error) {
      console.error('Error loading world map:', error);
      return null;
    }
  }

  getMonsterById(id: string): Monster | null {
    if (!this.monstersData) {
      return null;
    }
    return this.monstersData.find(monster => monster.id === id) || null;
  }

  getMapById(id: string): GameMap | null {
    if (!this.mapsData) {
      return null;
    }
    return this.mapsData.find(map => map.id === id) || null;
  }

  // Initialize all data
  async initialize(): Promise<void> {
    await Promise.all([
      this.loadMonsters(),
      this.loadMaps(),
      this.loadWorldMap()
    ]);
  }

  // Static factory method to create a service instance with data
  static async createFromData(): Promise<GameDataService> {
    const data = await DataLoader.loadAllData();
    return new GameDataService(data);
  }
}