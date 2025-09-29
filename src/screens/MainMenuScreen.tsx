import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { SaveSlot, storageService } from '../services/storageService';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (gameState: any) => void;
  onOptions: () => void;
}

const { width, height } = Dimensions.get('window');

export const MainMenuScreen: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onOptions
}) => {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  useEffect(() => {
    loadSaveSlots();
  }, []);

  const loadSaveSlots = async () => {
    const slots = await storageService.getSaveSlots();
    setSaveSlots(slots);
  };

  const handleNewGame = () => {
    // For web compatibility, skip the alert and go directly to new game
    if (typeof window !== 'undefined') {
      onNewGame();
    } else {
      Alert.alert(
        'New Game',
        'Start a new adventure? Any unsaved progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start New Game', 
            onPress: onNewGame,
            style: 'destructive'
          }
        ]
      );
    }
  };

  const handleLoadGame = async (slotId: string) => {
    try {
      const gameState = await storageService.loadGameFromSlot(slotId);
      if (gameState) {
        onLoadGame(gameState);
      } else {
        Alert.alert('Error', 'Failed to load save file.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load save file.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showLoadMenu) {
    return (
      <ImageBackground 
        source={{ uri: 'https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Game+Background' }}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.loadMenuContainer}>
            <Text style={styles.title}>Load Game</Text>
            
            {saveSlots.length === 0 ? (
              <Text style={styles.noSavesText}>No saved games found</Text>
            ) : (
              saveSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={styles.saveSlot}
                  onPress={() => handleLoadGame(slot.id)}
                >
                  <View style={styles.saveSlotInfo}>
                    <Text style={styles.saveSlotName}>{slot.name}</Text>
                    <Text style={styles.saveSlotDetails}>
                      Level {slot.playerLevel} • {formatDate(slot.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
            <TouchableOpacity
              style={[styles.menuButton, styles.backButton]}
              onPress={() => setShowLoadMenu(false)}
            >
              <Text style={styles.menuButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Heroes+Profile+RPG' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Text style={styles.gameTitle}>Heroes Profile</Text>
          <Text style={styles.gameSubtitle}>RPG Adventure</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={handleNewGame}>
            <Text style={styles.menuButtonText}>New Game</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuButton, saveSlots.length === 0 && styles.disabledButton]}
            onPress={() => setShowLoadMenu(true)}
            disabled={saveSlots.length === 0}
          >
            <Text style={[styles.menuButtonText, saveSlots.length === 0 && styles.disabledText]}>
              Load Game
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={onOptions}>
            <Text style={styles.menuButtonText}>Options</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'About Heroes Profile RPG',
                'A turn-based RPG inspired by classic games like Chrono Trigger.\n\nVersion 1.0.0\n\nBuilt with React Native and Expo'
              );
            }}
          >
            <Text style={styles.menuButtonText}>About</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Heroes Profile Team</Text>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  gameSubtitle: {
    fontSize: 20,
    color: '#C0C0C0',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    borderColor: '#808080',
  },
  disabledText: {
    color: '#404040',
  },
  backButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.9)',
    borderColor: '#DC143C',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  loadMenuContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  noSavesText: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
    marginVertical: 20,
  },
  saveSlot: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
  },
  saveSlotInfo: {
    flexDirection: 'column',
  },
  saveSlotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  saveSlotDetails: {
    fontSize: 14,
    color: '#C0C0C0',
  },
});