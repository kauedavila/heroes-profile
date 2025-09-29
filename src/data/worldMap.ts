import { WorldMap } from '../types/game';

export const WORLD_MAP: WorldMap = {
  name: "Midgard",
  description: "A vast world filled with dangers and opportunities",
  regions: [
    {
      id: "starting_plains",
      name: "Starting Plains",
      description: "Peaceful grasslands perfect for new adventurers",
      position: { x: 100, y: 200 },
      unlocked: true,
      maps: ["plains_monsters_01", "village_recruitment_01"]
    },
    {
      id: "dark_forest",
      name: "Dark Forest",
      description: "Ancient woods where shadows hide dangerous creatures",
      position: { x: 300, y: 150 },
      unlocked: false,
      unlockRequirement: {
        completedMaps: ["plains_monsters_01"],
        playerLevel: 3
      },
      maps: ["forest_monsters_01", "forest_monsters_02", "druid_recruitment_01"]
    }
  ],
  connections: [
    {
      from: "starting_plains",
      to: "dark_forest",
      path: "forest_path"
    }
  ]
};