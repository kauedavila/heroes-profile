import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import { MainMenuScreen } from "./src/screens/MainMenuScreen";
import { WorldMapScreen } from "./src/screens/WorldMapScreen";
import { BattleScreen } from "./src/screens/BattleScreen";
import { LobbyScreen } from "./src/screens/LobbyScreen";
import { GameState, GameMap, Monster } from "./src/types/game";
import { storageService } from "./src/services/storageService";
import { GameDataService } from "./src/services/gameDataService";

type GameScreen = "menu" | "worldMap" | "battle" | "recruitment" | "lobby";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("menu");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(null);
  const [battleEnemies, setBattleEnemies] = useState<Monster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameDataService, setGameDataService] =
    useState<GameDataService | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    setIsLoading(true);
    try {
      // Initialize game data service from data
      const service = await GameDataService.createFromData();
      await service.initialize();
      setGameDataService(service);

      // Try to load existing game state
      const savedState = await storageService.loadGameState();
      if (savedState) {
        setGameState(savedState);
        // Restore the current screen, defaulting to lobby if in battle
        if (savedState.currentScreen && savedState.currentScreen !== "battle") {
          setCurrentScreen(savedState.currentScreen);
        } else if (
          savedState.currentScreen === "battle" &&
          savedState.currentBattle
        ) {
          // Restore battle state if available
          setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
        }
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      Alert.alert("Error", "Failed to initialize game data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGame = async () => {
    try {
      const newGameState = await storageService.createNewGame();
      setGameState(newGameState);
      setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
    } catch (error) {
      Alert.alert("Error", "Failed to create new game.");
    }
  };

  const handleLoadGame = (loadedGameState: GameState) => {
    setGameState(loadedGameState);
    setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
  };

  const handleOptions = () => {
    Alert.alert(
      "Options",
      "Game options and settings will be available in future updates.",
      [{ text: "OK" }]
    );
  };

  const saveGameStateWithContext = async (
    screen: GameScreen,
    battleContext?: any
  ) => {
    if (!gameState) return;

    const updatedGameState = {
      ...gameState,
      currentScreen: screen,
      currentBattle: battleContext,
    };

    setGameState(updatedGameState);
    await storageService.saveGameState(updatedGameState);
  };

  const handleMapSelect = async (mapId: string) => {
    if (!gameDataService) {
      Alert.alert("Error", "Game data not loaded.");
      return;
    }

    try {
      const maps = await gameDataService.loadMaps();
      const selectedMap = maps.find((map) => map.id === mapId);

      if (!selectedMap) {
        Alert.alert("Error", "Map not found.");
        return;
      }

      setCurrentMap(selectedMap);

      // Save the map background for lobby
      if (gameState) {
        const updatedGameState = {
          ...gameState,
          lastMapBackground: selectedMap.backgroundImage,
        };
        setGameState(updatedGameState);
        await storageService.saveGameState(updatedGameState);
      }

      if (selectedMap.type === "monster") {
        // Start battle
        await startBattle(selectedMap);
      } else if (selectedMap.type === "recruitment") {
        // Show recruitment screen
        await handleRecruitment(selectedMap);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load map.");
    }
  };

  const startBattle = async (map: GameMap) => {
    if (!map.monsters || !gameState || !gameDataService) return;

    try {
      const monsters = await gameDataService.loadMonsters();
      const battleEnemies: Monster[] = [];

      // Get monsters for the first round (for simplicity)
      const firstRoundMonsters = map.monsters.filter((m) => m.round === 1);

      for (const mapMonster of firstRoundMonsters) {
        const monster = monsters.find((m) => m.id === mapMonster.id);
        if (monster) {
          // Add multiple copies based on quantity
          for (let i = 0; i < mapMonster.quantity; i++) {
            battleEnemies.push({ ...monster });
          }
        }
      }

      setBattleEnemies(battleEnemies);

      // Save game state with battle context
      const battleContext = {
        mapId: map.id,
        enemies: firstRoundMonsters.map((m) => m.id),
      };
      await saveGameStateWithContext("battle", battleContext);

      setCurrentScreen("battle");
    } catch (error) {
      Alert.alert("Error", "Failed to start battle.");
    }
  };

  const handleBattleEnd = async (victory: boolean, rewards?: any) => {
    if (!gameState || !currentMap) return;

    if (victory) {
      // Apply rewards
      const updatedGameState = { ...gameState };

      if (rewards) {
        updatedGameState.player.gold += rewards.gold || 0;

        // Add items to inventory
        if (rewards.items) {
          rewards.items.forEach((item: string) => {
            updatedGameState.inventory[item] =
              (updatedGameState.inventory[item] || 0) + 1;
          });
        }
      }

      // Mark map as completed
      if (!updatedGameState.completedMaps.includes(currentMap.id)) {
        updatedGameState.completedMaps.push(currentMap.id);
      }

      // Update party: decrease potential and grant experience
      updatedGameState.party.forEach((character) => {
        // Decrease potential by 1 per round
        if (character.potential !== undefined && character.potential > 0) {
          character.potential = Math.max(0, character.potential - 1);
        }

        // Only gain experience if potential > 0
        if (character.potential === undefined || character.potential > 0) {
          character.experience += Math.floor(
            (rewards?.experience || 0) / updatedGameState.party.length
          );

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
        }
      });

      // Update player level to be the average of party levels (minimum 1)
      const partyAverageLevel =
        updatedGameState.party.length > 0
          ? Math.max(
              1,
              Math.floor(
                updatedGameState.party.reduce(
                  (sum, char) => sum + char.level,
                  0
                ) / updatedGameState.party.length
              )
            )
          : 1;
      updatedGameState.player.level = partyAverageLevel;

      setGameState(updatedGameState);
      await storageService.saveGameState(updatedGameState);

      Alert.alert(
        "Victory!",
        `Gained ${rewards?.gold || 0} gold and ${
          rewards?.experience || 0
        } experience!`,
        [
          {
            text: "Continue",
            onPress: () => {
              // Wrap async call in void to satisfy Alert.alert type requirements
              void (async () => {
                await saveGameStateWithContext("lobby");
                setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
              })();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Defeat!",
        "Your party has been defeated. You lose some gold but keep your progress.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Wrap async call in void to satisfy Alert.alert type requirements
              void (async () => {
                // Lose some gold as penalty
                const updatedGameState = { ...gameState };
                updatedGameState.player.gold = Math.max(
                  0,
                  Math.floor(gameState.player.gold * 0.8)
                );
                setGameState(updatedGameState);
                await saveGameStateWithContext("lobby");
                setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
              })();
            },
          },
        ]
      );
    }
  };

  const handleRecruitment = async (map: GameMap) => {
    if (!map.availableCharacters || !gameState || !gameDataService) return;

    try {
      // Load monsters from the database
      const monsters = await gameDataService.loadMonsters();
      
      // Map availableCharacters to actual monster data
      const characterOptions = map.availableCharacters
        .map((recruitChar) => {
          const monster = monsters.find((m) => m.id === recruitChar.id);
          if (!monster) {
            console.error(`Monster with id ${recruitChar.id} not found`);
            return null;
          }
          
          return {
            text: `${monster.name} (Lv.${monster.level}) - ${recruitChar.cost} gold`,
            onPress: () => {
              // Wrap async call in void to satisfy Alert.alert type requirements
              void recruitCharacter(monster, recruitChar.cost, map.recruitmentCost || 0);
            },
          };
        })
        .filter((option): option is { text: string; onPress: () => void } => option !== null);

      if (characterOptions.length === 0) {
        Alert.alert("Error", "No characters available for recruitment.");
        return;
      }

      Alert.alert(
        "Recruitment",
        `Welcome to ${map.name}! Choose a character to recruit:`,
        [...characterOptions, { text: "Cancel", style: "cancel" as const }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to load recruitment options.");
    }
  };

  const recruitCharacter = async (monster: Monster, characterCost: number, baseCost: number) => {
    if (!gameState) return;

    const totalCost = characterCost + baseCost;

    if (gameState.player.gold < totalCost) {
      Alert.alert(
        "Insufficient Gold",
        `You need ${totalCost} gold to recruit this character.`
      );
      return;
    }

    // Randomize stats: each stat can be 0.5x to 2x the base value
    const randomizeStat = (baseStat: number): number => {
      const multiplier = 0.5 + Math.random() * 1.5; // 0.5 to 2.0
      return Math.round(baseStat * multiplier);
    };

    const randomizedStats = {
      hp: randomizeStat(monster.stats.hp),
      attack: randomizeStat(monster.stats.attack),
      defense: randomizeStat(monster.stats.defense),
      speed: randomizeStat(monster.stats.speed),
      magic: randomizeStat(monster.stats.magic),
    };

    // Generate random potential between 10 and 20
    const potential = 10 + Math.floor(Math.random() * 11); // 10 to 20

    const newCharacter = {
      id: `recruited_${Date.now()}`,
      name: monster.name,
      class: monster.name, // Use monster name as class
      level: monster.level,
      stats: randomizedStats,
      baseStats: { ...monster.stats }, // Store original base stats
      experience: 0,
      moves: monster.moves.length > 0 ? monster.moves : ["basic_attack", "guard"], // Use monster moves or basic moves
      equipment: {},
      potential: potential,
      position: "front" as const, // Default position
    };

    const updatedGameState = { ...gameState };
    updatedGameState.player.gold -= totalCost;
    
    const MAX_PARTY_SIZE = 4;
    if (updatedGameState.party.length < MAX_PARTY_SIZE) {
      updatedGameState.party.push(newCharacter);
    } else {
      // Party is full, add to reserve
      if (!updatedGameState.reserve) {
        updatedGameState.reserve = [];
      }
      updatedGameState.reserve.push(newCharacter);
    }

    setGameState(updatedGameState);
    await storageService.saveGameState(updatedGameState);

    const destination = updatedGameState.party.length < MAX_PARTY_SIZE ? "party" : "reserve";
    Alert.alert(
      "Recruitment Successful!",
      `${newCharacter.name} has joined your ${destination} with ${potential} potential!`,
      [{ text: "Continue", onPress: () => setCurrentScreen("lobby") }] // Changed from "worldMap" to "lobby"
    );
  };

  const handleBackToMenu = () => {
    setCurrentScreen("menu");
  };

  const handleUpdateGameState = async (updatedGameState: GameState) => {
    setGameState(updatedGameState);
    await storageService.saveGameState(updatedGameState);
  };

  const handleWorldMapFromLobby = () => {
    setCurrentScreen("worldMap");
  };

  const handleBackToLobby = () => {
    setCurrentScreen("lobby");
  };

  if (isLoading) {
    return null; // Could show a loading screen here
  }

  switch (currentScreen) {
    case "menu":
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

    case "lobby":
      if (!gameState) {
        setCurrentScreen("menu");
        return null;
      }
      return (
        <>
          <LobbyScreen
            gameState={gameState}
            onWorldMap={handleWorldMapFromLobby}
            onBackToMenu={handleBackToMenu}
            onUpdateGameState={handleUpdateGameState}
          />
          <StatusBar style="light" />
        </>
      );

    case "worldMap":
      if (!gameState) {
        setCurrentScreen("menu");
        return null;
      }
      return (
        <>
          <WorldMapScreen
            gameState={gameState}
            onMapSelect={handleMapSelect}
            onBack={handleBackToLobby}
          />
          <StatusBar style="light" />
        </>
      );

    case "battle":
      if (!gameState || battleEnemies.length === 0 || !gameDataService) {
        setCurrentScreen("lobby"); // Changed from "worldMap" to "lobby"
        return null;
      }
      return (
        <>
          <BattleScreen
            playerParty={gameState.party}
            enemies={battleEnemies}
            gameDataService={gameDataService}
            onBattleEnd={handleBattleEnd}
            currentMap={currentMap}
          />
          <StatusBar style="light" />
        </>
      );

    default:
      setCurrentScreen("menu");
      return null;
  }
}
