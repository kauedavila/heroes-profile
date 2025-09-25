import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import Card from '../../components/atoms/Card';

type CharactersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Characters'>;

const CharactersScreen: React.FC = () => {
  const navigation = useNavigation<CharactersScreenNavigationProp>();
  const { user } = useAuth();

  const renderCharacter = (character: any, index: number) => (
    <Card key={character.id} variant="character" style={styles.characterCard}>
      <View style={styles.characterHeader}>
        <Text variant="titleMedium" style={styles.characterName}>
          {character.name}
        </Text>
        <Text variant="bodySmall" style={styles.characterClass}>
          {character.class} • Level {character.level}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>❤️ Health: {character.stats.health}</Text>
          <Text style={styles.statLabel}>⚔️ Attack: {character.stats.attack}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🛡️ Defense: {character.stats.defense}</Text>
          <Text style={styles.statLabel}>💨 Speed: {character.stats.speed}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        My Heroes
      </Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {user?.gameData.characters.length ? (
          user.gameData.characters.map(renderCharacter)
        ) : (
          <Card variant="default" style={styles.emptyCard}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Heroes Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Create your first hero to start your adventure!
            </Text>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CharacterCreation')}
        label="Create Hero"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  characterCard: {
    marginBottom: theme.spacing.md,
  },
  characterHeader: {
    marginBottom: theme.spacing.md,
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
  statsContainer: {
    gap: theme.spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: theme.colors.onSurface,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default CharactersScreen;