import * as yaml from 'js-yaml';
import { Monster, GameMap, WorldMap } from '../types/game';

// YAML content as strings - in a real app these would be loaded from files
const MONSTERS_YAML = `
monsters:
  - id: "goblin_01"
    name: "Goblin Warrior"
    image: "goblin_warrior.png"
    level: 1
    stats:
      hp: 45
      attack: 12
      defense: 8
      speed: 15
      magic: 2
    abilities:
      - "Slash"
      - "Guard"
    rewards:
      gold: 25
      experience: 30
    dropItems:
      - item: "rusty_sword"
        chance: 0.1
      - item: "healing_potion"
        chance: 0.3

  - id: "orc_01"
    name: "Orc Brute"
    image: "orc_brute.png"
    level: 3
    stats:
      hp: 75
      attack: 18
      defense: 12
      speed: 8
      magic: 0
    abilities:
      - "Heavy Strike"
      - "Intimidate"
      - "Berserk"
    rewards:
      gold: 45
      experience: 55
    dropItems:
      - item: "iron_axe"
        chance: 0.15
      - item: "leather_armor"
        chance: 0.2

  - id: "skeleton_01"
    name: "Skeleton Archer"
    image: "skeleton_archer.png"
    level: 2
    stats:
      hp: 35
      attack: 16
      defense: 6
      speed: 20
      magic: 5
    abilities:
      - "Arrow Shot"
      - "Bone Throw"
      - "Poison Arrow"
    rewards:
      gold: 35
      experience: 40
    dropItems:
      - item: "bone_bow"
        chance: 0.12
      - item: "antidote"
        chance: 0.25

  - id: "fire_elemental_01"
    name: "Fire Elemental"
    image: "fire_elemental.png"
    level: 5
    stats:
      hp: 90
      attack: 25
      defense: 10
      speed: 12
      magic: 30
    abilities:
      - "Fireball"
      - "Flame Burst"
      - "Ignite"
      - "Fire Shield"
    rewards:
      gold: 75
      experience: 85
    dropItems:
      - item: "fire_gem"
        chance: 0.2
      - item: "flame_staff"
        chance: 0.08

  - id: "dragon_01"
    name: "Young Dragon"
    image: "young_dragon.png"
    level: 10
    stats:
      hp: 200
      attack: 45
      defense: 25
      speed: 18
      magic: 40
    abilities:
      - "Dragon Breath"
      - "Claw Strike"
      - "Wing Gust"
      - "Roar"
      - "Fire Storm"
    rewards:
      gold: 200
      experience: 250
    dropItems:
      - item: "dragon_scale"
        chance: 0.3
      - item: "dragon_sword"
        chance: 0.05
      - item: "rare_gem"
        chance: 0.15
`;

const MAPS_YAML = `
maps:
  # Plains area maps
  - id: "plains_monsters_01"
    name: "Goblin Outpost"
    type: "monster"
    description: "A small outpost overrun by goblins"
    backgroundImage: "plains_bg.png"
    difficulty: 1
    rounds: 3
    monsters:
      - id: "goblin_01"
        quantity: 2
        round: 1
      - id: "goblin_01"
        quantity: 3
        round: 2
      - id: "goblin_01"
        quantity: 1
        round: 3
        boss: true
    rewards:
      gold: 150
      experience: 200
      items:
        - "basic_sword"
        - "leather_vest"

  - id: "village_recruitment_01"
    name: "Peaceful Village"
    type: "recruitment"
    description: "A small village where heroes can be recruited"
    backgroundImage: "village_bg.png"
    recruitmentCost: 100
    availableCharacters:
      - class: "warrior"
        level: 1
        cost: 150
        stats:
          hp: 80
          attack: 15
          defense: 12
          speed: 8
          magic: 2
      - class: "archer"
        level: 1
        cost: 120
        stats:
          hp: 60
          attack: 12
          defense: 8
          speed: 15
          magic: 5
      - class: "mage"
        level: 1
        cost: 180
        stats:
          hp: 45
          attack: 8
          defense: 6
          speed: 10
          magic: 20

  # Forest area maps
  - id: "forest_monsters_01"
    name: "Haunted Grove"
    type: "monster"
    description: "Undead creatures roam these cursed woods"
    backgroundImage: "forest_bg.png"
    difficulty: 2
    rounds: 4
    monsters:
      - id: "skeleton_01"
        quantity: 2
        round: 1
      - id: "skeleton_01"
        quantity: 1
        round: 2
      - id: "goblin_01"
        quantity: 2
        round: 2
      - id: "skeleton_01"
        quantity: 3
        round: 3
      - id: "orc_01"
        quantity: 1
        round: 4
        boss: true
    rewards:
      gold: 300
      experience: 400
      items:
        - "silver_sword"
        - "chain_mail"

  - id: "forest_monsters_02"
    name: "Ancient Grove"
    type: "monster"
    description: "Deep in the forest, ancient magic still lingers"
    backgroundImage: "forest_deep_bg.png"
    difficulty: 3
    rounds: 5
    monsters:
      - id: "skeleton_01"
        quantity: 3
        round: 1
      - id: "orc_01"
        quantity: 2
        round: 2
      - id: "fire_elemental_01"
        quantity: 1
        round: 3
      - id: "orc_01"
        quantity: 2
        round: 4
      - id: "fire_elemental_01"
        quantity: 1
        round: 5
        boss: true
    rewards:
      gold: 500
      experience: 600
      items:
        - "magic_sword"
        - "forest_cloak"

  - id: "druid_recruitment_01"
    name: "Druid Circle"
    type: "recruitment"
    description: "Ancient druids offer their services to worthy heroes"
    backgroundImage: "druid_circle_bg.png"
    recruitmentCost: 200
    availableCharacters:
      - class: "druid"
        level: 2
        cost: 250
        stats:
          hp: 70
          attack: 10
          defense: 8
          speed: 12
          magic: 25
      - class: "ranger"
        level: 2
        cost: 220
        stats:
          hp: 65
          attack: 16
          defense: 10
          speed: 18
          magic: 8
`;

const WORLD_MAP_YAML = `
worldMap:
  name: "Midgard"
  description: "A vast world filled with dangers and opportunities"
  regions:
    - id: "starting_plains"
      name: "Starting Plains"
      description: "Peaceful grasslands perfect for new adventurers"
      position:
        x: 100
        y: 200
      unlocked: true
      maps:
        - "plains_monsters_01"
        - "village_recruitment_01"

    - id: "dark_forest"
      name: "Dark Forest"
      description: "Ancient woods where shadows hide dangerous creatures"
      position:
        x: 300
        y: 150
      unlocked: false
      unlockRequirement:
        completedMaps: ["plains_monsters_01"]
        playerLevel: 3
      maps:
        - "forest_monsters_01"
        - "forest_monsters_02"
        - "druid_recruitment_01"

  connections:
    - from: "starting_plains"
      to: "dark_forest"
      path: "forest_path"
`;

interface YamlData {
  monsters?: Monster[];
  maps?: GameMap[];
  worldMap?: WorldMap;
}

export class YamlLoader {
  private static parseYaml<T>(yamlContent: string): T {
    try {
      return yaml.load(yamlContent) as T;
    } catch (error) {
      console.error('Error parsing YAML:', error);
      throw error;
    }
  }

  static async loadMonsters(): Promise<Monster[]> {
    try {
      const data = this.parseYaml<YamlData>(MONSTERS_YAML);
      return data.monsters || [];
    } catch (error) {
      console.error('Error loading monsters YAML:', error);
      return [];
    }
  }

  static async loadMaps(): Promise<GameMap[]> {
    try {
      const data = this.parseYaml<YamlData>(MAPS_YAML);
      return data.maps || [];
    } catch (error) {
      console.error('Error loading maps YAML:', error);
      return [];
    }
  }

  static async loadWorldMap(): Promise<WorldMap | null> {
    try {
      const data = this.parseYaml<YamlData>(WORLD_MAP_YAML);
      return data.worldMap || null;
    } catch (error) {
      console.error('Error loading world map YAML:', error);
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