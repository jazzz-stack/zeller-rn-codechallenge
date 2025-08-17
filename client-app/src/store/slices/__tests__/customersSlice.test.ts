import {configureStore} from '@reduxjs/toolkit';
import {AnyAction} from '@reduxjs/toolkit';
import customersReducer, {
  loadCustomersFromLocal,
  syncCustomersFromAPI,
  backgroundSyncCustomersFromAPI,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSearchQuery,
  setSelectedFilter,
  clearError,
} from '../customersSlice';
import {ZellerCustomer, ZellerCustomerInput, UserRole} from '../../../types/User';
import {LocalDatabaseService} from '../../../services/LocalDatabaseService';

// Mock dependencies
jest.mock('../../../services/LocalDatabaseService');
jest.mock('../../../config/apollo', () => ({
  apolloClient: {
    query: jest.fn(),
  },
}));
jest.mock('../../../graphql/queries', () => ({
  listZellerCustomers: {},
}));

// Import the mocked apollo client
import {apolloClient} from '../../../config/apollo';

const mockLocalDatabaseService = LocalDatabaseService as jest.Mocked<typeof LocalDatabaseService>;
const mockApolloClient = apolloClient as jest.Mocked<typeof apolloClient>;

describe('customersSlice', () => {
  // Use fake timers for better control over async operations
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Mock data with proper types
  const mockCustomer: ZellerCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager',
  };

  const mockCustomer2: ZellerCustomer = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Admin',
  };

  const mockCustomerInput: ZellerCustomerInput = {
    name: 'New Customer',
    email: 'new@example.com',
    role: 'Manager',
  };

  const initialState = {
    customers: [],
    filteredCustomers: [],
    loading: false,
    error: null,
    searchQuery: '',
    selectedFilter: 'ALL' as UserRole,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress all console output in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Ensure all async operations are mocked and resolve immediately
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clear any pending timers
    jest.clearAllTimers();
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  // Clean up after all tests
  afterAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const result = customersReducer(undefined, {} as AnyAction);
      expect(result).toEqual(initialState);
    });
  });

  describe('regular reducers', () => {
    describe('setSearchQuery', () => {
      it('should set search query and apply filters', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };

        const result = customersReducer(stateWithCustomers, setSearchQuery('John'));
        
        expect(result.searchQuery).toBe('John');
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0]).toEqual(mockCustomer);
      });

      it('should handle empty search query', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer],
          searchQuery: 'John',
        };

        const result = customersReducer(stateWithCustomers, setSearchQuery(''));
        
        expect(result.searchQuery).toBe('');
        expect(result.filteredCustomers).toHaveLength(2);
      });

      it('should filter by name case-insensitively', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };

        const result = customersReducer(stateWithCustomers, setSearchQuery('JOHN'));
        
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0].name).toBe('John Doe');
      });

      it('should filter by role case-insensitively', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };

        const result = customersReducer(stateWithCustomers, setSearchQuery('admin'));
        
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0].role).toBe('Admin');
      });
    });

    describe('setSelectedFilter', () => {
      it('should set selected filter and apply filters', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };

        const result = customersReducer(stateWithCustomers, setSelectedFilter('Manager'));
        
        expect(result.selectedFilter).toBe('Manager');
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0]).toEqual(mockCustomer);
      });

      it('should show all customers when filter is ALL', () => {
        const stateWithCustomers = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer],
          selectedFilter: 'Manager' as UserRole,
        };

        const result = customersReducer(stateWithCustomers, setSelectedFilter('ALL'));
        
        expect(result.selectedFilter).toBe('ALL');
        expect(result.filteredCustomers).toHaveLength(2);
      });

      it('should filter case-insensitively', () => {
        const customerWithLowerCase: ZellerCustomer = {
          ...mockCustomer,
          role: 'manager' as any, // Type assertion for test
        };
        const stateWithCustomers = {
          ...initialState,
          customers: [customerWithLowerCase, mockCustomer2],
          filteredCustomers: [customerWithLowerCase, mockCustomer2],
        };

        const result = customersReducer(stateWithCustomers, setSelectedFilter('Manager'));
        
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0]).toEqual(customerWithLowerCase);
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        const stateWithError = {
          ...initialState,
          error: 'Some error message',
        };

        const result = customersReducer(stateWithError, clearError());
        
        expect(result.error).toBeNull();
      });
    });

    describe('combined filters', () => {
      it('should apply both search and role filters', () => {
        const managerJohn: ZellerCustomer = { ...mockCustomer, name: 'John Manager', role: 'Manager' };
        const adminJohn: ZellerCustomer = { ...mockCustomer2, name: 'John Admin', role: 'Admin' };
        const managerJane: ZellerCustomer = { id: '3', name: 'Jane Manager', email: 'jane@test.com', role: 'Manager' };
        
        const stateWithCustomers = {
          ...initialState,
          customers: [managerJohn, adminJohn, managerJane],
          filteredCustomers: [managerJohn, adminJohn, managerJane],
          selectedFilter: 'Manager' as UserRole,
        };

        const result = customersReducer(stateWithCustomers, setSearchQuery('John'));
        
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0]).toEqual(managerJohn);
      });
    });
  });

  describe('async thunks', () => {
    describe('loadCustomersFromLocal', () => {
      it('should create fulfilled action when loading succeeds', async () => {
        const customers = [mockCustomer, mockCustomer2];
        mockLocalDatabaseService.getCustomers.mockResolvedValue(customers);

        const action = loadCustomersFromLocal();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/loadFromLocal/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/loadFromLocal/fulfilled',
            payload: customers 
          })
        );
      });

      it('should create rejected action when loading fails', async () => {
        const errorMessage = 'Database error';
        mockLocalDatabaseService.getCustomers.mockRejectedValue(new Error(errorMessage));

        const action = loadCustomersFromLocal();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/loadFromLocal/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/loadFromLocal/rejected',
            payload: 'Failed to load customers from local database' 
          })
        );
      });
    });

    describe('syncCustomersFromAPI', () => {
      const createMockApolloResponse = (items: ZellerCustomer[]) => ({
        data: {
          listZellerCustomers: {
            items,
          },
        },
        loading: false,
        networkStatus: 7, // NetworkStatus.ready
      });

      it('should create fulfilled action when API sync succeeds', async () => {
        const customers = [mockCustomer, mockCustomer2];
        const mockResponse = createMockApolloResponse(customers);

        mockApolloClient.query.mockResolvedValue(mockResponse);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/syncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/fulfilled',
            payload: customers 
          })
        );
        expect(mockLocalDatabaseService.saveCustomers).toHaveBeenCalledWith(customers);
      });

      it('should create rejected action when API sync fails', async () => {
        mockApolloClient.query.mockRejectedValue(new Error('API error'));

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/syncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/rejected',
            payload: 'Failed to sync customers. Please try again.' 
          })
        );
      });

      it('should handle network error specifically', async () => {
        const networkError = { 
          networkError: { message: 'Network request failed' },
          message: 'Network request failed'
        };
        mockApolloClient.query.mockRejectedValue(networkError);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/rejected',
            payload: 'No internet connection. Please check your network and try again.' 
          })
        );
      });

      it('should handle timeout error specifically', async () => {
        const timeoutError = new Error('timeout error occurred');
        mockApolloClient.query.mockRejectedValue(timeoutError);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/rejected',
            payload: 'Network timeout. Please check your connection and try again.' 
          })
        );
      });

      it('should handle fetch error specifically', async () => {
        const fetchError = new Error('fetch error occurred');
        mockApolloClient.query.mockRejectedValue(fetchError);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/rejected',
            payload: 'Connection failed. Please check your internet connection.' 
          })
        );
      });

      it('should handle ApolloError specifically', async () => {
        const apolloError = { 
          name: 'ApolloError',
          message: 'Apollo GraphQL error'
        };
        mockApolloClient.query.mockRejectedValue(apolloError);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/rejected',
            payload: 'Network error occurred. Please check your internet connection.' 
          })
        );
      });

      it('should handle empty API response', async () => {
        const mockResponse = createMockApolloResponse([]);

        mockApolloClient.query.mockResolvedValue(mockResponse);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/fulfilled',
            payload: [] 
          })
        );
      });

      it('should handle null API response', async () => {
        const mockResponse = {
          data: {
            listZellerCustomers: {
              items: null,
            },
          },
          loading: false,
          networkStatus: 7, // NetworkStatus.ready
        };

        mockApolloClient.query.mockResolvedValue(mockResponse);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = syncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/syncFromAPI/fulfilled',
            payload: [] 
          })
        );
      });
    });

    describe('backgroundSyncCustomersFromAPI', () => {
      const createMockApolloResponse = (items: ZellerCustomer[]) => ({
        data: {
          listZellerCustomers: {
            items,
          },
        },
        loading: false,
        networkStatus: 7, // NetworkStatus.ready
      });

      it('should create fulfilled action when background sync succeeds', async () => {
        const customers = [mockCustomer, mockCustomer2];
        const mockResponse = createMockApolloResponse(customers);

        mockApolloClient.query.mockResolvedValue(mockResponse);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/backgroundSyncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: customers 
          })
        );
      });

      it('should create fulfilled action with empty array when background sync fails', async () => {
        mockApolloClient.query.mockRejectedValue(new Error('Network error'));

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/backgroundSyncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
      });

      it('should handle network error specifically in background sync', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const networkError = { 
          networkError: { message: 'Network request failed' },
          message: 'Network request failed'
        };
        mockApolloClient.query.mockRejectedValue(networkError);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
        expect(consoleSpy).toHaveBeenCalledWith('Background sync skipped - no internet connection');
        
        consoleSpy.mockRestore();
      });

      it('should handle timeout error specifically in background sync', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const timeoutError = new Error('timeout occurred');
        mockApolloClient.query.mockRejectedValue(timeoutError);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
        expect(consoleSpy).toHaveBeenCalledWith('Background sync skipped - no internet connection');
        
        consoleSpy.mockRestore();
      });

      it('should handle fetch error specifically in background sync', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const fetchError = new Error('fetch failed');
        mockApolloClient.query.mockRejectedValue(fetchError);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
        expect(consoleSpy).toHaveBeenCalledWith('Background sync skipped - no internet connection');
        
        consoleSpy.mockRestore();
      });

      it('should handle ApolloError specifically in background sync', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const apolloError = { 
          name: 'ApolloError',
          message: 'Apollo GraphQL error'
        };
        mockApolloClient.query.mockRejectedValue(apolloError);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
        expect(consoleSpy).toHaveBeenCalledWith('Background sync skipped - no internet connection');
        
        consoleSpy.mockRestore();
      });

      it('should handle non-network errors in background sync', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const nonNetworkError = new Error('Some other error');
        mockApolloClient.query.mockRejectedValue(nonNetworkError);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] 
          })
        );
        expect(consoleSpy).toHaveBeenCalledWith('Background sync failed (non-network error):', nonNetworkError);
        
        consoleSpy.mockRestore();
      });

      it('should handle API response with undefined items correctly', async () => {
        // Test for line 73: covering the case where response.data?.listZellerCustomers?.items is undefined
        const mockResponseWithUndefinedItems = {
          data: {
            listZellerCustomers: {
              items: undefined // This triggers the || [] fallback on line 73
            },
          },
          loading: false,
          networkStatus: 7,
        };

        mockApolloClient.query.mockResolvedValue(mockResponseWithUndefinedItems);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/backgroundSyncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] // Should return empty array due to || [] fallback
          })
        );
      });

      it('should handle API response with null items correctly', async () => {
        // Another test case for line 73: covering when items is null
        const mockResponseWithNullItems = {
          data: {
            listZellerCustomers: {
              items: null // This also triggers the || [] fallback on line 73
            },
          },
          loading: false,
          networkStatus: 7,
        };

        mockApolloClient.query.mockResolvedValue(mockResponseWithNullItems);
        mockLocalDatabaseService.saveCustomers.mockResolvedValue(undefined);

        const action = backgroundSyncCustomersFromAPI();
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/backgroundSyncFromAPI/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/backgroundSyncFromAPI/fulfilled',
            payload: [] // Should return empty array due to || [] fallback
          })
        );
      });
    });

    describe('addCustomer', () => {
      it('should create fulfilled action when customer addition succeeds', async () => {
        const newCustomer = { ...mockCustomer, id: 'new-id' };
        mockLocalDatabaseService.addCustomer.mockResolvedValue(newCustomer);

        const action = addCustomer(mockCustomerInput);
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/add/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/add/fulfilled',
            payload: newCustomer 
          })
        );
      });

      it('should create rejected action when customer addition fails', async () => {
        mockLocalDatabaseService.addCustomer.mockRejectedValue(new Error('Add failed'));

        const action = addCustomer(mockCustomerInput);
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/add/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/add/rejected',
            payload: 'Failed to add customer' 
          })
        );
      });
    });

    describe('updateCustomer', () => {
      it('should create fulfilled action when customer update succeeds', async () => {
        const updatedCustomer = { ...mockCustomer, name: 'Updated Name' };
        const updates = { name: 'Updated Name' };
        mockLocalDatabaseService.updateCustomer.mockResolvedValue(updatedCustomer);

        const action = updateCustomer({ id: '1', updates });
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/update/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/update/fulfilled',
            payload: updatedCustomer 
          })
        );
        expect(mockLocalDatabaseService.updateCustomer).toHaveBeenCalledWith('1', updates);
      });

      it('should create rejected action when customer update fails', async () => {
        const updates = { name: 'Updated Name' };
        mockLocalDatabaseService.updateCustomer.mockRejectedValue(new Error('Update failed'));

        const action = updateCustomer({ id: '1', updates });
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/update/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/update/rejected',
            payload: 'Failed to update customer' 
          })
        );
      });
    });

    describe('deleteCustomer', () => {
      it('should create fulfilled action when customer deletion succeeds', async () => {
        mockLocalDatabaseService.deleteCustomer.mockResolvedValue(undefined);

        const action = deleteCustomer('1');
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/delete/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/delete/fulfilled',
            payload: '1' 
          })
        );
        expect(mockLocalDatabaseService.deleteCustomer).toHaveBeenCalledWith('1');
      });

      it('should create rejected action when customer deletion fails', async () => {
        mockLocalDatabaseService.deleteCustomer.mockRejectedValue(new Error('Delete failed'));

        const action = deleteCustomer('1');
        const dispatch = jest.fn();
        const getState = jest.fn();

        await action(dispatch, getState, undefined);

        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'customers/delete/pending' })
        );
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ 
            type: 'customers/delete/rejected',
            payload: 'Failed to delete customer' 
          })
        );
      });
    });
  });

  describe('extraReducers', () => {
    describe('loadCustomersFromLocal', () => {
      it('should handle pending state', () => {
        const action = { type: loadCustomersFromLocal.pending.type };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const customers = [mockCustomer, mockCustomer2];
        const action = { 
          type: loadCustomersFromLocal.fulfilled.type, 
          payload: customers 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers).toEqual(customers);
        expect(result.filteredCustomers).toEqual(customers);
      });

      it('should handle rejected state', () => {
        const action = { 
          type: loadCustomersFromLocal.rejected.type, 
          payload: 'Error message' 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Error message');
      });
    });

    describe('syncCustomersFromAPI', () => {
      it('should handle pending state', () => {
        const action = { type: syncCustomersFromAPI.pending.type };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const customers = [mockCustomer, mockCustomer2];
        const action = { 
          type: syncCustomersFromAPI.fulfilled.type, 
          payload: customers 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers).toEqual(customers);
        expect(result.filteredCustomers).toEqual(customers);
      });

      it('should handle rejected state', () => {
        const action = { 
          type: syncCustomersFromAPI.rejected.type, 
          payload: 'API Error' 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.error).toBe('API Error');
      });
    });

    describe('addCustomer', () => {
      it('should handle pending state', () => {
        const action = { type: addCustomer.pending.type };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const existingState = {
          ...initialState,
          customers: [mockCustomer],
          filteredCustomers: [mockCustomer],
        };
        const action = { 
          type: addCustomer.fulfilled.type, 
          payload: mockCustomer2 
        };
        const result = customersReducer(existingState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers).toHaveLength(2);
        expect(result.customers).toContain(mockCustomer2);
        expect(result.filteredCustomers).toHaveLength(2);
      });

      it('should handle rejected state', () => {
        const action = { 
          type: addCustomer.rejected.type, 
          payload: 'Add failed' 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Add failed');
      });
    });

    describe('updateCustomer', () => {
      it('should handle pending state', () => {
        const action = { type: updateCustomer.pending.type };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const existingState = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };
        const updatedCustomer = { ...mockCustomer, name: 'Updated Name' };
        const action = { 
          type: updateCustomer.fulfilled.type, 
          payload: updatedCustomer 
        };
        const result = customersReducer(existingState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers[0]).toEqual(updatedCustomer);
        expect(result.filteredCustomers[0]).toEqual(updatedCustomer);
      });

      it('should handle fulfilled state when customer not found', () => {
        const existingState = {
          ...initialState,
          customers: [mockCustomer2],
          filteredCustomers: [mockCustomer2],
        };
        const updatedCustomer = { ...mockCustomer, name: 'Updated Name' };
        const action = { 
          type: updateCustomer.fulfilled.type, 
          payload: updatedCustomer 
        };
        const result = customersReducer(existingState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers).toEqual([mockCustomer2]); // No change
      });

      it('should handle rejected state', () => {
        const action = { 
          type: updateCustomer.rejected.type, 
          payload: 'Update failed' 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Update failed');
      });
    });

    describe('deleteCustomer', () => {
      it('should handle pending state', () => {
        const action = { type: deleteCustomer.pending.type };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const existingState = {
          ...initialState,
          customers: [mockCustomer, mockCustomer2],
          filteredCustomers: [mockCustomer, mockCustomer2],
        };
        const action = { 
          type: deleteCustomer.fulfilled.type, 
          payload: '1' 
        };
        const result = customersReducer(existingState, action);
        
        expect(result.loading).toBe(false);
        expect(result.customers).toHaveLength(1);
        expect(result.customers[0]).toEqual(mockCustomer2);
        expect(result.filteredCustomers).toHaveLength(1);
        expect(result.filteredCustomers[0]).toEqual(mockCustomer2);
      });

      it('should handle rejected state', () => {
        const action = { 
          type: deleteCustomer.rejected.type, 
          payload: 'Delete failed' 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.loading).toBe(false);
        expect(result.error).toBe('Delete failed');
      });
    });

    describe('backgroundSyncCustomersFromAPI', () => {
      it('should handle fulfilled state with customers', () => {
        const customers = [mockCustomer, mockCustomer2];
        const action = { 
          type: backgroundSyncCustomersFromAPI.fulfilled.type, 
          payload: customers 
        };
        const result = customersReducer(initialState, action);
        
        expect(result.customers).toEqual(customers);
        expect(result.filteredCustomers).toEqual(customers);
        // Should not affect loading or error state
        expect(result.loading).toBe(false);
        expect(result.error).toBeNull();
      });

      it('should handle fulfilled state with empty customers', () => {
        const existingState = {
          ...initialState,
          customers: [mockCustomer],
          filteredCustomers: [mockCustomer],
        };
        const action = { 
          type: backgroundSyncCustomersFromAPI.fulfilled.type, 
          payload: [] 
        };
        const result = customersReducer(existingState, action);
        
        // Should not update when payload is empty
        expect(result.customers).toEqual([mockCustomer]);
        expect(result.filteredCustomers).toEqual([mockCustomer]);
      });

      it('should not have pending or rejected handlers', () => {
        // Background sync should not affect UI state for pending/rejected
        const pendingAction = { type: backgroundSyncCustomersFromAPI.pending.type };
        const rejectedAction = { type: backgroundSyncCustomersFromAPI.rejected.type };
        
        const pendingResult = customersReducer(initialState, pendingAction);
        const rejectedResult = customersReducer(initialState, rejectedAction);
        
        expect(pendingResult).toEqual(initialState);
        expect(rejectedResult).toEqual(initialState);
      });
    });
  });

  describe('filter integration', () => {
    it('should apply filters after loading customers', () => {
      const customers = [mockCustomer, mockCustomer2];
      const stateWithFilter = {
        ...initialState,
        selectedFilter: 'Manager' as UserRole,
      };
      
      const action = { 
        type: loadCustomersFromLocal.fulfilled.type, 
        payload: customers 
      };
      const result = customersReducer(stateWithFilter, action);
      
      expect(result.customers).toEqual(customers);
      expect(result.filteredCustomers).toHaveLength(1);
      expect(result.filteredCustomers[0]).toEqual(mockCustomer);
    });

    it('should apply filters after adding customer', () => {
      const existingState = {
        ...initialState,
        customers: [mockCustomer2],
        filteredCustomers: [mockCustomer2],
        selectedFilter: 'Manager' as UserRole,
      };
      
      const action = { 
        type: addCustomer.fulfilled.type, 
        payload: mockCustomer 
      };
      const result = customersReducer(existingState, action);
      
      expect(result.customers).toHaveLength(2);
      expect(result.filteredCustomers).toHaveLength(1);
      expect(result.filteredCustomers[0]).toEqual(mockCustomer);
    });
  });
});
