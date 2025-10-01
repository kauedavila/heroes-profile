# Lobby System - Party Management

## Overview
The lobby system replaces the world map as the main screen after starting or loading a game. It provides comprehensive party management functionality, allowing players to organize their characters for battle.

## Features Implemented

### 1. Lobby Screen
- **Location**: `src/screens/LobbyScreen.tsx`
- Displays the background of the last visited map (stored in `GameState.lastMapBackground`)
- Falls back to a default background if no map has been visited yet
- Provides navigation to:
  - World Map (to select missions)
  - Main Menu (to save/load/quit)

### 2. Party Management
- **Maximum Party Size**: 4 active characters
- **Reserve System**: Unlimited reserve capacity for characters not in the active party
- Characters can be moved between party and reserve
- Each character displays:
  - Name, class, and level
  - Stats (HP, Attack, Defense, Speed, Magic)
  - Potential (if applicable)
  - Current position (Front/Back row)

### 3. Battle Positioning System

#### Front Row
- Default position for all characters
- Normal damage dealt and received
- **Higher target priority**: 70% chance to be targeted by enemy AI when both rows exist

#### Back Row
- **Half damage dealt**: All attacks and abilities deal 50% damage
- **Half damage received**: All incoming damage is reduced by 50%
- **Lower target priority**: 30% chance to be targeted when front row exists
- Visual distinction in battle (slightly transparent and smaller)

#### Position Toggle
- Players can toggle character position between front and back row from the lobby
- Position is persistent across battles and saves

### 4. Monster Positioning
- Monsters default to front row
- Can be configured per monster in the database by setting the `position` field to "back"
- Example in `src/data/monsters.ts`:
```typescript
{
  id: "monster_id",
  name: "Monster Name",
  // ... other properties
  position: "back" // Optional, defaults to "front"
}
```

### 5. Battle Screen Updates
- Visual indicators show character positions (FRONT/BACK badges)
- Back row characters are rendered with:
  - 85% opacity
  - 90% scale
  - Blue badge (vs. green for front row)

### 6. Data Persistence
- Character positions saved in game state
- Reserve array saved in game state
- Last visited map background saved
- Automatic migration for existing saves (adds missing fields)

## Type Definitions

### Character Interface
```typescript
export interface Character {
  // ... existing fields
  position?: "front" | "back"; // Battle position (default: front)
}
```

### Monster Interface
```typescript
export interface Monster {
  // ... existing fields
  position?: "front" | "back"; // Battle position (default: front)
}
```

### GameState Interface
```typescript
export interface GameState {
  // ... existing fields
  party: Character[]; // Active party (max 4)
  reserve: Character[]; // Reserve characters
  lastMapBackground?: string; // Background image of last visited map
}
```

## Navigation Flow

```
Main Menu
    ↓
  Lobby (NEW DEFAULT)
    ↓ ↔ World Map
    ↓     ↓
    ↓   Battle
    ↓     ↓
    ↓   Victory/Defeat
    ↓     ↓
  ← ← ← Lobby
```

## Battle Mechanics

### Damage Calculation
```typescript
// Attacker in back row
damage = baseDamage * 0.5;

// Defender in back row
damageReceived = incomingDamage * 0.5;

// Both in back row
finalDamage = baseDamage * 0.5 * 0.5 = baseDamage * 0.25
```

### AI Target Selection
```typescript
// Priority logic
if (frontRowTargets.length > 0 && random() < 0.7) {
  target = randomFrontRowTarget;
} else if (backRowTargets.length > 0) {
  target = randomBackRowTarget;
}
```

## Usage Examples

### Moving Characters
1. Open Lobby screen
2. Tap on a character in the party
3. Tap "Reserve" button to move to reserve
4. Tap on a reserve character
5. Tap "Add to Party" to move back (if party not full)

### Changing Position
1. Open Lobby screen
2. Tap on a character in the active party
3. Tap "→ Back" to move to back row (or "→ Front" to move to front)
4. Position is immediately saved and used in next battle

### Recruitment
- When party is full (4 characters), new recruits automatically go to reserve
- Success message indicates whether character joined party or reserve

## Files Modified

1. **App.tsx**
   - Added LobbyScreen import and component
   - Changed default screen from "worldMap" to "lobby"
   - Added `handleUpdateGameState` for lobby state updates
   - Added `handleWorldMapFromLobby` and `handleBackToLobby` navigation
   - Updated recruitment to handle party size limits
   - Track last map background

2. **src/types/game.ts**
   - Added `position` field to Character interface
   - Added `position` field to Monster interface
   - Added `position` field to BattleCharacter interface (required)
   - Added `reserve` array to GameState
   - Added `lastMapBackground` to GameState
   - Added "lobby" to screen type union

3. **src/services/storageService.ts**
   - Added `reserve: []` to new game state
   - Added `position: 'front'` to default character
   - Added migration logic in `loadGameState`
   - Added migration logic in `loadGameFromSlot`

4. **src/services/battleSystem.ts**
   - Initialize characters with position from Character/Monster data
   - Updated `performAIAction` with position-based targeting
   - Updated `performAttack` with position damage modifiers
   - Updated `performMove` with position damage modifiers

5. **src/screens/BattleScreen.tsx**
   - Added position indicator display
   - Added back row visual styling
   - Added position-aware character rendering

6. **src/screens/LobbyScreen.tsx** (NEW)
   - Complete party management interface
   - Character movement between party/reserve
   - Position toggle functionality
   - Character stats display
   - Navigation controls

## Future Enhancements

- Add drag-and-drop for character reordering
- Add formation presets (save/load party configurations)
- Add character portraits/images
- Add equipment management in lobby
- Add skill/ability assignment
- Create custom starting_town.png background image
