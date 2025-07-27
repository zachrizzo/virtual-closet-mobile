import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    secondary: '#FF6B6B',
    tertiary: '#4ECDC4',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    error: '#FF5252',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1A1A1A',
    onBackground: '#1A1A1A',
    outline: '#E0E0E0',
    elevation: {
      level0: 'transparent',
      level1: '#F5F5F5',
      level2: '#EEEEEE',
      level3: '#E0E0E0',
      level4: '#D6D6D6',
      level5: '#CCCCCC',
    },
  },
  roundness: 12,
};