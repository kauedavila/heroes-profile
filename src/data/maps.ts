import { GameMap } from '../types/game';

export const MAPS: GameMap[] = [
  // Plains area maps
  {
    id: "plains_monsters_01",
    name: "Goblin Outpost",
    type: "monster",
    description: "A small outpost overrun by goblins",
    backgroundImage: "plains_bg.png",
    difficulty: 1,
    rounds: 3,
    monsters: [
      { id: "goblin_01", quantity: 2, round: 1 },
      { id: "goblin_01", quantity: 3, round: 2 },
      { id: "goblin_01", quantity: 1, round: 3, boss: true }
    ],
    rewards: {
      gold: 150,
      experience: 200,
      items: ["basic_sword", "leather_vest"]
    }
  },
  {
    id: "village_recruitment_01",
    name: "Peaceful Village",
    type: "recruitment",
    description: "A small village where heroes can be recruited",
    backgroundImage: "village_bg.png",
    recruitmentCost: 100,
    availableCharacters: [
      {
        class: "warrior",
        level: 1,
        cost: 150,
        stats: { hp: 80, attack: 15, defense: 12, speed: 8, magic: 2 }
      },
      {
        class: "archer",
        level: 1,
        cost: 120,
        stats: { hp: 60, attack: 12, defense: 8, speed: 15, magic: 5 }
      },
      {
        class: "mage",
        level: 1,
        cost: 180,
        stats: { hp: 45, attack: 8, defense: 6, speed: 10, magic: 20 }
      }
    ]
  },
  // Forest area maps
  {
    id: "forest_monsters_01",
    name: "Haunted Grove",
    type: "monster",
    description: "Undead creatures roam these cursed woods",
    backgroundImage: "forest_bg.png",
    difficulty: 2,
    rounds: 4,
    monsters: [
      { id: "skeleton_01", quantity: 2, round: 1 },
      { id: "skeleton_01", quantity: 1, round: 2 },
      { id: "goblin_01", quantity: 2, round: 2 },
      { id: "skeleton_01", quantity: 3, round: 3 },
      { id: "orc_01", quantity: 1, round: 4, boss: true }
    ],
    rewards: {
      gold: 300,
      experience: 400,
      items: ["silver_sword", "chain_mail"]
    }
  },
  {
    id: "forest_monsters_02",
    name: "Ancient Grove",
    type: "monster",
    description: "Deep in the forest, ancient magic still lingers",
    backgroundImage: "forest_deep_bg.png",
    difficulty: 3,
    rounds: 5,
    monsters: [
      { id: "skeleton_01", quantity: 3, round: 1 },
      { id: "orc_01", quantity: 2, round: 2 },
      { id: "fire_elemental_01", quantity: 1, round: 3 },
      { id: "orc_01", quantity: 2, round: 4 },
      { id: "fire_elemental_01", quantity: 1, round: 5, boss: true }
    ],
    rewards: {
      gold: 500,
      experience: 600,
      items: ["magic_sword", "forest_cloak"]
    }
  },
  {
    id: "druid_recruitment_01",
    name: "Druid Circle",
    type: "recruitment",
    description: "Ancient druids offer their services to worthy heroes",
    backgroundImage: "druid_circle_bg.png",
    recruitmentCost: 200,
    availableCharacters: [
      {
        class: "druid",
        level: 2,
        cost: 250,
        stats: { hp: 70, attack: 10, defense: 8, speed: 12, magic: 25 }
      },
      {
        class: "ranger",
        level: 2,
        cost: 220,
        stats: { hp: 65, attack: 16, defense: 10, speed: 18, magic: 8 }
      }
    ]
  }
];