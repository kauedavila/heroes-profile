import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import { BattleSystem } from "../services/battleSystem";
import {
  BattleState,
  BattleCharacter,
  BattleAction,
  Character,
  Monster,
} from "../types/game";
import { GameDataService } from "../services/gameDataService";
import { GameMap } from "../types/game";
import { mapImages } from "../data/maps";

interface BattleScreenProps {
  playerParty: Character[];
  enemies: Monster[];
  gameDataService: GameDataService;
  onBattleEnd: (victory: boolean, rewards?: any) => void;
  currentMap: GameMap | null;
}

const { width, height } = Dimensions.get("window");

export const BattleScreen: React.FC<BattleScreenProps> = ({
  playerParty,
  enemies,
  gameDataService,
  onBattleEnd,
  currentMap,
}) => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] =
    useState<BattleCharacter | null>(null);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const [availableTargets, setAvailableTargets] = useState<BattleCharacter[]>(
    []
  );

  const battleSystemRef = useRef<BattleSystem | null>(null);
  const battleLogRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeBattle();
    return () => {
      if (battleSystemRef.current) {
        battleSystemRef.current.stopBattle();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll battle log to bottom
    if (battleLogRef.current && battleState?.battleLog) {
      battleLogRef.current.scrollToEnd({ animated: true });
    }
  }, [battleState?.battleLog]);

  const initializeBattle = () => {
    battleSystemRef.current = new BattleSystem(
      playerParty,
      enemies,
      handleBattleStateChange,
      gameDataService
    );

    const initialState = battleSystemRef.current.getBattleState();
    setBattleState(initialState);

    battleSystemRef.current.startBattle();
  };

  const handleBattleStateChange = (newState: BattleState) => {
    setBattleState({ ...newState });

    // Check if battle is over
    const alivePlayerCharacters = newState.characters.filter(
      (char) => char.isPlayerControlled && char.currentHp > 0
    );
    const aliveEnemyCharacters = newState.characters.filter(
      (char) => !char.isPlayerControlled && char.currentHp > 0
    );

    if (alivePlayerCharacters.length === 0) {
      setTimeout(() => onBattleEnd(false), 2000);
    } else if (aliveEnemyCharacters.length === 0) {
      const rewards = calculateRewards();
      setTimeout(() => onBattleEnd(true, rewards), 2000);
    }
  };

  const calculateRewards = () => {
    const totalGold = enemies.reduce(
      (sum, enemy) => sum + enemy.rewards.gold,
      0
    );
    const totalExp = enemies.reduce(
      (sum, enemy) => sum + enemy.rewards.experience,
      0
    );

    return {
      gold: totalGold,
      experience: totalExp,
      items: enemies.flatMap((enemy) =>
        enemy.dropItems
          .filter((drop) => Math.random() < drop.chance)
          .map((drop) => drop.item)
      ),
    };
  };

  const handleActionSelect = (actionType: string) => {
    if (!battleState?.isPlayerTurn || !battleSystemRef.current) return;

    const activeCharacter = battleState.characters.find(
      (char) => char.isPlayerControlled && char.actionMeter >= 100
    );

    if (!activeCharacter) return;

    setSelectedCharacter(activeCharacter);
    setSelectedAction(actionType);
    {
      // Show target selection
      let targets: BattleCharacter[] = [];

      if (actionType === "attack") {
        targets = battleSystemRef.current.getAvailableTargets(true);
      } else if (actionType === "heal") {
        targets = battleSystemRef.current.getAvailableAllies(true);
      }

      setAvailableTargets(targets);
      setShowTargetSelection(true);
    }
  };

  const handleTargetSelect = (target: BattleCharacter) => {
    if (!selectedCharacter || !selectedAction || !battleSystemRef.current)
      return;

    let action: BattleAction;

    switch (selectedAction) {
      case "attack":
        action = {
          type: "attack",
          source: selectedCharacter,
          target,
        };
        break;
      case "move":
        // For simplicity, use the first available move that's not on cooldown
        const availableMove =
          selectedCharacter.moves.find(
            (moveId) => (selectedCharacter.moveCooldowns[moveId] || 0) <= 0
          ) ||
          selectedCharacter.moves[0] ||
          "basic_attack";
        action = {
          type: "move",
          source: selectedCharacter,
          target,
          moveId: availableMove,
        };
        break;
      case "item":
        action = {
          type: "item",
          source: selectedCharacter,
          target,
          itemId: "healing_potion",
        };
        break;
      default:
        return;
    }

    battleSystemRef.current.performPlayerAction(action);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedAction(null);
    setSelectedCharacter(null);
    setShowTargetSelection(false);
    setAvailableTargets([]);
  };

  const renderActionMeter = (character: BattleCharacter) => {
    const percentage = Math.min(100, character.actionMeter);
    const isReady = percentage >= 100;

    return (
      <View style={styles.actionMeterContainer}>
        <View style={styles.actionMeterBg}>
          <View
            style={[
              styles.actionMeterFill,
              {
                width: `${percentage}%`,
                backgroundColor: isReady ? "#32CD32" : "#FFD700",
              },
            ]}
          />
        </View>
        <Text style={styles.actionMeterText}>
          {isReady ? "READY!" : `${Math.floor(percentage)}%`}
        </Text>
      </View>
    );
  };

  const renderMoveCooldowns = (character: BattleCharacter) => {
    const activeCooldowns = Object.entries(character.moveCooldowns || {})
      .filter(([_, cooldown]) => cooldown > 0)
      .slice(0, 3); // Show only first 3 for space

    if (activeCooldowns.length === 0) return null;

    return (
      <View style={styles.cooldownContainer}>
        {activeCooldowns.map(([moveId, cooldown]) => (
          <View key={moveId} style={styles.cooldownItem}>
            <Text style={styles.cooldownText}>
              {moveId.substring(0, 4)}: {Math.ceil(cooldown)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCharacter = (character: BattleCharacter, index: number) => {
    const isPlayer = character.isPlayerControlled;
    const isAlive = character.currentHp > 0;
    const hpPercentage = (character.currentHp / character.stats.hp) * 100;

    return (
      <View
        key={`${character.id}-${index}`}
        style={[
          styles.characterContainer,
          !isAlive && styles.defeatedCharacter,
        ]}
      >
        <View style={styles.characterInfo}>
          <Text style={[styles.characterName, isPlayer && styles.playerName]}>
            {character.name}
          </Text>
          <Text style={styles.characterLevel}>Lv. {character.level}</Text>
        </View>

        <View style={styles.characterStats}>
          <View style={styles.hpContainer}>
            <Text style={styles.hpText}>
              HP: {character.currentHp}/{character.stats.hp}
            </Text>
            <View style={styles.hpBarBg}>
              <View
                style={[
                  styles.hpBarFill,
                  {
                    width: `${hpPercentage}%`,
                    backgroundColor:
                      hpPercentage > 50
                        ? "#32CD32"
                        : hpPercentage > 25
                        ? "#FFD700"
                        : "#DC143C",
                  },
                ]}
              />
            </View>
          </View>

          {renderActionMeter(character)}
          {renderMoveCooldowns(character)}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!battleState?.isPlayerTurn) {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Waiting for your turn...</Text>
        </View>
      );
    }

    const activeCharacter = battleState.characters.find(
      (char) => char.isPlayerControlled && char.actionMeter >= 100
    );

    if (!activeCharacter) {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Charging action meter...</Text>
        </View>
      );
    }

    return (
      <View style={styles.actionButtonsContainer}>
        <Text style={styles.activeCharacterText}>
          {activeCharacter.name}'s Turn
        </Text>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActionSelect("attack")}
          >
            <Text style={styles.actionButtonText}>⚔️ Attack</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActionSelect("item")}
          >
            <Text style={styles.actionButtonText}>🧪 Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTargetSelection = () => {
    if (!showTargetSelection) return null;

    return (
      <View style={styles.targetSelectionOverlay}>
        <View style={styles.targetSelectionContainer}>
          <Text style={styles.targetSelectionTitle}>Select Target</Text>

          <ScrollView style={styles.targetsList}>
            {availableTargets.map((target, index) => (
              <TouchableOpacity
                key={`target-${target.id}-${index}`}
                style={styles.targetButton}
                onPress={() => handleTargetSelect(target)}
              >
                <Text style={styles.targetButtonText}>{target.name}</Text>
                <Text style={styles.targetButtonHp}>
                  HP: {target.currentHp}/{target.stats.hp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetSelection}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!battleState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Battle...</Text>
      </View>
    );
  }

  const mapBgSource = mapImages[currentMap?.backgroundImage ?? "default"] || {};
  return (
    <ImageBackground source={mapBgSource} style={styles.container}>
      {/* Battle log */}
      <View style={styles.battleLogContainer}>
        <Text style={styles.battleLogTitle}>Battle Log</Text>
        <ScrollView
          ref={battleLogRef}
          style={styles.battleLog}
          showsVerticalScrollIndicator={false}
        >
          {battleState.battleLog.map((message, index) => (
            <Text key={index} style={styles.battleLogMessage}>
              {message}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Action controls */}
      <View style={styles.controlsContainer}>{renderActionButtons()}</View>

      <View style={styles.overlay}>
        {/* Battle field */}
        <View style={styles.battleField}>
          {/* Player party */}
          <View style={styles.playerParty}>
            <Text style={styles.partyLabel}>Your Party</Text>
            {battleState.characters
              .filter((char) => char.isPlayerControlled)
              .map((char, index) => renderCharacter(char, index))}
          </View>

          {/* Enemy party */}
          <View style={styles.enemyParty}>
            <Text style={styles.partyLabel}>Enemies</Text>
            {battleState.characters
              .filter((char) => !char.isPlayerControlled)
              .map((char, index) => renderCharacter(char, index))}
          </View>
        </View>

        {/* Target selection overlay */}
        {renderTargetSelection()}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  loadingText: {
    fontSize: 18,
    color: "#FFD700",
  },
  battleField: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
  },
  playerParty: {
    flex: 1,
    marginRight: 10,
  },
  enemyParty: {
    flex: 1,
    marginLeft: 10,
  },
  partyLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterContainer: {
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    borderRadius: 8,
    padding: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  defeatedCharacter: {
    opacity: 0.5,
    backgroundColor: "rgba(128, 0, 0, 0.6)",
    borderColor: "#800000",
  },
  characterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  characterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  playerName: {
    color: "#87CEEB",
  },
  characterLevel: {
    fontSize: 12,
    color: "#C0C0C0",
  },
  characterStats: {
    gap: 5,
  },
  hpContainer: {
    marginBottom: 5,
  },
  hpText: {
    fontSize: 12,
    color: "#C0C0C0",
    marginBottom: 2,
  },
  hpBarBg: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  hpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  actionMeterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionMeterBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
  },
  actionMeterFill: {
    height: "100%",
    borderRadius: 3,
  },
  actionMeterText: {
    fontSize: 10,
    color: "#FFD700",
    fontWeight: "bold",
    minWidth: 45,
    textAlign: "right",
  },
  battleLogContainer: {
    height: 120,
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderTopWidth: 2,
    borderTopColor: "#FFD700",
    padding: 10,
  },
  battleLogTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  battleLog: {
    flex: 1,
  },
  battleLogMessage: {
    fontSize: 12,
    color: "#C0C0C0",
    marginVertical: 1,
  },
  controlsContainer: {
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderTopWidth: 2,
    borderTopColor: "#FFD700",
    padding: 15,
  },
  waitingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 16,
    color: "#C0C0C0",
    fontStyle: "italic",
  },
  actionButtonsContainer: {
    alignItems: "center",
  },
  activeCharacterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  actionButton: {
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFD700",
    minWidth: 80,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
  },
  targetSelectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  targetSelectionContainer: {
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  targetSelectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 15,
  },
  targetsList: {
    flex: 1,
    marginBottom: 15,
  },
  targetButton: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 6,
    padding: 15,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  targetButtonHp: {
    fontSize: 12,
    color: "#C0C0C0",
  },
  cancelButton: {
    backgroundColor: "rgba(220, 20, 60, 0.9)",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  cooldownContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  cooldownItem: {
    backgroundColor: "rgba(220, 20, 60, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  cooldownText: {
    fontSize: 8,
    color: "white",
    fontWeight: "bold",
  },
});
