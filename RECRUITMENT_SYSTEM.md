# Recruitment System - Monster Database Integration

## Overview
The recruitment system has been updated to use the monster database as the source of truth for character stats. Instead of defining character stats inline in map data, recruitment maps now reference monsters by ID.

## How It Works

### 1. Type Structure
```typescript
// In src/types/game.ts
export interface RecruitmentCharacter {
  id: string;        // Monster ID from monster database
  cost: number;      // Cost to recruit this character
}
```

### 2. Map Configuration
```typescript
// In src/data/maps.ts
{
  id: "village_recruitment_01",
  name: "Peaceful Village",
  type: "recruitment",
  description: "A small village where heroes can be recruited",
  backgroundImage: "village_bg.png",
  recruitmentCost: 100,  // Base recruitment cost
  availableCharacters: [
    {
      id: "slime_icei",  // References monster from monsters.ts
      cost: 150,          // Additional cost for this specific character
    },
  ],
}
```

### 3. Recruitment Flow
When a player enters a recruitment map:
1. The system loads all monsters from the monster database
2. For each `availableCharacters` entry, it finds the corresponding monster by ID
3. The recruitment UI displays: `{monster.name} (Lv.{monster.level}) - {cost} gold`
4. When recruited, the character uses:
   - **Name**: Monster's name
   - **Level**: Monster's level
   - **Stats**: Monster's stats (randomized between 0.5x to 2x)
   - **Moves**: Monster's moves (or basic moves if none defined)
   - **Class**: Monster's name (as the class)

### 4. Total Cost Calculation
```
Total Cost = recruitmentCost + character.cost
```

For example:
- Base recruitment cost: 100 gold
- Character cost: 150 gold
- **Total**: 250 gold

## Adding New Recruitable Characters

### Step 1: Ensure Monster Exists in Database
Make sure the monster you want to make recruitable is defined in `src/data/monsters.ts`:

```typescript
// In src/data/monsters.ts
export const MONSTERS: Monster[] = [
  {
    id: "slime_icei",
    name: "Ice Slime",
    level: 2,
    stats: {
      hp: 30,
      attack: 8,
      defense: 6,
      speed: 10,
      magic: 5,
    },
    moves: ["freeze", "bounce"],
    // ... other properties
  },
  // Add more monsters here
];
```

### Step 2: Add to Recruitment Map
Add the monster ID to a recruitment map's `availableCharacters`:

```typescript
// In src/data/maps.ts
{
  id: "village_recruitment_01",
  name: "Peaceful Village",
  type: "recruitment",
  recruitmentCost: 100,
  availableCharacters: [
    { id: "slime_icei", cost: 150 },
    { id: "another_monster", cost: 200 },  // Add more options
  ],
}
```

## Benefits of This Approach

1. **Single Source of Truth**: Monster stats are defined once in the monster database
2. **Consistency**: Characters recruited will have the same base stats as the monsters they're based on
3. **Easy Maintenance**: Update a monster's stats in one place, and it affects both battles and recruitment
4. **Reduced Duplication**: No need to duplicate stat data between monsters and recruitment
5. **Flexibility**: Can easily add any monster to any recruitment map by just referencing its ID

## Example Usage

### Creating a New Recruitment Map
```typescript
{
  id: "mountain_village",
  name: "Mountain Village",
  type: "recruitment",
  description: "A remote village in the mountains",
  backgroundImage: "mountain_bg.png",
  recruitmentCost: 200,  // Higher base cost
  availableCharacters: [
    { id: "slime_icei", cost: 100 },      // Ice Slime for 300 total
    { id: "fire_golem", cost: 250 },      // Fire Golem for 450 total
    { id: "wind_elemental", cost: 180 },  // Wind Elemental for 380 total
  ],
}
```

### Code Flow
```
Player selects recruitment map
    ↓
handleRecruitment() loads monsters from database
    ↓
Maps availableCharacters IDs to actual Monster objects
    ↓
Displays Alert with options
    ↓
Player selects a monster
    ↓
recruitCharacter() creates a Character from Monster data
    ↓
Stats are randomized (0.5x to 2x base)
    ↓
Character added to party or reserve
```

## Error Handling

- If a monster ID is not found in the database, it's logged to console and skipped
- If no valid characters are available, an error alert is shown
- TypeScript ensures type safety throughout the recruitment flow

## Future Enhancements

Potential improvements to consider:
- Allow recruitment maps to specify level overrides for monsters
- Add rarity/quality tiers for recruited characters
- Support for recruiting multiple characters at once
- Custom move sets per recruitment option
