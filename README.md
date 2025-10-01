# Heroes Profile RPG

A turn-based RPG inspired by classic games like Chrono Trigger, built with React Native and Expo.

## 🎮 Features

### Party Management System
- **Lobby Screen**: Main hub for managing your party
- **Active Party**: Up to 4 characters in your active battle party
- **Reserve System**: Unlimited storage for backup characters
- **Character Stats**: View HP, Attack, Defense, Speed, and Magic
- **Potential System**: Character growth mechanics

### Battle Positioning System
- **Front Row**: Full damage dealt/received, high target priority (70%)
- **Back Row**: Half damage dealt/received, low target priority (30%)
- **Strategic Depth**: Position your characters to optimize survival and damage output
- **Smart AI**: Enemies intelligently target front row characters

### World Map & Battles
- Explore regions and complete missions
- Turn-based combat with action meter system
- Move cooldown mechanics
- Character leveling and stat growth

### Recruitment
- Recruit new characters from villages
- Randomized stats for replay value
- Potential system for long-term character development

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/kauedavila/heroes-profile.git

# Navigate to project directory
cd heroes-profile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

- **Web**: Press `w` in the terminal or open http://localhost:19006
- **iOS Simulator**: Press `i` (requires Xcode on macOS)
- **Android Emulator**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Screens

### Main Menu
- Start new game
- Load saved games
- Options
- About

### Lobby (Default Screen)
- View and manage active party
- Access reserve characters
- Toggle character positions (front/back row)
- Navigate to World Map or Main Menu

### World Map
- Explore different regions
- Select missions to complete
- View completed content

### Battle
- Turn-based combat system
- Action meter for turn order
- Move selection with cooldowns
- Position-based damage and targeting

## 🎯 Lobby System

The lobby system is the heart of party management. For detailed documentation:

- **English**: See [LOBBY_SYSTEM.md](LOBBY_SYSTEM.md)
- **Português**: Veja [SISTEMA_LOBBY.md](SISTEMA_LOBBY.md)
- **Implementation**: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### Quick Guide

#### Moving Characters
1. Open Lobby (default screen after loading game)
2. Tap a character in the active party
3. Tap "Reserve" to move to reserve
4. Tap a reserve character and "Add to Party" to bring back (if space available)

#### Changing Position
1. Tap a character in the active party
2. Tap "→ Back" to move to back row (or "→ Front" to move to front)
3. Position is saved automatically

## 🛠️ Technical Details

### Built With
- **React Native**: Mobile framework
- **TypeScript**: Type-safe development
- **Expo**: Development platform
- **AsyncStorage**: Local data persistence

### Project Structure
```
heroes-profile/
├── src/
│   ├── screens/         # UI screens
│   │   ├── MainMenuScreen.tsx
│   │   ├── LobbyScreen.tsx
│   │   ├── WorldMapScreen.tsx
│   │   └── BattleScreen.tsx
│   ├── services/        # Business logic
│   │   ├── battleSystem.ts
│   │   ├── gameDataService.ts
│   │   └── storageService.ts
│   ├── types/           # TypeScript definitions
│   │   └── game.ts
│   └── data/            # Game data
│       ├── maps.ts
│       ├── monsters.ts
│       ├── moves.ts
│       └── worldMap.ts
├── assets/              # Images and resources
├── App.tsx              # Main app component
└── package.json
```

## 📖 Documentation

- [LOBBY_SYSTEM.md](LOBBY_SYSTEM.md) - Complete lobby system documentation (English)
- [SISTEMA_LOBBY.md](SISTEMA_LOBBY.md) - Documentação do sistema de lobby (Português)
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details and visual guide

## 🎨 Game Mechanics

### Battle Positioning

| Position   | Damage Dealt | Damage Received | Target Priority |
|-----------|--------------|-----------------|-----------------|
| Front Row | 100%         | 100%            | 70%             |
| Back Row  | 50%          | 50%             | 30%             |

### Character Stats
- **HP**: Health points
- **Attack**: Physical damage
- **Defense**: Damage reduction
- **Speed**: Turn order (higher = faster)
- **Magic**: Magical ability power

### Potential System
- Characters have a potential value (10-20)
- Decreases by 1 each battle
- When potential > 0, character gains experience
- When potential = 0, character no longer gains experience

## 🔄 Save System

- Auto-save on game state changes
- Multiple save slots
- Automatic migration for existing saves
- Cloud save support (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Heroes Profile Team © 2024

## 🙏 Acknowledgments

- Inspired by Chrono Trigger and classic JRPGs
- Monster sprites from various pixel art sources
- Built with React Native and Expo

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: 2024
