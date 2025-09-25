import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { MainTabParamList, RootStackParamList } from '../types';
import { theme } from '../theme';

import GameScreen from '../screens/game/GameScreen';
import CharactersScreen from '../screens/game/CharactersScreen';
import ShopScreen from '../screens/game/ShopScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BattleScreen from '../screens/game/BattleScreen';
import CharacterCreationScreen from '../screens/game/CharacterCreationScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Game':
              iconName = focused ? 'sword' : 'sword-cross';
              break;
            case 'Characters':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Shop':
              iconName = focused ? 'store' : 'store-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Game" 
        component={GameScreen}
        options={{ title: 'Adventure' }}
      />
      <Tab.Screen 
        name="Characters" 
        component={CharactersScreen}
        options={{ title: 'Heroes' }}
      />
      <Tab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{ title: 'Shop' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Game" component={TabNavigator} />
      <Stack.Screen 
        name="Battle" 
        component={BattleScreen}
        options={{
          presentation: 'modal',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="CharacterCreation" 
        component={CharacterCreationScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;