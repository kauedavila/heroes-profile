import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { RootStackParamList } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';

type CharacterCreationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CharacterCreation'>;

const characterSchema = yup.object().shape({
  name: yup.string().min(2, 'Name must be at least 2 characters').max(20, 'Name must be less than 20 characters').required('Name is required'),
  class: yup.string().oneOf(['warrior', 'mage', 'archer', 'rogue']).required('Class is required'),
});

interface CharacterFormData {
  name: string;
  class: 'warrior' | 'mage' | 'archer' | 'rogue';
}

const CHARACTER_CLASSES = [
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '⚔️',
    description: 'High health and defense, moderate attack',
    stats: { health: 120, attack: 15, defense: 12, speed: 8 },
  },
  {
    id: 'mage',
    name: 'Mage',
    emoji: '🔮',
    description: 'High attack, low health and defense',
    stats: { health: 80, attack: 20, defense: 6, speed: 12 },
  },
  {
    id: 'archer',
    name: 'Archer',
    emoji: '🏹',
    description: 'Balanced stats with good speed',
    stats: { health: 100, attack: 18, defense: 8, speed: 15 },
  },
  {
    id: 'rogue',
    name: 'Rogue',
    emoji: '🗡️',
    description: 'High speed, moderate attack',
    stats: { health: 90, attack: 16, defense: 7, speed: 18 },
  },
];

const CharacterCreationScreen: React.FC = () => {
  const navigation = useNavigation<CharacterCreationScreenNavigationProp>();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CharacterFormData>({
    resolver: yupResolver(characterSchema),
    defaultValues: {
      name: '',
      class: 'warrior',
    },
  });

  const onSubmit = async (data: CharacterFormData) => {
    try {
      setIsLoading(true);
      const response = await apiService.createCharacter(data);
      
      // Update user data locally
      if (user) {
        const updatedCharacters = [...user.gameData.characters, response.character];
        updateUser({
          gameData: {
            ...user.gameData,
            characters: updatedCharacters,
          },
        });
      }

      Alert.alert(
        'Hero Created!',
        `${response.character.name} the ${response.character.class} is ready for adventure!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Creation Failed', apiService.handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setValue('class', classId as CharacterFormData['class']);
  };

  const renderClassOption = (characterClass: typeof CHARACTER_CLASSES[0]) => {
    const isSelected = selectedClass === characterClass.id;
    
    return (
      <Card
        key={characterClass.id}
        variant={isSelected ? 'game' : 'default'}
        style={[styles.classCard, isSelected && styles.selectedClass]}
        onPress={() => handleClassSelect(characterClass.id)}
      >
        <View style={styles.classHeader}>
          <Text style={styles.classEmoji}>{characterClass.emoji}</Text>
          <Text variant="titleMedium" style={styles.className}>
            {characterClass.name}
          </Text>
        </View>
        
        <Text variant="bodySmall" style={styles.classDescription}>
          {characterClass.description}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statText}>❤️ {characterClass.stats.health}</Text>
            <Text style={styles.statText}>⚔️ {characterClass.stats.attack}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statText}>🛡️ {characterClass.stats.defense}</Text>
            <Text style={styles.statText}>💨 {characterClass.stats.speed}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Create Hero
      </Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Card variant="character" style={styles.formCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Hero Name
          </Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Enter hero name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.name?.message}
                maxLength={20}
              />
            )}
          />
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Choose Class
        </Text>
        
        {CHARACTER_CLASSES.map(renderClassOption)}

        <View style={styles.buttonContainer}>
          <Button
            title="Create Hero"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading || !selectedClass}
            style={styles.createButton}
          />
          
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
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
  formCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  classCard: {
    marginBottom: theme.spacing.md,
  },
  selectedClass: {
    borderColor: theme.colors.secondary,
    borderWidth: 2,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  classEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  className: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  classDescription: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    gap: theme.spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    color: theme.colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  createButton: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {
    marginBottom: theme.spacing.md,
  },
});

export default CharacterCreationScreen;