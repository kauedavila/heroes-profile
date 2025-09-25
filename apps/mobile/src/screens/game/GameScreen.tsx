import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, ProgressBar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'expo-linear-gradient';

import { RootStackParamList, GameState } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

const { width: screenWidth } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { user, updateUser } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const state = await apiService.getGameState();
      setGameState(state);
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStagePress = (stageId: number) => {
    if (!user?.gameData.characters.length) {
      Alert.alert(
        'No Heroes',
        'You need to create a character first!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Hero', onPress: () => navigation.navigate('CharacterCreation') },
        ]
      );
      return;
    }

    navigation.navigate('Battle', { stageId });
  };

  const renderStageMap = () => {
    const stages = Array.from({ length: 10 }, (_, i) => i + 1);
    const currentStage = user?.gameData.currentStage || 1;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageContainer}>
        {stages.map((stageId) => {
          const isUnlocked = stageId <= currentStage;
          const isCurrent = stageId === currentStage;
          
          return (
            <Card
              key={stageId}
              variant={isCurrent ? 'game' : 'default'}
              style={[
                styles.stageCard,
                !isUnlocked && styles.lockedStage,
                isCurrent && styles.currentStage,
              ]}
              onPress={isUnlocked ? () => handleStagePress(stageId) : undefined}
            >
              <View style={styles.stageContent}>
                <Text variant="headlineSmall" style={styles.stageNumber}>
                  {stageId}
                </Text>
                <Text variant="bodySmall" style={styles.stageStatus}>
                  {!isUnlocked ? '🔒 Locked' : isCurrent ? '⚔️ Current' : '✅ Complete'}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    );
  };

  const renderPlayerStats = () => {
    if (!user) return null;

    const { level, experience, gold } = user.gameData;
    const experienceForNextLevel = level * 100;
    const experienceProgress = experience / experienceForNextLevel;

    return (
      <Card variant="character" style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text variant="headlineSmall" style={styles.playerName}>
            {user.name}
          </Text>
          {user.isVip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP {user.vipLevel}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Gold</Text>
            <Text style={[styles.statValue, { color: theme.colors.gold }]}>
              {gold.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.experienceContainer}>
          <Text style={styles.statLabel}>Experience</Text>
          <ProgressBar
            progress={experienceProgress}
            color={theme.colors.experience}
            style={styles.experienceBar}
          />
          <Text style={styles.experienceText}>
            {experience} / {experienceForNextLevel}
          </Text>
        </View>
      </Card>
    );
  };

  const renderVipFeatures = () => {
    if (!user?.isVip) return null;

    return (
      <Card variant="vip" style={styles.vipCard}>
        <Text variant="titleMedium" style={styles.vipTitle}>
          🌟 VIP Features
        </Text>
        <View style={styles.vipFeatures}>
          <Button
            title="Auto Battle"
            variant="secondary"
            size="small"
            onPress={() => Alert.alert('Auto Battle', 'Feature coming soon!')}
            style={styles.vipButton}
          />
          <Button
            title="VIP Shop"
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate('Shop')}
            style={styles.vipButton}
          />
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="headlineMedium">Loading Adventure...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surfaceVariant]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text variant="headlineLarge" style={styles.title}>
          Adventure Map
        </Text>

        {renderPlayerStats()}
        {renderVipFeatures()}

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Choose Your Stage
        </Text>
        {renderStageMap()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CharacterCreation')}
        label="New Hero"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: theme.colors.onBackground,
    marginVertical: theme.spacing.md,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: theme.spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  playerName: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  vipBadge: {
    backgroundColor: theme.colors.vip,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  vipText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.onSurface,
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    color: theme.colors.onSurface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  experienceContainer: {
    alignItems: 'center',
  },
  experienceBar: {
    width: '100%',
    height: 8,
    marginVertical: theme.spacing.xs,
    borderRadius: 4,
  },
  experienceText: {
    color: theme.colors.onSurface,
    fontSize: 12,
    opacity: 0.7,
  },
  vipCard: {
    marginBottom: theme.spacing.md,
  },
  vipTitle: {
    color: theme.colors.vip,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  vipFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vipButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  stageContainer: {
    marginBottom: theme.spacing.lg,
  },
  stageCard: {
    width: 120,
    height: 100,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedStage: {
    opacity: 0.5,
  },
  currentStage: {
    borderColor: theme.colors.secondary,
    borderWidth: 2,
  },
  stageContent: {
    alignItems: 'center',
  },
  stageNumber: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  stageStatus: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default GameScreen;