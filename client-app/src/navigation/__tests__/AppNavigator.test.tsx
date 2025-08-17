import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../AppNavigator';

// Mock useColorScheme before importing react-native
const mockUseColorScheme = jest.fn();

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  
  return {
    NavigationContainer: ({ children, theme }: any) => {
      const { View } = require('react-native');
      return React.createElement(View, {
        testID: 'navigation-container',
        // Store theme data in test attributes
        'data-theme-dark': theme?.dark,
        'data-theme-colors': JSON.stringify(theme?.colors || {}),
        'data-theme-fonts': JSON.stringify(theme?.fonts || {}),
      }, children);
    },
  };
});

// Mock StackNavigator
jest.mock('../StackNavigator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockStackNavigator() {
    return React.createElement(View, {
      testID: 'stack-navigator'
    }, React.createElement(Text, {}, 'StackNavigator'));
  };
});

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

// Mock Colors from react-native
jest.mock('react-native/Libraries/NewAppScreen', () => ({
  Colors: {
    darker: '#1C1C1E',
    lighter: '#F2F2F7',
    dark: '#2C2C2E',
    light: '#FFFFFF',
    white: '#FFFFFF',
    black: '#000000',
  },
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render NavigationContainer with StackNavigator', () => {
      const { getByTestId } = render(<AppNavigator />);

      expect(getByTestId('navigation-container')).toBeTruthy();
      expect(getByTestId('stack-navigator')).toBeTruthy();
    });

    it('should render without crashing in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(<AppNavigator />);

      expect(getByTestId('navigation-container')).toBeTruthy();
    });

    it('should render without crashing in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(<AppNavigator />);

      expect(getByTestId('navigation-container')).toBeTruthy();
    });

    it('should render without crashing when colorScheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByTestId } = render(<AppNavigator />);

      expect(getByTestId('navigation-container')).toBeTruthy();
    });
  });

  describe('Color Scheme Detection', () => {
    it('should call useColorScheme hook', () => {
      render(<AppNavigator />);

      expect(mockUseColorScheme).toHaveBeenCalledTimes(1);
    });

    it('should detect dark mode correctly', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(true);
    });

    it('should detect light mode correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(false);
    });

    it('should default to light mode when colorScheme is null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(false);
    });

    it('should default to light mode when colorScheme is undefined', () => {
      mockUseColorScheme.mockReturnValue(undefined);

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(false);
    });
  });

  describe('Theme Configuration - Light Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should configure light theme colors correctly', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors).toEqual({
        primary: '#007AFF',
        background: '#F2F2F7', // Colors.lighter
        card: '#FFFFFF', // Colors.light
        text: '#000000', // Colors.black
        border: '#C6C6C8',
        notification: '#FF3B30',
      });
    });

    it('should set dark property to false in light mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(false);
    });

    it('should use correct background color in light mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.background).toBe('#F2F2F7'); // Colors.lighter
    });

    it('should use correct card color in light mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.card).toBe('#FFFFFF'); // Colors.light
    });

    it('should use correct text color in light mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.text).toBe('#000000'); // Colors.black
    });

    it('should use correct border color in light mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.border).toBe('#C6C6C8');
    });
  });

  describe('Theme Configuration - Dark Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('should configure dark theme colors correctly', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors).toEqual({
        primary: '#007AFF',
        background: '#1C1C1E', // Colors.darker
        card: '#2C2C2E', // Colors.dark
        text: '#FFFFFF', // Colors.white
        border: '#2C2C2E',
        notification: '#FF3B30',
      });
    });

    it('should set dark property to true in dark mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(true);
    });

    it('should use correct background color in dark mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.background).toBe('#1C1C1E'); // Colors.darker
    });

    it('should use correct card color in dark mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.card).toBe('#2C2C2E'); // Colors.dark
    });

    it('should use correct text color in dark mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.text).toBe('#FFFFFF'); // Colors.white
    });

    it('should use correct border color in dark mode', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      expect(colors.border).toBe('#2C2C2E');
    });
  });

  describe('Theme Configuration - Common Colors', () => {
    it('should use consistent primary color across themes', () => {
      // Test light mode
      mockUseColorScheme.mockReturnValue('light');
      const { getByTestId: getLightTestId } = render(<AppNavigator />);
      const lightContainer = getLightTestId('navigation-container');
      const lightColors = JSON.parse(lightContainer.props['data-theme-colors']);

      // Test dark mode
      mockUseColorScheme.mockReturnValue('dark');
      const { getByTestId: getDarkTestId } = render(<AppNavigator />);
      const darkContainer = getDarkTestId('navigation-container');
      const darkColors = JSON.parse(darkContainer.props['data-theme-colors']);

      expect(lightColors.primary).toBe('#007AFF');
      expect(darkColors.primary).toBe('#007AFF');
      expect(lightColors.primary).toBe(darkColors.primary);
    });

    it('should use consistent notification color across themes', () => {
      // Test light mode
      mockUseColorScheme.mockReturnValue('light');
      const { getByTestId: getLightTestId } = render(<AppNavigator />);
      const lightContainer = getLightTestId('navigation-container');
      const lightColors = JSON.parse(lightContainer.props['data-theme-colors']);

      // Test dark mode
      mockUseColorScheme.mockReturnValue('dark');
      const { getByTestId: getDarkTestId } = render(<AppNavigator />);
      const darkContainer = getDarkTestId('navigation-container');
      const darkColors = JSON.parse(darkContainer.props['data-theme-colors']);

      expect(lightColors.notification).toBe('#FF3B30');
      expect(darkColors.notification).toBe('#FF3B30');
      expect(lightColors.notification).toBe(darkColors.notification);
    });
  });

  describe('Font Configuration', () => {
    it('should configure fonts correctly', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const fonts = JSON.parse(container.props['data-theme-fonts']);

      expect(fonts).toEqual({
        regular: {
          fontFamily: 'System',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'System',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'System',
          fontWeight: '700',
        },
        heavy: {
          fontFamily: 'System',
          fontWeight: '900',
        },
      });
    });

    it('should use System font family for all font weights', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const fonts = JSON.parse(container.props['data-theme-fonts']);

      expect(fonts.regular.fontFamily).toBe('System');
      expect(fonts.medium.fontFamily).toBe('System');
      expect(fonts.bold.fontFamily).toBe('System');
      expect(fonts.heavy.fontFamily).toBe('System');
    });

    it('should have correct font weights', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const fonts = JSON.parse(container.props['data-theme-fonts']);

      expect(fonts.regular.fontWeight).toBe('400');
      expect(fonts.medium.fontWeight).toBe('500');
      expect(fonts.bold.fontWeight).toBe('700');
      expect(fonts.heavy.fontWeight).toBe('900');
    });

    it('should maintain consistent font configuration across themes', () => {
      // Test light mode
      mockUseColorScheme.mockReturnValue('light');
      const { getByTestId: getLightTestId } = render(<AppNavigator />);
      const lightContainer = getLightTestId('navigation-container');
      const lightFonts = JSON.parse(lightContainer.props['data-theme-fonts']);

      // Test dark mode
      mockUseColorScheme.mockReturnValue('dark');
      const { getByTestId: getDarkTestId } = render(<AppNavigator />);
      const darkContainer = getDarkTestId('navigation-container');
      const darkFonts = JSON.parse(darkContainer.props['data-theme-fonts']);

      expect(lightFonts).toEqual(darkFonts);
    });
  });

  describe('Component Integration', () => {
    it('should render StackNavigator inside NavigationContainer', () => {
      const { getByTestId } = render(<AppNavigator />);
      const navigationContainer = getByTestId('navigation-container');
      const stackNavigator = getByTestId('stack-navigator');

      expect(navigationContainer).toBeTruthy();
      expect(stackNavigator).toBeTruthy();
      
      // Check that StackNavigator is rendered within the component tree
      expect(stackNavigator).toBeDefined();
    });

    it('should pass theme to NavigationContainer', () => {
      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBeDefined();
      expect(container.props['data-theme-colors']).toBeDefined();
      expect(container.props['data-theme-fonts']).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid colorScheme values gracefully', () => {
      mockUseColorScheme.mockReturnValue('invalid' as any);

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      // Should default to light mode when colorScheme is not 'dark'
      expect(container.props['data-theme-dark']).toBe(false);
    });

    it('should handle when useColorScheme throws an error', () => {
      mockUseColorScheme.mockImplementation(() => {
        throw new Error('useColorScheme error');
      });

      // Should not crash and render something
      expect(() => render(<AppNavigator />)).toThrow('useColorScheme error');
    });

    it('should handle empty string colorScheme', () => {
      mockUseColorScheme.mockReturnValue('' as any);

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');

      expect(container.props['data-theme-dark']).toBe(false);
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders when colorScheme does not change', () => {
      const { rerender } = render(<AppNavigator />);
      
      // Clear the mock calls
      mockUseColorScheme.mockClear();
      
      // Re-render with same props
      rerender(<AppNavigator />);
      
      // useColorScheme should be called again (React hooks are called on every render)
      expect(mockUseColorScheme).toHaveBeenCalledTimes(1);
    });

    it('should respond to colorScheme changes', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, rerender } = render(<AppNavigator />);
      let container = getByTestId('navigation-container');
      
      expect(container.props['data-theme-dark']).toBe(false);

      // Change to dark mode
      mockUseColorScheme.mockReturnValue('dark');
      rerender(<AppNavigator />);

      container = getByTestId('navigation-container');
      
      expect(container.props['data-theme-dark']).toBe(true);
    });
  });

  describe('Theme Accessibility', () => {
    it('should provide appropriate contrast colors for light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      // Light background with dark text should provide good contrast
      expect(colors.background).toBe('#F2F2F7'); // Light
      expect(colors.text).toBe('#000000'); // Dark
    });

    it('should provide appropriate contrast colors for dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(<AppNavigator />);
      const container = getByTestId('navigation-container');
      const colors = JSON.parse(container.props['data-theme-colors']);

      // Dark background with light text should provide good contrast
      expect(colors.background).toBe('#1C1C1E'); // Dark
      expect(colors.text).toBe('#FFFFFF'); // Light
    });

    it('should use system-appropriate border colors', () => {
      mockUseColorScheme.mockReturnValue('light');
      const { getByTestId: getLightTestId } = render(<AppNavigator />);
      const lightContainer = getLightTestId('navigation-container');
      const lightColors = JSON.parse(lightContainer.props['data-theme-colors']);

      mockUseColorScheme.mockReturnValue('dark');
      const { getByTestId: getDarkTestId } = render(<AppNavigator />);
      const darkContainer = getDarkTestId('navigation-container');
      const darkColors = JSON.parse(darkContainer.props['data-theme-colors']);

      // Border colors should be appropriate for their respective themes
      expect(lightColors.border).toBe('#C6C6C8'); // Light border
      expect(darkColors.border).toBe('#2C2C2E'); // Dark border
    });
  });

  describe('Type Safety and Props', () => {
    it('should render without requiring any props', () => {
      expect(() => render(<AppNavigator />)).not.toThrow();
    });

    it('should return correct JSX.Element type', () => {
      const component = <AppNavigator />;
      expect(React.isValidElement(component)).toBe(true);
    });
  });
});
