import { Platform } from 'react-native';

const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF'; // Vibrant system blue for dark mode

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#8E8E93',
    tabIconDefault: '#C7C7CC',
    tabIconSelected: tintColorLight,
    card: '#F2F2F7',
    border: '#E5E5EA',
    notification: '#FF3B30',
    secondaryText: '#8E8E93',
  },
  dark: {
    text: '#F2F2F7',
    background: '#121212', // Pure charcoal background
    tint: tintColorDark,
    icon: '#98989D',
    tabIconDefault: '#48484A',
    tabIconSelected: tintColorDark,
    card: '#1C1C1E', // Layered dark gray for cards
    border: '#38383A',
    notification: '#FF453A',
    secondaryText: '#8E8E93',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
};
