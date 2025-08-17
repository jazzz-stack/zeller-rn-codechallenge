import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
  },

  // Variants
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Colors
  primary: {
    color: '#000000',
  },
  secondary: {
    color: '#666666',
  },
  danger: {
    color: '#FF3B30',
  },
  success: {
    color: '#34C759',
  },
  warning: {
    color: '#FF9500',
  },
  info: {
    color: '#007AFF',
  },

  // Sizes
  small: {
    fontSize: 12,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 20,
  },

  // Weights
  normal: {
    fontWeight: 'normal',
  },
  bold: {
    fontWeight: 'bold',
  },
  light: {
    fontWeight: '300',
  },
});
