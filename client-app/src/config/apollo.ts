import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {Platform} from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:9002';
  }
  return 'http://localhost:9002';
};

const httpLink = createHttpLink({
  uri: getApiUrl(), // Platform-specific Mock server URL
});

// Error handling link to catch and log network errors gracefully
const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({message, locations, path}) => {
      console.warn(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    // Only log network errors for non-background operations to reduce console spam
    const operationName = operation.operationName;
    const isBackgroundOperation = operationName?.includes('background') || 
                                 operation.variables?.background === true;
    
    if (!isBackgroundOperation) {
      // Suppress network error logs - they're expected when offline
      // The error will be handled by the Redux thunks appropriately
    }
  }

  // Forward the operation to the next link in the chain
  return forward(operation);
});

// Combine error link with http link
const link = errorLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all', // Don't crash on errors, return partial data
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});
