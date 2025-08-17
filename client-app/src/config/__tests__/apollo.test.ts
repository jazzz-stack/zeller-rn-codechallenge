import { Platform } from 'react-native';

// Mock console methods to track calls
const mockConsoleWarn = jest.fn();
const mockConsoleLog = jest.fn();

// Store original console methods
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.warn = mockConsoleWarn;
  console.log = mockConsoleLog;
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  mockConsoleWarn.mockClear();
  mockConsoleLog.mockClear();
});

// Mock React Native Platform before any imports
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios', // Default to iOS
  },
}));

// Mock Apollo Client modules with proper error handling
jest.mock('@apollo/client', () => {
  const mockCreateHttpLink = jest.fn().mockImplementation((config) => ({
    uri: config.uri,
    type: 'http',
  }));
  
  return {
    ApolloClient: jest.fn().mockImplementation((config) => ({
      link: config.link,
      cache: config.cache,
      defaultOptions: config.defaultOptions,
    })),
    InMemoryCache: jest.fn().mockImplementation(() => ({})),
    createHttpLink: mockCreateHttpLink,
  };
});

describe('Apollo Client Configuration', () => {
  let mockErrorHandler: jest.Mock;
  let mockForward: jest.Mock;
  let mockConcat: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockConsoleWarn.mockClear();
    mockConsoleLog.mockClear();

    // Create fresh mock functions for each test
    mockForward = jest.fn().mockReturnValue('forwarded-result');
    mockConcat = jest.fn().mockImplementation((link) => ({ ...link, concatenated: true }));
    
    // Mock onError to capture and execute the error handler
    mockErrorHandler = jest.fn();
    
    jest.doMock('@apollo/client/link/error', () => ({
      onError: jest.fn().mockImplementation((handler) => {
        mockErrorHandler = handler;
        return {
          concat: mockConcat,
        };
      }),
    }));
  });

  it('should use localhost URL for iOS platform', () => {
    // Set Platform.OS to iOS
    const platformMock = require('react-native').Platform;
    platformMock.OS = 'ios';

    // Import apollo after setting the platform
    require('../apollo');

    const { createHttpLink } = require('@apollo/client');
    expect(createHttpLink).toHaveBeenCalledWith({
      uri: 'http://localhost:9002',
    });
  });

  it('should use 10.0.2.2 URL for Android platform', () => {
    // Set Platform.OS to Android
    const platformMock = require('react-native').Platform;
    platformMock.OS = 'android';

    // Import apollo after setting the platform
    require('../apollo');

    const { createHttpLink } = require('@apollo/client');
    expect(createHttpLink).toHaveBeenCalledWith({
      uri: 'http://10.0.2.2:9002',
    });
  });

  it('should create Apollo Client with correct configuration', () => {
    // Import apollo
    require('../apollo');

    const { ApolloClient, InMemoryCache } = require('@apollo/client');

    expect(ApolloClient).toHaveBeenCalledWith({
      link: expect.any(Object),
      cache: expect.any(Object),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'cache-first',
          errorPolicy: 'all',
        },
      },
    });

    expect(InMemoryCache).toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Import apollo to initialize the error handler
      require('../apollo');
    });

    it('should handle GraphQL errors by logging warnings', () => {
      const graphQLErrors = [
        {
          message: 'Test GraphQL error',
          locations: [{ line: 1, column: 1 }],
          path: ['testField'],
        },
        {
          message: 'Another GraphQL error',
          locations: [{ line: 2, column: 2 }],
          path: ['anotherField'],
        },
      ];

      const mockOperation = {
        operationName: 'TestQuery',
        variables: {},
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors,
        networkError: null,
        operation: mockOperation,
        forward: mockForward,
      });

      // Check that console.warn was called for each GraphQL error
      expect(mockConsoleWarn).toHaveBeenCalledTimes(2);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[GraphQL error]: Message: Test GraphQL error, Location: [object Object], Path: testField'
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[GraphQL error]: Message: Another GraphQL error, Location: [object Object], Path: anotherField'
      );

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should handle network errors for non-background operations silently', () => {
      const networkError = new Error('Network connection failed');
      const mockOperation = {
        operationName: 'TestQuery',
        variables: {},
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors: null,
        networkError,
        operation: mockOperation,
        forward: mockForward,
      });

      // Network errors should be handled silently (no console logs)
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should handle network errors for background operations silently', () => {
      const networkError = new Error('Network connection failed');
      const mockOperation = {
        operationName: 'backgroundSyncQuery',
        variables: {},
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors: null,
        networkError,
        operation: mockOperation,
        forward: mockForward,
      });

      // Background operations should also be handled silently
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should handle network errors for operations with background variable', () => {
      const networkError = new Error('Network connection failed');
      const mockOperation = {
        operationName: 'TestQuery',
        variables: { background: true },
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors: null,
        networkError,
        operation: mockOperation,
        forward: mockForward,
      });

      // Background operations should be handled silently
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should handle both GraphQL and network errors together', () => {
      const graphQLErrors = [
        {
          message: 'GraphQL error with network issue',
          locations: [{ line: 1, column: 1 }],
          path: ['testField'],
        },
      ];
      const networkError = new Error('Network connection failed');
      const mockOperation = {
        operationName: 'TestQuery',
        variables: {},
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors,
        networkError,
        operation: mockOperation,
        forward: mockForward,
      });

      // GraphQL errors should be logged
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[GraphQL error]: Message: GraphQL error with network issue, Location: [object Object], Path: testField'
      );

      // Network errors should be handled silently
      // No additional console calls for network error

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should handle errors when operation has no operationName', () => {
      const networkError = new Error('Network connection failed');
      const mockOperation = {
        operationName: null,
        variables: {},
      };

      // Execute the error handler
      const result = mockErrorHandler({
        graphQLErrors: null,
        networkError,
        operation: mockOperation,
        forward: mockForward,
      });

      // Should handle gracefully without crashes
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });

    it('should forward operation even when no errors occur', () => {
      const mockOperation = {
        operationName: 'TestQuery',
        variables: {},
      };

      // Execute the error handler with no errors
      const result = mockErrorHandler({
        graphQLErrors: null,
        networkError: null,
        operation: mockOperation,
        forward: mockForward,
      });

      // No console calls should be made
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Check that the operation is forwarded
      expect(mockForward).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('forwarded-result');
    });
  });
});
