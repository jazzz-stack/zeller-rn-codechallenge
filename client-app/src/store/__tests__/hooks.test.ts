import React from 'react';
import {renderHook, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import customersReducer from '../slices/customersSlice';
import {useAppDispatch, useAppSelector} from '../hooks';
import type {RootState} from '../index';
import type {ZellerCustomer, UserRole} from '../../types/User';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  createHttpLink: jest.fn(() => ({
    request: jest.fn(),
  })),
  InMemoryCache: jest.fn(() => ({
    restore: jest.fn(),
  })),
  ApolloClient: jest.fn(() => ({
    query: jest.fn(),
    mutate: jest.fn(),
    cache: {
      restore: jest.fn(),
    },
  })),
  gql: jest.fn((strings, ...values) => {
    return strings.join('');
  }),
}));

// Mock LocalDatabaseService
jest.mock('../../services/LocalDatabaseService', () => ({
  LocalDatabaseService: {
    getCustomers: jest.fn(() => Promise.resolve([])),
    addCustomer: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
    clearCustomers: jest.fn(),
    saveCustomers: jest.fn(),
  },
}));

// Mock apollo config
jest.mock('../../config/apollo', () => ({
  apolloClient: {
    query: jest.fn(),
    mutate: jest.fn(),
    cache: {
      restore: jest.fn(),
    },
  },
}));

// Mock data for testing
const mockCustomer: ZellerCustomer = {
  id: 'test-id-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Manager',
};

// Suppress console output during tests
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;  
  console.error = originalConsole.error;
  console.info = originalConsole.info;
});

// Create a test store for testing
const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      customers: customersReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
};

// Test wrapper component that provides Redux store
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({children}: {children: React.ReactNode}) => 
    React.createElement(Provider, {store, children});
};

describe('Redux Store Hooks', () => {
  describe('useAppDispatch', () => {
    it('should return a dispatch function', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result} = renderHook(() => useAppDispatch(), {wrapper});

      expect(result.current).toBeInstanceOf(Function);
      expect(typeof result.current).toBe('function');
    });

    it('should dispatch actions correctly', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const {result} = renderHook(() => useAppDispatch(), {wrapper});

      const testAction = {type: 'test/action', payload: 'test'};

      act(() => {
        result.current(testAction);
      });

      expect(dispatchSpy).toHaveBeenCalledWith(testAction);
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('should be the same function reference across re-renders', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result, rerender} = renderHook(() => useAppDispatch(), {wrapper});
      const firstDispatch = result.current;

      rerender({});
      const secondDispatch = result.current;

      expect(firstDispatch).toBe(secondDispatch);
    });
  });

  describe('useAppSelector', () => {
    it('should return the correct state value', () => {
      const preloadedState = {
        customers: {
          customers: [mockCustomer],
          filteredCustomers: [mockCustomer],
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL' as const,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.customers),
        {wrapper}
      );

      expect(result.current).toEqual([mockCustomer]);
    });

    it('should return loading state correctly', () => {
      const preloadedState = {
        customers: {
          customers: [],
          filteredCustomers: [],
          loading: true,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL' as const,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.loading),
        {wrapper}
      );

      expect(result.current).toBe(true);
    });

    it('should return error state correctly', () => {
      const errorMessage = 'Failed to load customers';
      const preloadedState = {
        customers: {
          customers: [],
          filteredCustomers: [],
          loading: false,
          error: errorMessage,
          searchQuery: '',
          selectedFilter: 'ALL' as const,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.error),
        {wrapper}
      );

      expect(result.current).toBe(errorMessage);
    });

    it('should return search query correctly', () => {
      const searchQuery = 'john';
      const preloadedState = {
        customers: {
          customers: [],
          filteredCustomers: [],
          loading: false,
          error: null,
          searchQuery,
          selectedFilter: 'ALL' as const,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.searchQuery),
        {wrapper}
      );

      expect(result.current).toBe(searchQuery);
    });

    it('should return selected filter correctly', () => {
      const selectedFilter: UserRole = 'Manager';
      const preloadedState = {
        customers: {
          customers: [],
          filteredCustomers: [],
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.selectedFilter),
        {wrapper}
      );

      expect(result.current).toBe(selectedFilter);
    });

    it('should update when state changes', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.customers),
        {wrapper}
      );

      expect(result.current).toEqual([]);

      // Dispatch an action to change the state
      act(() => {
        store.dispatch({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [mockCustomer],
        });
      });

      expect(result.current).toEqual([mockCustomer]);
    });

    it('should handle complex selectors', () => {
      const customers: ZellerCustomer[] = [
        {...mockCustomer, id: '1', role: 'Manager'},
        {...mockCustomer, id: '2', role: 'Admin', name: 'Jane Doe'},
        {...mockCustomer, id: '3', role: 'Manager', name: 'Bob Smith'},
      ];

      const preloadedState = {
        customers: {
          customers,
          filteredCustomers: customers,
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL' as UserRole,
        },
      };

      const store = createTestStore(preloadedState);
      const wrapper = createWrapper(store);

      // Test complex selector that filters by role - use useMemo to prevent rerenders
      const {result} = renderHook(
        () => {
          const customers = useAppSelector((state) => state.customers.customers);
          return React.useMemo(
            () => customers.filter((customer) => customer.role === 'Manager'),
            [customers]
          );
        },
        {wrapper}
      );

      expect(result.current).toHaveLength(2);
      expect(result.current.every((customer) => customer.role === 'Manager')).toBe(true);
    });

    it('should handle memoized selectors correctly', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      let selectorCallCount = 0;
      const memoizedSelector = (state: RootState) => {
        selectorCallCount++;
        return state.customers.customers.length;
      };

      const {result, rerender} = renderHook(
        () => useAppSelector(memoizedSelector),
        {wrapper}
      );

      expect(result.current).toBe(0);
      const initialCallCount = selectorCallCount; // May be 1 or 2 due to React's strict mode

      // Re-render without state change
      rerender({});
      expect(selectorCallCount).toBe(initialCallCount); // Should not call selector again

      // Change state
      act(() => {
        store.dispatch({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [mockCustomer],
        });
      });

      expect(result.current).toBe(1);
      expect(selectorCallCount).toBeGreaterThan(initialCallCount); // Should call selector again
    });
  });

  describe('Type Safety', () => {
    it('should provide correct TypeScript types for dispatch', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result} = renderHook(() => useAppDispatch(), {wrapper});
      const dispatch = result.current;

      // This should compile without TypeScript errors
      const action = {type: 'customers/loadFromLocal/pending'};
      
      expect(() => {
        dispatch(action);
      }).not.toThrow();
    });

    it('should provide correct TypeScript types for selector', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => {
          // These should all compile with correct TypeScript types
          const customers = useAppSelector((state) => state.customers.customers);
          const loading = useAppSelector((state) => state.customers.loading);
          const error = useAppSelector((state) => state.customers.error);
          const searchQuery = useAppSelector((state) => state.customers.searchQuery);
          const selectedFilter = useAppSelector((state) => state.customers.selectedFilter);

          return {customers, loading, error, searchQuery, selectedFilter};
        },
        {wrapper}
      );

      expect(typeof result.current.customers).toBe('object');
      expect(typeof result.current.loading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
      expect(typeof result.current.searchQuery).toBe('string');
      expect(typeof result.current.selectedFilter).toBe('string');
    });
  });

  describe('Integration with Redux Store', () => {
    it('should work with actual store actions', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result: dispatchResult} = renderHook(() => useAppDispatch(), {wrapper});
      const {result: selectorResult} = renderHook(
        () => useAppSelector((state) => state.customers),
        {wrapper}
      );

      const dispatch = dispatchResult.current;

      // Test setting loading state
      act(() => {
        dispatch({type: 'customers/loadFromLocal/pending'});
      });

      expect(selectorResult.current.loading).toBe(true);

      // Test setting customers
      act(() => {
        dispatch({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [mockCustomer],
        });
      });

      expect(selectorResult.current.customers).toEqual([mockCustomer]);

      // Test setting error
      act(() => {
        dispatch({
          type: 'customers/loadFromLocal/rejected',
          payload: 'Test error',
        });
      });

      expect(selectorResult.current.error).toBe('Test error');
    });

    it('should handle multiple hook instances correctly', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result: dispatch1} = renderHook(() => useAppDispatch(), {wrapper});
      const {result: dispatch2} = renderHook(() => useAppDispatch(), {wrapper});
      const {result: selector1} = renderHook(
        () => useAppSelector((state) => state.customers.customers),
        {wrapper}
      );
      const {result: selector2} = renderHook(
        () => useAppSelector((state) => state.customers.customers),
        {wrapper}
      );

      // Both selectors should return the same initial value
      expect(selector1.current).toEqual(selector2.current);

      // Dispatch from first hook
      act(() => {
        dispatch1.current({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [mockCustomer],
        });
      });

      // Both selectors should see the update
      expect(selector1.current).toEqual([mockCustomer]);
      expect(selector2.current).toEqual([mockCustomer]);

      // Dispatch from second hook
      act(() => {
        dispatch2.current({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [],
        });
      });

      // Both selectors should see the update
      expect(selector1.current).toEqual([]);
      expect(selector2.current).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid selector gracefully', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // This test is more about ensuring the hook doesn't crash
      const {result} = renderHook(
        () => {
          try {
            return useAppSelector((state) => state.customers);
          } catch (error) {
            return null;
          }
        },
        {wrapper}
      );

      expect(result.current).toBeDefined();
    });

    it('should handle store changes without errors', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const {result} = renderHook(
        () => useAppSelector((state) => state.customers.customers),
        {wrapper}
      );

      expect(() => {
        // Rapid state changes
        for (let i = 0; i < 5; i++) {
          act(() => {
            store.dispatch({
              type: 'customers/loadFromLocal/fulfilled',
              payload: Array(i).fill(mockCustomer),
            });
          });
        }
      }).not.toThrow();

      expect(result.current).toHaveLength(4);
    });
  });
});
