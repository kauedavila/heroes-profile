export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  magic: number;
}

export interface Move {
  id: string;
  name: string;
  description: string;
  type: "physical" | "magical" | "healing" | "buff" | "debuff";
  damageRatio: {
    attack: number;
    magic: number;
    level: number;
  };
  baseCooldown: number; // Base cooldown in turns
  targetType: "single" | "all_enemies" | "all_allies" | "self";
  effects?: {
    heal?: number;
    buffStats?: Partial<Stats>;
    debuffStats?: Partial<Stats>;
    duration?: number;
  };
}

export interface DropItem {
  item: string;
  chance: number;
}

export interface Monster {
  id: string;
  name: string;
  image: string | string[];
  level: number;
  stats: Stats;
  moves: string[]; // Move IDs instead of ability names
  rewards: {
    gold: number;
    experience: number;
  };
  dropItems: DropItem[];
}

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  stats: Stats;
  experience: number;
  moves: string[]; // Move IDs instead of ability names
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
}

export interface BattleCharacter extends Character {
  currentHp: number;
  actionMeter: number;
  isPlayerControlled: boolean;
  moveCooldowns: { [moveId: string]: number }; // Remaining cooldown turns for each move
}

export interface MapMonster {
  id: string;
  quantity: number;
  round: number;
  boss?: boolean;
}

export interface MapReward {
  gold: number;
  experience: number;
  items: string[];
}

export interface RecruitmentCharacter {
  class: string;
  level: number;
  cost: number;
  stats: Stats;
}

export interface GameMap {
  id: string;
  name: string;
  type: "monster" | "recruitment";
  description: string;
  backgroundImage: string;
  rounds?: number;
  monsters?: MapMonster[];
  rewards?: MapReward;
  recruitmentCost?: number;
  availableCharacters?: RecruitmentCharacter[];
}

export interface WorldMapRegion {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  unlocked: boolean;
  unlockRequirement?: {
    completedMaps: string[];
    playerLevel: number;
  };
  maps: string[];
}

export interface WorldMapConnection {
  from: string;
  to: string;
  path: string;
}

export interface WorldMap {
  name: string;
  description: string;
  regions: WorldMapRegion[];
  connections: WorldMapConnection[];
}

export interface GameState {
  player: {
    name: string;
    level: number;
    experience: number;
    gold: number;
  };
  party: Character[];
  completedMaps: string[];
  unlockedRegions: string[];
  currentMap?: string;
  inventory: { [itemId: string]: number };
  currentScreen?: "menu" | "worldMap" | "battle" | "recruitment";
  currentBattle?: {
    mapId: string;
    enemies: string[]; // Monster IDs
    state?: BattleState;
  };
}

export interface BattleAction {
  type: "attack" | "move" | "item" | "guard";
  source: BattleCharacter;
  target?: BattleCharacter;
  moveId?: string;
  itemId?: string;
}

export interface BattleState {
  characters: BattleCharacter[];
  currentRound: number;
  totalRounds: number;
  currentTurn: number;
  isPlayerTurn: boolean;
  actionQueue: BattleAction[];
  battleLog: string[];
}
