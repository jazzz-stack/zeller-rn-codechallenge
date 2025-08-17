import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform, StatusBar } from 'react-native';
import StackNavigator from '../StackNavigator';

// Setup console suppression
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Mock React Navigation with a simple implementation
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => {
      const { View } = require('react-native');
      return <View testID="navigator">{children}</View>;
    },
    Screen: ({ name }: any) => {
      const { View, Text } = require('react-native');
      return <View testID={`screen-${name}`}><Text>{name}</Text></View>;
    },
  }),
}));

// Mock the screen components  
jest.mock('../../containers', () => ({
  HomeScreen: () => {
    const { View, Text } = require('react-native');
    return <View testID="home"><Text>Home</Text></View>;
  },
  AddCustomerScreen: () => {
    const { View, Text } = require('react-native');
    return <View testID="add-customer"><Text>Add Customer</Text></View>;
  },
  EditCustomerScreen: () => {
    const { View, Text } = require('react-native');
    return <View testID="edit-customer"><Text>Edit Customer</Text></View>;
  },
}));

// Mock the navigation schema types
jest.mock('../schema_types/navigation-schema', () => ({}));

describe('StackNavigator', () => {
  let StackNavigator: any;

  beforeAll(() => {
    // Import StackNavigator once after mocks are set up
    StackNavigator = require('../StackNavigator').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default setup', () => {
    const { getByTestId } = render(<StackNavigator />);
    expect(getByTestId('navigator')).toBeTruthy();
  });

  it('should render all screens', () => {
    const { getByTestId } = render(<StackNavigator />);
    expect(getByTestId('screen-Home')).toBeTruthy();
    expect(getByTestId('screen-AddCustomer')).toBeTruthy();
    expect(getByTestId('screen-EditCustomer')).toBeTruthy();
  });

  it('should not crash when rendering', () => {
    expect(() => render(<StackNavigator />)).not.toThrow();
  });

  it('should render navigator with correct structure', () => {
    const { getByTestId } = render(<StackNavigator />);
    const navigator = getByTestId('navigator');
    expect(navigator).toBeTruthy();
    
    expect(getByTestId('screen-Home')).toBeTruthy();
    expect(getByTestId('screen-AddCustomer')).toBeTruthy();
    expect(getByTestId('screen-EditCustomer')).toBeTruthy();
  });

  // Test Platform.OS conditional logic for Android status bar styling
  describe('Platform-specific styling', () => {
    it('should render correctly on Android with StatusBar padding', () => {
      const originalOS = Platform.OS;
      const originalCurrentHeight = StatusBar.currentHeight;
      
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
      Object.defineProperty(StatusBar, 'currentHeight', { value: 24, configurable: true });

      try {
        const { getByTestId } = render(<StackNavigator />);
        expect(getByTestId('navigator')).toBeTruthy();
      } finally {
        Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
        Object.defineProperty(StatusBar, 'currentHeight', { value: originalCurrentHeight, configurable: true });
      }
    });

    it('should render correctly on non-Android platforms', () => {
      const originalOS = Platform.OS;
      
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });

      try {
        const { getByTestId } = render(<StackNavigator />);
        expect(getByTestId('navigator')).toBeTruthy();
      } finally {
        Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
      }
    });

    it('should handle undefined StatusBar.currentHeight on Android', () => {
      const originalOS = Platform.OS;
      const originalCurrentHeight = StatusBar.currentHeight;
      
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
      Object.defineProperty(StatusBar, 'currentHeight', { value: undefined, configurable: true });

      try {
        const { getByTestId } = render(<StackNavigator />);
        expect(getByTestId('navigator')).toBeTruthy();
      } finally {
        Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
        Object.defineProperty(StatusBar, 'currentHeight', { value: originalCurrentHeight, configurable: true });
      }
    });
      
  });
});
