# Heroes Profile - Horizontal RPG Game

A MERN stack monorepo featuring a horizontal RPG game with authentication, character management, and VIP systems built with Expo and React Native.

## 🎮 Features

### Authentication & User Management
- ✅ Email/Password authentication
- ✅ JWT tokens with refresh mechanism
- ✅ Secure token storage (SecureStore)
- 🚧 Google OAuth integration (structure ready)
- ✅ User roles (Master/User)
- ✅ VIP system with levels 1-5

### Game Features
- ✅ Horizontal RPG gameplay
- ✅ Character creation (Warrior, Mage, Archer, Rogue)
- ✅ Stage-based progression system
- ✅ Battle system with rewards
- ✅ Gold and experience points
- ✅ VIP bonuses and exclusive features
- ✅ Item shop system
- 🚧 Auto-battle (VIP feature)

### Tech Stack
- **Frontend**: React Native, Expo, React Native Paper
- **State Management**: Zustand
- **API**: React Query, Axios with interceptors
- **Storage**: SecureStore, AsyncStorage
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens

## 🏗 Project Structure

```
├── apps/
│   ├── backend/          # Node.js API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/     # MongoDB models
│   │   │   ├── routes/     # API endpoints
│   │   │   ├── middleware/ # Auth middleware
│   │   │   └── services/   # Business logic
│   │   └── package.json
│   └── mobile/           # React Native Expo app
│       ├── src/
│       │   ├── components/ # Atomic Design structure
│       │   ├── screens/    # App screens
│       │   ├── navigation/ # Navigation setup
│       │   ├── store/      # Zustand stores
│       │   ├── services/   # API & storage services
│       │   └── types/      # TypeScript definitions
│       └── package.json
├── packages/             # Shared packages (future)
└── package.json         # Workspace configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Expo CLI
- iOS Simulator / Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kauedavila/heroes-profile.git
   cd heroes-profile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit the .env file with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using local MongoDB
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the backend server**
   ```bash
   npm run dev:backend
   ```

6. **Start the mobile app**
   ```bash
   npm run dev:mobile
   ```

### Development Scripts

```bash
# Start both backend and mobile
npm run dev

# Backend only
npm run dev:backend

# Mobile only  
npm run dev:mobile

# Build all apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## 🎯 Game Mechanics

### Character Classes
- **Warrior** ⚔️: High health and defense
- **Mage** 🔮: High attack, low defense
- **Archer** 🏹: Balanced stats with good speed
- **Rogue** 🗡️: High speed and moderate attack

### VIP System
- **Level 1-5**: Increasing rewards and bonuses
- **VIP Shop**: Exclusive items and equipment
- **Auto-Battle**: Passive gameplay feature
- **Enhanced Rewards**: Multiplied gold and XP

### Progression System
- Stage-based horizontal progression
- Character leveling and stat growth
- Equipment and inventory system
- Gold-based economy

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Game
- `GET /api/game/state` - Get game state
- `POST /api/game/character` - Create character
- `POST /api/game/battle` - Battle stage
- `GET /api/game/shop` - Get shop items
- `POST /api/game/shop/purchase` - Purchase item
- `POST /api/game/auto-battle` - Auto-battle (VIP)

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/game-data` - Update game data
- `POST /api/users/grant-vip` - Grant VIP (Master only)

## 🎨 UI/UX Design

### Atomic Design Structure
- **Atoms**: Button, Input, Card components
- **Molecules**: Form groups, stat displays
- **Organisms**: Character lists, shop interface
- **Templates**: Screen layouts
- **Pages**: Complete screens

### Theme
- Dark theme optimized for gaming
- Horizontal landscape orientation
- RPG-inspired color scheme
- Responsive design for various screen sizes

## 📱 Mobile Features

### Storage
- **SecureStore**: Authentication tokens
- **AsyncStorage**: User preferences, game settings
- **Offline Support**: Basic data caching

### Navigation
- Stack navigation for auth flow
- Bottom tabs for main game areas
- Modal presentations for battles

## 🔧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Atomic Design for component organization
- Error boundaries for crash prevention

### Security
- JWT token authentication
- Secure token storage
- API request/response validation
- Role-based access control

## 🚧 Roadmap

- [ ] Google OAuth integration
- [ ] Push notifications
- [ ] Real-time multiplayer features
- [ ] Advanced battle animations
- [ ] Guild/clan system
- [ ] Trading between players
- [ ] Daily quests and challenges
- [ ] Achievement system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by the Heroes Profile team.