import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ImageBackground
} from 'react-native';
import { WorldMap, WorldMapRegion, GameState } from '../types/game';
import { GameDataService } from '../services/gameDataService';

interface WorldMapScreenProps {
  gameState: GameState;
  onMapSelect: (mapId: string) => void;
  onBack: () => void;
}

const { width, height } = Dimensions.get('window');

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  gameState,
  onMapSelect,
  onBack
}) => {
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<WorldMapRegion | null>(null);
  const [gameDataService, setGameDataService] = useState<GameDataService | null>(null);

  useEffect(() => {
    initializeGameData();
  }, []);

  const initializeGameData = async () => {
    try {
      const service = await GameDataService.createFromYaml();
      setGameDataService(service);
      
      const data = await service.loadWorldMap();
      setWorldMap(data);
    } catch (error) {
      console.error('Error initializing game data:', error);
    }
  };

  const isRegionUnlocked = (region: WorldMapRegion): boolean => {
    if (region.unlocked || gameState.unlockedRegions.includes(region.id)) {
      return true;
    }

    if (!region.unlockRequirement) {
      return false;
    }

    // Check if player level requirement is met
    if (gameState.player.level < region.unlockRequirement.playerLevel) {
      return false;
    }

    // Check if required maps are completed
    const hasCompletedRequiredMaps = region.unlockRequirement.completedMaps.every(
      mapId => gameState.completedMaps.includes(mapId)
    );

    return hasCompletedRequiredMaps;
  };

  const handleRegionPress = (region: WorldMapRegion) => {
    if (!isRegionUnlocked(region)) {
      let message = 'This region is locked.';
      
      if (region.unlockRequirement) {
        const levelReq = region.unlockRequirement.playerLevel;
        const mapsReq = region.unlockRequirement.completedMaps;
        
        if (gameState.player.level < levelReq) {
          message += `\n\nRequired Level: ${levelReq} (Current: ${gameState.player.level})`;
        }
        
        if (mapsReq.length > 0) {
          const uncompletedMaps = mapsReq.filter(
            mapId => !gameState.completedMaps.includes(mapId)
          );
          if (uncompletedMaps.length > 0) {
            message += `\n\nComplete these maps first: ${uncompletedMaps.join(', ')}`;
          }
        }
      }
      
      Alert.alert('Region Locked', message);
      return;
    }

    setSelectedRegion(region);
  };

  const handleMapSelect = (mapId: string) => {
    onMapSelect(mapId);
  };

  const renderRegionMaps = () => {
    if (!selectedRegion) return null;

    return (
      <View style={styles.mapsContainer}>
        <View style={styles.mapsHeader}>
          <Text style={styles.regionTitle}>{selectedRegion.name}</Text>
          <TouchableOpacity 
            style={styles.backToMapButton}
            onPress={() => setSelectedRegion(null)}
          >
            <Text style={styles.backToMapButtonText}>← Back to Map</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.regionDescription}>{selectedRegion.description}</Text>
        
        <ScrollView style={styles.mapsList}>
          {selectedRegion.maps.map((mapId) => {
            const isCompleted = gameState.completedMaps.includes(mapId);
            return (
              <TouchableOpacity
                key={mapId}
                style={[
                  styles.mapButton,
                  isCompleted && styles.completedMapButton
                ]}
                onPress={() => handleMapSelect(mapId)}
              >
                <View style={styles.mapInfo}>
                  <Text style={styles.mapName}>{mapId.replace(/_/g, ' ').toUpperCase()}</Text>
                  {isCompleted && (
                    <Text style={styles.completedText}>✓ COMPLETED</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (!worldMap) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading World Map...</Text>
      </View>
    );
  }

  if (selectedRegion) {
    return (
      <ImageBackground 
        source={{ uri: 'https://via.placeholder.com/800x600/2c2c54/ffffff?text=Region+View' }}
        style={styles.container}
      >
        <View style={styles.overlay}>
          {renderRegionMaps()}
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://via.placeholder.com/800x600/0f3460/ffffff?text=World+Map' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Menu</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.worldTitle}>{worldMap.name}</Text>
            <Text style={styles.worldDescription}>{worldMap.description}</Text>
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.playerText}>Level {gameState.player.level}</Text>
            <Text style={styles.playerText}>Gold: {gameState.player.gold}</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.mapContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.regionsContainer}>
            {worldMap.regions.map((region) => {
              const unlocked = isRegionUnlocked(region);
              const completed = region.maps.every(mapId => 
                gameState.completedMaps.includes(mapId)
              );

              return (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionButton,
                    { 
                      left: region.position.x,
                      top: region.position.y
                    },
                    !unlocked && styles.lockedRegion,
                    completed && styles.completedRegion
                  ]}
                  onPress={() => handleRegionPress(region)}
                  disabled={!unlocked}
                >
                  <View style={styles.regionContent}>
                    <Text style={[
                      styles.regionName,
                      !unlocked && styles.lockedText
                    ]}>
                      {region.name}
                    </Text>
                    {completed && (
                      <Text style={styles.completedIcon}>👑</Text>
                    )}
                    {!unlocked && (
                      <Text style={styles.lockedIcon}>🔒</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#32CD32' }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#696969' }]} />
            <Text style={styles.legendText}>Locked</Text>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
  },
  backButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  worldTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  worldDescription: {
    fontSize: 14,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  playerInfo: {
    alignItems: 'flex-end',
  },
  playerText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  mapContainer: {
    flexGrow: 1,
    minHeight: height - 200,
  },
  regionsContainer: {
    flex: 1,
    position: 'relative',
    padding: 20,
  },
  regionButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    minWidth: 120,
    alignItems: 'center',
  },
  lockedRegion: {
    backgroundColor: 'rgba(105, 105, 105, 0.6)',
    borderColor: '#696969',
  },
  completedRegion: {
    backgroundColor: 'rgba(50, 205, 50, 0.9)',
    borderColor: '#32CD32',
  },
  regionContent: {
    alignItems: 'center',
  },
  regionName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 5,
  },
  lockedText: {
    color: '#404040',
  },
  completedIcon: {
    fontSize: 16,
  },
  lockedIcon: {
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 12,
    color: '#C0C0C0',
  },
  mapsContainer: {
    flex: 1,
    padding: 20,
  },
  mapsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  regionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  backToMapButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backToMapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  regionDescription: {
    fontSize: 16,
    color: '#C0C0C0',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapsList: {
    flex: 1,
  },
  mapButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  completedMapButton: {
    backgroundColor: 'rgba(50, 205, 50, 0.9)',
    borderColor: '#32CD32',
  },
  mapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  completedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f5132',
  },
});