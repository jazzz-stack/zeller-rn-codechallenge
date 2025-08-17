import { Platform, StatusBar } from 'react-native';

// Mock React Native Platform and StatusBar
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Platform: {
    OS: 'ios', // Default to iOS
  },
  StatusBar: {
    currentHeight: 24, // Default status bar height
  },
}));

describe('CustomerFormStyle', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should use Android-specific padding when Platform.OS is android', () => {
    const platformMock = require('react-native').Platform;
    const statusBarMock = require('react-native').StatusBar;
    platformMock.OS = 'android';
    statusBarMock.currentHeight = 24;

    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles.androidContainer.paddingTop).toBe(34); // 24 + 10
  });

  it('should use Android-specific padding when Platform.OS is android and StatusBar.currentHeight is null', () => {
    const platformMock = require('react-native').Platform;
    const statusBarMock = require('react-native').StatusBar;
    platformMock.OS = 'android';
    statusBarMock.currentHeight = null;

    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles.androidContainer.paddingTop).toBe(10); // 0 + 10 (fallback when currentHeight is null)
  });

  it('should use Android-specific padding when Platform.OS is android and StatusBar.currentHeight is undefined', () => {
    const platformMock = require('react-native').Platform;
    const statusBarMock = require('react-native').StatusBar;
    platformMock.OS = 'android';
    statusBarMock.currentHeight = undefined;

    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles.androidContainer.paddingTop).toBe(10); // 0 + 10 (fallback when currentHeight is undefined)
  });

  it('should use zero padding when Platform.OS is not android (iOS)', () => {
    const platformMock = require('react-native').Platform;
    platformMock.OS = 'ios';

    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles.androidContainer.paddingTop).toBe(0);
  });

  it('should use zero padding when Platform.OS is not android (other platform)', () => {
    const platformMock = require('react-native').Platform;
    platformMock.OS = 'web';

    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles.androidContainer.paddingTop).toBe(0);
  });

  it('should create all required style objects', () => {
    const { styles } = require('../CustomerForm/CustomerFormStyle');

    expect(styles).toHaveProperty('safeArea');
    expect(styles).toHaveProperty('keyboardContainer');
    expect(styles).toHaveProperty('scrollContainer');
    expect(styles).toHaveProperty('container');
    expect(styles).toHaveProperty('androidContainer');
    expect(styles).toHaveProperty('form');
    expect(styles).toHaveProperty('inputGroup');
    expect(styles).toHaveProperty('label');
    expect(styles).toHaveProperty('input');
    expect(styles).toHaveProperty('errorText');
    expect(styles).toHaveProperty('roleContainer');
    expect(styles).toHaveProperty('roleButton');
    expect(styles).toHaveProperty('selectedRole');
    expect(styles).toHaveProperty('roleText');
    expect(styles).toHaveProperty('buttonContainer');
  });
});
