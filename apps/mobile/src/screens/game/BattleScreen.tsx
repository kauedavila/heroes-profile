import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'expo-linear-gradient';

import { RootStackParamList, Character, BattleResult } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';

type BattleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Battle'>;
type BattleScreenRouteProp = RouteProp<RootStackParamList, 'Battle'>;

const BattleScreen: React.FC = () => {
  const navigation = useNavigation<BattleScreenNavigationProp>();
  const route = useRoute<BattleScreenRouteProp>();
  const { user, updateUser } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleAnimation] = useState(new Animated.Value(0));

  const { stageId } = route.params;

  useEffect(() => {
    // Auto-select first character if only one exists
    if (user?.gameData.characters.length === 1) {
      setSelectedCharacter(user.gameData.characters[0]);
    }
  }, [user]);

  const startBattle = async () => {
    if (!selectedCharacter) {
      Alert.alert('Select Hero', 'Please select a hero for battle.');
      return;
    }

    try {
      setIsBattling(true);
      
      // Start battle animation
      Animated.sequence([
        Animated.timing(battleAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(battleAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Simulate battle time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await apiService.battle({
        characterId: selectedCharacter.id,
        stageId,
      });

      setBattleResult(result);

      // Update user data if victory
      if (result.victory && result.playerState && user) {
        updateUser({
          gameData: {
            ...user.gameData,
            level: result.playerState.level,
            experience: result.playerState.experience,
            gold: result.playerState.gold,
            currentStage: result.playerState.currentStage,
          },
        });
      }
    } catch (error) {
      Alert.alert('Battle Error', apiService.handleApiError(error));
    } finally {
      setIsBattling(false);
    }
  };

  const handleRetry = () => {
    setBattleResult(null);
  };

  const handleExit = () => {
    navigation.goBack();
  };

  const renderCharacterSelection = () => (
    <>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Choose Your Hero
      </Text>
      
      {user?.gameData.characters.map((character) => (
        <Card
          key={character.id}
          variant={selectedCharacter?.id === character.id ? 'game' : 'character'}
          style={[
            styles.characterCard,
            selectedCharacter?.id === character.id && styles.selectedCharacter,
          ]}
          onPress={() => setSelectedCharacter(character)}
        >
          <View style={styles.characterInfo}>
            <Text variant="titleMedium" style={styles.characterName}>
              {character.name}
            </Text>
            <Text variant="bodySmall" style={styles.characterClass}>
              {character.class} • Level {character.level}
            </Text>
          </View>
          
          <View style={styles.characterStats}>
            <Text style={styles.statText}>❤️ {character.stats.health}</Text>
            <Text style={styles.statText}>⚔️ {character.stats.attack}</Text>
            <Text style={styles.statText}>🛡️ {character.stats.defense}</Text>
            <Text style={styles.statText}>💨 {character.stats.speed}</Text>
          </View>
        </Card>
      ))}
    </>
  );

  const renderBattleScene = () => (
    <Card variant="game" style={styles.battleScene}>
      <Text variant="headlineSmall" style={styles.battleTitle}>
        Stage {stageId} Battle
      </Text>
      
      <View style={styles.battleContainer}>
        <Animated.View
          style={[
            styles.heroContainer,
            {
              transform: [
                {
                  translateX: battleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.battleCharacter}>⚔️</Text>
          <Text style={styles.battleLabel}>{selectedCharacter?.name}</Text>
        </Animated.View>
        
        <Text style={styles.vsText}>VS</Text>
        
        <View style={styles.enemyContainer}>
          <Text style={styles.battleCharacter}>👹</Text>
          <Text style={styles.battleLabel}>Stage {stageId} Monster</Text>
        </View>
      </View>
      
      {isBattling && (
        <View style={styles.battleProgress}>
          <Text style={styles.battleProgressText}>Battle in progress...</Text>
          <ProgressBar
            indeterminate
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      )}
    </Card>
  );

  const renderBattleResult = () => {
    if (!battleResult) return null;

    return (
      <Card variant={battleResult.victory ? 'game' : 'default'} style={styles.resultCard}>
        <Text variant="headlineSmall" style={styles.resultTitle}>
          {battleResult.victory ? '🎉 Victory!' : '💀 Defeat!'}
        </Text>
        
        {battleResult.victory && battleResult.rewards && (
          <View style={styles.rewardsContainer}>
            <Text variant="titleMedium" style={styles.rewardsTitle}>
              Rewards Earned:
            </Text>
            
            <View style={styles.rewardRow}>
              <Text style={styles.rewardText}>
                🪙 Gold: +{battleResult.rewards.gold}
              </Text>
              <Text style={styles.rewardText}>
                ⭐ XP: +{battleResult.rewards.experience}
              </Text>
            </View>
            
            {battleResult.rewards.vipBonus && (
              <Text style={styles.vipBonusText}>
                🌟 VIP Bonus Applied!
              </Text>
            )}
          </View>
        )}
        
        {battleResult.message && (
          <Text style={styles.resultMessage}>
            {battleResult.message}
          </Text>
        )}
        
        <View style={styles.resultButtons}>
          {!battleResult.victory && (
            <Button
              title="Try Again"
              onPress={handleRetry}
              style={styles.resultButton}
            />
          )}
          <Button
            title="Return to Map"
            variant="outline"
            onPress={handleExit}
            style={styles.resultButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surfaceVariant]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Battle Arena
        </Text>
        
        {!battleResult && !isBattling && renderCharacterSelection()}
        
        {selectedCharacter && renderBattleScene()}
        
        {battleResult && renderBattleResult()}
        
        {!battleResult && selectedCharacter && (
          <View style={styles.actionButtons}>
            <Button
              title="Start Battle"
              onPress={startBattle}
              loading={isBattling}
              disabled={isBattling}
              style={styles.actionButton}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleExit}
              disabled={isBattling}
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  characterCard: {
    marginBottom: theme.spacing.md,
  },
  selectedCharacter: {
    borderColor: theme.colors.secondary,
    borderWidth: 2,
  },
  characterInfo: {
    marginBottom: theme.spacing.sm,
  },
  characterName: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  characterClass: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    color: theme.colors.onSurface,
    fontSize: 14,
  },
  battleScene: {
    marginVertical: theme.spacing.lg,
  },
  battleTitle: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  battleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroContainer: {
    alignItems: 'center',
  },
  enemyContainer: {
    alignItems: 'center',
  },
  battleCharacter: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  battleLabel: {
    color: theme.colors.onSurface,
    fontSize: 14,
    textAlign: 'center',
  },
  vsText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  battleProgress: {
    alignItems: 'center',
  },
  battleProgressText: {
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
  },
  resultCard: {
    marginVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  resultTitle: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  rewardsTitle: {
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    fontWeight: 'bold',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  rewardText: {
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  vipBonusText: {
    color: theme.colors.vip,
    marginTop: theme.spacing.sm,
    fontWeight: 'bold',
  },
  resultMessage: {
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    opacity: 0.8,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  resultButton: {
    flex: 1,
  },
  actionButtons: {
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
});

export default BattleScreen;