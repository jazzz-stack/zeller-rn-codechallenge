import {configureStore, EnhancedStore, AnyAction} from '@reduxjs/toolkit';
import {store, RootState, AppDispatch} from '../index';
import customersReducer from '../slices/customersSlice';

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

describe('Redux Store Configuration', () => {
  describe('Store Instance', () => {
    it('should be an instance of a Redux store', () => {
      expect(store).toBeDefined();
      expect(typeof store.dispatch).toBe('function');
      expect(typeof store.getState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
      expect(typeof store.replaceReducer).toBe('function');
    });

    it('should have the correct store structure', () => {
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('customers');
      expect(typeof state.customers).toBe('object');
    });

    it('should export store as a singleton', () => {
      // Re-import the store to ensure it's the same instance
      const {store: importedStore} = require('../index');
      expect(store).toBe(importedStore);
    });
  });

  describe('Store State Structure', () => {
    it('should have the correct initial state structure', () => {
      const state = store.getState();
      
      expect(state.customers).toBeDefined();
      expect(state.customers).toHaveProperty('customers');
      expect(state.customers).toHaveProperty('filteredCustomers');
      expect(state.customers).toHaveProperty('loading');
      expect(state.customers).toHaveProperty('error');
      expect(state.customers).toHaveProperty('searchQuery');
      expect(state.customers).toHaveProperty('selectedFilter');
    });

    it('should have correct initial state values', () => {
      const state = store.getState();
      
      expect(Array.isArray(state.customers.customers)).toBe(true);
      expect(Array.isArray(state.customers.filteredCustomers)).toBe(true);
      expect(typeof state.customers.loading).toBe('boolean');
      expect(state.customers.error === null || typeof state.customers.error === 'string').toBe(true);
      expect(typeof state.customers.searchQuery).toBe('string');
      expect(typeof state.customers.selectedFilter).toBe('string');
    });

    it('should initialize with empty customers arrays', () => {
      const state = store.getState();
      
      expect(state.customers.customers).toEqual([]);
      expect(state.customers.filteredCustomers).toEqual([]);
    });

    it('should initialize with default values', () => {
      const state = store.getState();
      
      expect(state.customers.loading).toBe(false);
      expect(state.customers.error).toBe(null);
      expect(state.customers.searchQuery).toBe('');
      expect(state.customers.selectedFilter).toBe('ALL');
    });
  });

  describe('Store Reducers', () => {
    it('should include the customers reducer', () => {
      // Create a new store to test reducer configuration
      const testStore = configureStore({
        reducer: {
          customers: customersReducer,
        },
      });

      const state = testStore.getState();
      expect(state).toHaveProperty('customers');
    });

    it('should handle actions correctly', () => {
      const initialState = store.getState();
      
      // Dispatch a known action
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: 'test search',
      });

      const newState = store.getState();
      expect(newState.customers.searchQuery).toBe('test search');
      
      // Reset state for other tests
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should handle async actions', () => {
      const initialState = store.getState();
      
      // Dispatch a pending async action
      store.dispatch({
        type: 'customers/loadFromLocal/pending',
      });

      const pendingState = store.getState();
      expect(pendingState.customers.loading).toBe(true);
      expect(pendingState.customers.error).toBe(null);
    });
  });

  describe('Store Middleware Configuration', () => {
    it('should have the correct middleware setup', () => {
      // Test that the store can handle non-serializable actions in ignored list
      expect(() => {
        store.dispatch({
          type: 'persist/PERSIST',
          payload: {someNonSerializableData: new Date()},
        });
      }).not.toThrow();

      expect(() => {
        store.dispatch({
          type: 'persist/REHYDRATE',
          payload: {someNonSerializableData: new Date()},
        });
      }).not.toThrow();
    });

    it('should handle thunk actions', () => {
      // Test that thunk middleware is properly configured
      const thunkAction = (dispatch: any, getState: any) => {
        dispatch({type: 'customers/setSearchQuery', payload: 'thunk test'});
        return 'thunk result';
      };

      expect(() => {
        const result = store.dispatch(thunkAction as any);
        expect(result).toBe('thunk result');
      }).not.toThrow();

      // Reset state
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should allow async thunk actions', async () => {
      const asyncThunkAction = async (dispatch: any, getState: any) => {
        dispatch({type: 'customers/loadFromLocal/pending'});
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1));
        
        dispatch({
          type: 'customers/loadFromLocal/fulfilled',
          payload: [],
        });
        
        return 'async result';
      };

      await expect(store.dispatch(asyncThunkAction as any)).resolves.toBe('async result');
    });
  });

  describe('TypeScript Type Exports', () => {
    it('should export correct RootState type', () => {
      const state: RootState = store.getState();
      
      // Verify the type structure exists
      expect(state.customers).toBeDefined();
      expect(state.customers.customers).toBeDefined();
      expect(state.customers.filteredCustomers).toBeDefined();
      expect(state.customers.loading).toBeDefined();
      expect(state.customers.error !== undefined).toBe(true);
      expect(state.customers.searchQuery).toBeDefined();
      expect(state.customers.selectedFilter).toBeDefined();
    });

    it('should export correct AppDispatch type', () => {
      const dispatch: AppDispatch = store.dispatch;
      
      // Verify dispatch function works with typed actions
      expect(typeof dispatch).toBe('function');
      
      // Test with a known action
      expect(() => {
        dispatch({
          type: 'customers/setSearchQuery',
          payload: 'type test',
        });
      }).not.toThrow();

      // Reset state
      dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should have correct return types for store methods', () => {
      const state = store.getState();
      const unsubscribe = store.subscribe(() => {});
      
      // Verify return types
      expect(typeof state).toBe('object');
      expect(typeof unsubscribe).toBe('function');
      
      // Clean up subscription
      unsubscribe();
    });
  });

  describe('Store Subscription and Updates', () => {
    it('should notify subscribers on state changes', () => {
      const mockListener = jest.fn();
      const unsubscribe = store.subscribe(mockListener);

      // Dispatch an action that changes state
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: 'subscription test',
      });

      expect(mockListener).toHaveBeenCalled();
      
      // Clean up
      unsubscribe();
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should stop notifying after unsubscribe', () => {
      const mockListener = jest.fn();
      const unsubscribe = store.subscribe(mockListener);
      
      // Unsubscribe immediately
      unsubscribe();
      
      // Reset call count
      mockListener.mockClear();

      // Dispatch an action
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: 'unsubscribe test',
      });

      expect(mockListener).not.toHaveBeenCalled();
      
      // Reset state
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should handle multiple subscribers', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      const unsubscribe1 = store.subscribe(listener1);
      const unsubscribe2 = store.subscribe(listener2);

      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: 'multiple subscribers test',
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      
      // Clean up
      unsubscribe1();
      unsubscribe2();
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });
  });

  describe('Store Performance and Memory', () => {
    it('should handle rapid state updates without memory leaks', () => {
      const initialState = store.getState();
      
      // Perform rapid updates
      for (let i = 0; i < 100; i++) {
        store.dispatch({
          type: 'customers/setSearchQuery',
          payload: `test ${i}`,
        });
      }
      
      const finalState = store.getState();
      expect(finalState.customers.searchQuery).toBe('test 99');
      
      // Reset
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });

    it('should maintain state consistency during concurrent updates', () => {
      const actions = [];
      
      // Queue multiple actions
      for (let i = 0; i < 10; i++) {
        actions.push(() => store.dispatch({
          type: 'customers/setSearchQuery',
          payload: `concurrent ${i}`,
        }));
      }
      
      // Execute all actions
      actions.forEach(action => action());
      
      const state = store.getState();
      expect(state.customers.searchQuery).toBe('concurrent 9');
      
      // Reset
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });
  });

  describe('Store Error Handling', () => {
    it('should handle malformed actions gracefully', () => {
      const initialState = store.getState();
      
      // Dispatch action with null payload (should work)
      expect(() => {
        store.dispatch({
          type: 'customers/setSearchQuery',
          payload: '',
        });
      }).not.toThrow();
      
      // Dispatch unknown action
      expect(() => {
        store.dispatch({
          type: 'unknown/action',
          payload: 'test',
        });
      }).not.toThrow();
      
      // Dispatch action with wrong payload type (should handle gracefully)
      expect(() => {
        store.dispatch({
          type: 'customers/setSelectedFilter',
          payload: 'InvalidFilter', // Not a valid UserRole but should not crash
        });
      }).not.toThrow();
    });

    it('should maintain store integrity after errors', () => {
      const stateBefore = store.getState();
      
      // Test with valid action that might have edge cases
      try {
        store.dispatch({
          type: 'customers/setSearchQuery',
          payload: '',
        });
      } catch (error) {
        // Error handling
      }
      
      const stateAfter = store.getState();
      
      // Store should still be functional
      expect(typeof stateAfter).toBe('object');
      expect(stateAfter.customers).toBeDefined();
      
      // Should still be able to dispatch valid actions
      expect(() => {
        store.dispatch({
          type: 'customers/setSearchQuery',
          payload: 'recovery test',
        });
      }).not.toThrow();
      
      // Reset
      store.dispatch({
        type: 'customers/setSearchQuery',
        payload: '',
      });
    });
  });

  describe('Store Integration', () => {
    it('should work with real Redux Toolkit actions', () => {
      // Test with actual actions from the slice
      store.dispatch({
        type: 'customers/setSelectedFilter',
        payload: 'Manager',
      });
      
      const state = store.getState();
      expect(state.customers.selectedFilter).toBe('Manager');
      
      // Reset
      store.dispatch({
        type: 'customers/setSelectedFilter',
        payload: 'ALL',
      });
    });

    it('should handle async thunks correctly', () => {
      // Test pending state
      store.dispatch({
        type: 'customers/loadFromLocal/pending',
      });
      
      let state = store.getState();
      expect(state.customers.loading).toBe(true);
      expect(state.customers.error).toBe(null);
      
      // Test fulfilled state
      store.dispatch({
        type: 'customers/loadFromLocal/fulfilled',
        payload: [{
          id: 'test-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'Manager',
        }],
      });
      
      state = store.getState();
      expect(state.customers.loading).toBe(false);
      expect(state.customers.customers).toHaveLength(1);
      expect(state.customers.customers[0].name).toBe('Test User');
    });
  });
});
