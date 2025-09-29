import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { WorldMapScreen } from './src/screens/WorldMapScreen';
import { BattleScreen } from './src/screens/BattleScreen';
import { GameState, GameMap, Monster } from './src/types/game';
import { storageService } from './src/services/storageService';
import { GameDataService } from './src/services/gameDataService';

type GameScreen = 'menu' | 'worldMap' | 'battle' | 'recruitment';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(null);
  const [battleEnemies, setBattleEnemies] = useState<Monster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameDataService, setGameDataService] = useState<GameDataService | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    setIsLoading(true);
    try {
      // Initialize game data service from YAML
      const service = await GameDataService.createFromYaml();
      await service.initialize();
      setGameDataService(service);
      
      // Try to load existing game state
      const savedState = await storageService.loadGameState();
      if (savedState) {
        setGameState(savedState);
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      Alert.alert('Error', 'Failed to initialize game data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGame = async () => {
    try {
      const newGameState = await storageService.createNewGame();
      setGameState(newGameState);
      setCurrentScreen('worldMap');
    } catch (error) {
      Alert.alert('Error', 'Failed to create new game.');
    }
  };

  const handleLoadGame = (loadedGameState: GameState) => {
    setGameState(loadedGameState);
    setCurrentScreen('worldMap');
  };

  const handleOptions = () => {
    Alert.alert(
      'Options',
      'Game options and settings will be available in future updates.',
      [{ text: 'OK' }]
    );
  };

  const handleMapSelect = async (mapId: string) => {
    if (!gameDataService) {
      Alert.alert('Error', 'Game data not loaded.');
      return;
    }

    try {
      const maps = await gameDataService.loadMaps();
      const selectedMap = maps.find(map => map.id === mapId);
      
      if (!selectedMap) {
        Alert.alert('Error', 'Map not found.');
        return;
      }

      setCurrentMap(selectedMap);

      if (selectedMap.type === 'monster') {
        // Start battle
        await startBattle(selectedMap);
      } else if (selectedMap.type === 'recruitment') {
        // Show recruitment screen
        handleRecruitment(selectedMap);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load map.');
    }
  };

  const startBattle = async (map: GameMap) => {
    if (!map.monsters || !gameState || !gameDataService) return;

    try {
      const monsters = await gameDataService.loadMonsters();
      const battleEnemies: Monster[] = [];

      // Get monsters for the first round (for simplicity)
      const firstRoundMonsters = map.monsters.filter(m => m.round === 1);
      
      for (const mapMonster of firstRoundMonsters) {
        const monster = monsters.find(m => m.id === mapMonster.id);
        if (monster) {
          // Add multiple copies based on quantity
          for (let i = 0; i < mapMonster.quantity; i++) {
            battleEnemies.push({ ...monster });
          }
        }
      }

      setBattleEnemies(battleEnemies);
      setCurrentScreen('battle');
    } catch (error) {
      Alert.alert('Error', 'Failed to start battle.');
    }
  };

  const handleBattleEnd = async (victory: boolean, rewards?: any) => {
    if (!gameState || !currentMap) return;

    if (victory) {
      // Apply rewards
      const updatedGameState = { ...gameState };
      
      if (rewards) {
        updatedGameState.player.gold += rewards.gold || 0;
        updatedGameState.player.experience += rewards.experience || 0;
        
        // Add items to inventory
        if (rewards.items) {
          rewards.items.forEach((item: string) => {
            updatedGameState.inventory[item] = (updatedGameState.inventory[item] || 0) + 1;
          });
        }
      }

      // Mark map as completed
      if (!updatedGameState.completedMaps.includes(currentMap.id)) {
        updatedGameState.completedMaps.push(currentMap.id);
      }

      // Level up check (simplified)
      const expNeeded = updatedGameState.player.level * 100;
      if (updatedGameState.player.experience >= expNeeded) {
        updatedGameState.player.level++;
        updatedGameState.player.experience -= expNeeded;
        
        Alert.alert('Level Up!', `You reached level ${updatedGameState.player.level}!`);
      }

      // Update party experience and stats
      updatedGameState.party.forEach(character => {
        character.experience += Math.floor((rewards?.experience || 0) / updatedGameState.party.length);
        
        // Simple level up for characters
        const charExpNeeded = character.level * 80;
        if (character.experience >= charExpNeeded) {
          character.level++;
          character.experience -= charExpNeeded;
          
          // Increase stats
          character.stats.hp += 5;
          character.stats.attack += 2;
          character.stats.defense += 1;
          character.stats.speed += 1;
          character.stats.magic += 1;
        }
      });

      setGameState(updatedGameState);
      await storageService.saveGameState(updatedGameState);

      Alert.alert(
        'Victory!',
        `Gained ${rewards?.gold || 0} gold and ${rewards?.experience || 0} experience!`,
        [{ text: 'Continue', onPress: () => setCurrentScreen('worldMap') }]
      );
    } else {
      Alert.alert(
        'Defeat!',
        'Your party has been defeated. You lose some gold but keep your progress.',
        [
          { 
            text: 'Continue', 
            onPress: () => {
              // Lose some gold as penalty
              const updatedGameState = { ...gameState };
              updatedGameState.player.gold = Math.max(0, Math.floor(gameState.player.gold * 0.8));
              setGameState(updatedGameState);
              storageService.saveGameState(updatedGameState);
              setCurrentScreen('worldMap');
            }
          }
        ]
      );
    }
  };

  const handleRecruitment = (map: GameMap) => {
    if (!map.availableCharacters || !gameState) return;

    const characterOptions = map.availableCharacters.map((char, index) => ({
      text: `${char.class} (Lv.${char.level}) - ${char.cost} gold`,
      onPress: () => recruitCharacter(char, map.recruitmentCost || 0)
    }));

    Alert.alert(
      'Recruitment',
      `Welcome to ${map.name}! Choose a character to recruit:`,
      [
        ...characterOptions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const recruitCharacter = async (recruitmentChar: any, baseCost: number) => {
    if (!gameState) return;

    const totalCost = recruitmentChar.cost + baseCost;
    
    if (gameState.player.gold < totalCost) {
      Alert.alert('Insufficient Gold', `You need ${totalCost} gold to recruit this character.`);
      return;
    }

    const newCharacter = {
      id: `recruited_${Date.now()}`,
      name: `${recruitmentChar.class.charAt(0).toUpperCase() + recruitmentChar.class.slice(1)}`,
      class: recruitmentChar.class,
      level: recruitmentChar.level,
      stats: { ...recruitmentChar.stats },
      experience: 0,
      abilities: ['Attack', 'Guard'], // Basic abilities
      equipment: {}
    };

    const updatedGameState = { ...gameState };
    updatedGameState.player.gold -= totalCost;
    updatedGameState.party.push(newCharacter);

    setGameState(updatedGameState);
    await storageService.saveGameState(updatedGameState);

    Alert.alert(
      'Recruitment Successful!',
      `${newCharacter.name} has joined your party!`,
      [{ text: 'Continue', onPress: () => setCurrentScreen('worldMap') }]
    );
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  if (isLoading) {
    return null; // Could show a loading screen here
  }

  switch (currentScreen) {
    case 'menu':
      return (
        <>
          <MainMenuScreen
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
            onOptions={handleOptions}
          />
          <StatusBar style="light" />
        </>
      );

    case 'worldMap':
      if (!gameState) {
        setCurrentScreen('menu');
        return null;
      }
      return (
        <>
          <WorldMapScreen
            gameState={gameState}
            onMapSelect={handleMapSelect}
            onBack={handleBackToMenu}
          />
          <StatusBar style="light" />
        </>
      );

    case 'battle':
      if (!gameState || battleEnemies.length === 0) {
        setCurrentScreen('worldMap');
        return null;
      }
      return (
        <>
          <BattleScreen
            playerParty={gameState.party}
            enemies={battleEnemies}
            onBattleEnd={handleBattleEnd}
          />
          <StatusBar style="light" />
        </>
      );

    default:
      setCurrentScreen('menu');
      return null;
  }
}