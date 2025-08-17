
// Jest setup file for React Native testing with TypeScript

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  ApolloProvider: ({children}: {children: React.ReactNode}) => children,
}));

// Global test setup using Object.assign to avoid TypeScript errors
Object.assign(global, { __DEV__: true });
