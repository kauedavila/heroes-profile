import { MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6C63FF',
    primaryContainer: '#5A52E8',
    secondary: '#FFD93D',
    secondaryContainer: '#E6C635',
    tertiary: '#FF6B9D',
    background: '#1A1A2E',
    surface: '#16213E',
    surfaceVariant: '#0F1419',
    error: '#FF5252',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onError: '#FFFFFF',
    outline: '#464458',
    // Game-specific colors
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    rare: '#1E90FF',
    epic: '#9932CC',
    legendary: '#FF8C00',
    vip: '#FFD93D',
    health: '#FF5252',
    mana: '#2196F3',
    experience: '#4CAF50',
  },
  // Game-specific spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  // Game UI specific
  gameUI: {
    cardRadius: 12,
    buttonRadius: 8,
    borderWidth: 2,
    shadowElevation: 4,
  },
};