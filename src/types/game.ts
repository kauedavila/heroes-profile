export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  magic: number;
}

export interface DropItem {
  item: string;
  chance: number;
}

export interface Monster {
  id: string;
  name: string;
  image: string;
  level: number;
  stats: Stats;
  abilities: string[];
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
  abilities: string[];
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
  type: 'monster' | 'recruitment';
  description: string;
  backgroundImage: string;
  difficulty?: number;
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
}

export interface BattleAction {
  type: 'attack' | 'ability' | 'item' | 'guard';
  source: BattleCharacter;
  target?: BattleCharacter;
  abilityId?: string;
  itemId?: string;
}

export interface BattleState {
  characters: BattleCharacter[];
  currentRound: number;
  totalRounds: number;
  isPlayerTurn: boolean;
  actionQueue: BattleAction[];
  battleLog: string[];
}