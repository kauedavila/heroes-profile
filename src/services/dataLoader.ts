import { Monster, GameMap, WorldMap } from '../types/game';
import { MONSTERS } from '../data/monsters';
import { MAPS } from '../data/maps';
import { WORLD_MAP } from '../data/worldMap';

export class DataLoader {
  static async loadMonsters(): Promise<Monster[]> {
    try {
      // Return a copy to prevent direct mutation of the original data
      return JSON.parse(JSON.stringify(MONSTERS));
    } catch (error) {
      console.error('Error loading monsters data:', error);
      return [];
    }
  }

  static async loadMaps(): Promise<GameMap[]> {
    try {
      // Return a copy to prevent direct mutation of the original data
      return JSON.parse(JSON.stringify(MAPS));
    } catch (error) {
      console.error('Error loading maps data:', error);
      return [];
    }
  }

  static async loadWorldMap(): Promise<WorldMap | null> {
    try {
      // Return a copy to prevent direct mutation of the original data
      return JSON.parse(JSON.stringify(WORLD_MAP));
    } catch (error) {
      console.error('Error loading world map data:', error);
      return null;
    }
  }

  static async loadAllData(): Promise<{
    monsters: Monster[];
    maps: GameMap[];
    worldMap: WorldMap | null;
  }> {
    const [monsters, maps, worldMap] = await Promise.all([
      this.loadMonsters(),
      this.loadMaps(),
      this.loadWorldMap()
    ]);

    return { monsters, maps, worldMap };
  }
}