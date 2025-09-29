import { Monster } from '../types/game';

export const MONSTERS: Monster[] = [
  {
    id: "goblin_01",
    name: "Goblin Warrior",
    image: "goblin_warrior.png",
    level: 1,
    stats: {
      hp: 45,
      attack: 12,
      defense: 8,
      speed: 15,
      magic: 2
    },
    abilities: ["Slash", "Guard"],
    rewards: {
      gold: 25,
      experience: 30
    },
    dropItems: [
      { item: "rusty_sword", chance: 0.1 },
      { item: "healing_potion", chance: 0.3 }
    ]
  },
  {
    id: "orc_01",
    name: "Orc Brute",
    image: "orc_brute.png",
    level: 3,
    stats: {
      hp: 75,
      attack: 18,
      defense: 12,
      speed: 8,
      magic: 0
    },
    abilities: ["Heavy Strike", "Intimidate", "Berserk"],
    rewards: {
      gold: 45,
      experience: 55
    },
    dropItems: [
      { item: "iron_axe", chance: 0.15 },
      { item: "leather_armor", chance: 0.2 }
    ]
  },
  {
    id: "skeleton_01",
    name: "Skeleton Archer",
    image: "skeleton_archer.png",
    level: 2,
    stats: {
      hp: 35,
      attack: 16,
      defense: 6,
      speed: 20,
      magic: 5
    },
    abilities: ["Arrow Shot", "Bone Throw", "Poison Arrow"],
    rewards: {
      gold: 35,
      experience: 40
    },
    dropItems: [
      { item: "bone_bow", chance: 0.12 },
      { item: "antidote", chance: 0.25 }
    ]
  },
  {
    id: "fire_elemental_01",
    name: "Fire Elemental",
    image: "fire_elemental.png",
    level: 5,
    stats: {
      hp: 90,
      attack: 25,
      defense: 10,
      speed: 12,
      magic: 30
    },
    abilities: ["Fireball", "Flame Burst", "Ignite", "Fire Shield"],
    rewards: {
      gold: 75,
      experience: 85
    },
    dropItems: [
      { item: "fire_gem", chance: 0.2 },
      { item: "flame_staff", chance: 0.08 }
    ]
  },
  {
    id: "dragon_01",
    name: "Young Dragon",
    image: "young_dragon.png",
    level: 10,
    stats: {
      hp: 200,
      attack: 45,
      defense: 25,
      speed: 18,
      magic: 40
    },
    abilities: ["Dragon Breath", "Claw Strike", "Wing Gust", "Roar", "Fire Storm"],
    rewards: {
      gold: 200,
      experience: 250
    },
    dropItems: [
      { item: "dragon_scale", chance: 0.3 },
      { item: "dragon_sword", chance: 0.05 },
      { item: "rare_gem", chance: 0.15 }
    ]
  }
];