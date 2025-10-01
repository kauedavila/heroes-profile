import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { GameState, Character } from "../types/game";

interface LobbyScreenProps {
  gameState: GameState;
  onWorldMap: () => void;
  onBackToMenu: () => void;
  onUpdateGameState: (gameState: GameState) => void;
}

const { width, height } = Dimensions.get("window");

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  gameState,
  onWorldMap,
  onBackToMenu,
  onUpdateGameState,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  // Get background image - use last map or starting_town.png
  const getBackgroundImage = () => {
    if (gameState.lastMapBackground) {
      try {
        // Try to load the last map background
        const mapImages = require("../data/maps").mapImages;
        if (mapImages[gameState.lastMapBackground]) {
          return mapImages[gameState.lastMapBackground];
        }
      } catch (error) {
        console.log("Could not load last map background:", error);
      }
    }
    // Default to starting town or a generic background
    try {
      return require("../../assets/maps/ice_dungeon_01.png"); // Temporary - will use starting_town.png
    } catch {
      return null;
    }
  };

  const moveToParty = (character: Character) => {
    const MAX_PARTY_SIZE = 4;
    
    if (gameState.party.length >= MAX_PARTY_SIZE) {
      Alert.alert(
        "Party Full",
        `Your party is full (max ${MAX_PARTY_SIZE} members). Move someone to reserve first.`
      );
      return;
    }

    const updatedGameState = { ...gameState };
    updatedGameState.reserve = updatedGameState.reserve.filter(
      (c) => c.id !== character.id
    );
    updatedGameState.party.push(character);
    onUpdateGameState(updatedGameState);
  };

  const moveToReserve = (character: Character) => {
    if (gameState.party.length <= 1) {
      Alert.alert(
        "Cannot Remove",
        "You must have at least one character in your party."
      );
      return;
    }

    const updatedGameState = { ...gameState };
    updatedGameState.party = updatedGameState.party.filter(
      (c) => c.id !== character.id
    );
    updatedGameState.reserve.push(character);
    onUpdateGameState(updatedGameState);
  };

  const togglePosition = (character: Character) => {
    const updatedGameState = { ...gameState };
    
    // Find character in party
    const charIndex = updatedGameState.party.findIndex(
      (c) => c.id === character.id
    );
    
    if (charIndex !== -1) {
      const currentPosition = updatedGameState.party[charIndex].position || "front";
      updatedGameState.party[charIndex].position =
        currentPosition === "front" ? "back" : "front";
      onUpdateGameState(updatedGameState);
    }
  };

  const renderCharacterCard = (
    character: Character,
    inParty: boolean,
    index: number
  ) => {
    const position = character.position || "front";
    const isSelected = selectedCharacter?.id === character.id;

    return (
      <TouchableOpacity
        key={character.id}
        style={[
          styles.characterCard,
          isSelected && styles.selectedCard,
          !inParty && styles.reserveCard,
        ]}
        onPress={() => setSelectedCharacter(character)}
      >
        <View style={styles.characterHeader}>
          <Text style={styles.characterName}>{character.name}</Text>
          {inParty && (
            <View
              style={[
                styles.positionBadge,
                position === "back" && styles.backPositionBadge,
              ]}
            >
              <Text style={styles.positionText}>
                {position === "front" ? "FRONT" : "BACK"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.characterClass}>
          {character.class.toUpperCase()} - Lv. {character.level}
        </Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>HP: {character.stats.hp}</Text>
          <Text style={styles.statText}>ATK: {character.stats.attack}</Text>
          <Text style={styles.statText}>DEF: {character.stats.defense}</Text>
          <Text style={styles.statText}>SPD: {character.stats.speed}</Text>
          <Text style={styles.statText}>MAG: {character.stats.magic}</Text>
        </View>

        {character.potential !== undefined && (
          <Text style={styles.potentialText}>
            Potential: {character.potential}
          </Text>
        )}

        <View style={styles.actionButtons}>
          {inParty ? (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => togglePosition(character)}
              >
                <Text style={styles.actionButtonText}>
                  {position === "front" ? "→ Back" : "→ Front"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => moveToReserve(character)}
              >
                <Text style={styles.actionButtonText}>Reserve</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => moveToParty(character)}
            >
              <Text style={styles.actionButtonText}>Add to Party</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const backgroundImage = getBackgroundImage();

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onBackToMenu}>
            <Text style={styles.headerButtonText}>← Menu</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Party Management</Text>
            <Text style={styles.playerInfo}>
              Level {gameState.player.level} | Gold: {gameState.player.gold}
            </Text>
          </View>

          <TouchableOpacity style={styles.headerButton} onPress={onWorldMap}>
            <Text style={styles.headerButtonText}>World Map →</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Active Party */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Active Party ({gameState.party.length}/4)
            </Text>
            <View style={styles.partyGrid}>
              {gameState.party.map((character, index) =>
                renderCharacterCard(character, true, index)
              )}
            </View>
          </View>

          {/* Reserve */}
          {gameState.reserve && gameState.reserve.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Reserve ({gameState.reserve.length})
              </Text>
              <View style={styles.partyGrid}>
                {gameState.reserve.map((character, index) =>
                  renderCharacterCard(character, false, index)
                )}
              </View>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Battle Positioning:</Text>
            <Text style={styles.infoText}>
              • FRONT ROW: Normal damage dealt and received. Higher target
              priority for enemies.
            </Text>
            <Text style={styles.infoText}>
              • BACK ROW: Half damage dealt and received. Lower target priority
              for enemies.
            </Text>
          </View>
        </ScrollView>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(26, 26, 46, 0.95)",
  },
  headerButton: {
    backgroundColor: "rgba(220, 20, 60, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  headerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  playerInfo: {
    fontSize: 14,
    color: "#C0C0C0",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  partyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  characterCard: {
    backgroundColor: "rgba(255, 215, 0, 0.95)",
    borderRadius: 10,
    padding: 12,
    width: (width - 54) / 2, // 2 columns with gaps
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  reserveCard: {
    backgroundColor: "rgba(192, 192, 192, 0.9)",
    borderColor: "#A0A0A0",
  },
  selectedCard: {
    borderColor: "#00FF00",
    borderWidth: 3,
  },
  characterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  characterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    flex: 1,
  },
  positionBadge: {
    backgroundColor: "#32CD32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  backPositionBadge: {
    backgroundColor: "#4169E1",
  },
  positionText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  characterClass: {
    fontSize: 12,
    color: "#404040",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 6,
  },
  statText: {
    fontSize: 11,
    color: "#1a1a2e",
    fontWeight: "600",
  },
  potentialText: {
    fontSize: 11,
    color: "#8B4513",
    fontWeight: "bold",
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "rgba(220, 20, 60, 0.9)",
  },
  addButton: {
    backgroundColor: "rgba(50, 205, 50, 0.9)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#C0C0C0",
    marginBottom: 5,
    lineHeight: 18,
  },
});
