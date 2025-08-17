import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useUserManagement} from '../useUserManagement';
import {LocalDatabaseService} from '../../services/LocalDatabaseService';
import {ZellerCustomer, ZellerCustomerInput, UserRole} from '../../types/User';

// Mock the LocalDatabaseService
jest.mock('../../services/LocalDatabaseService', () => ({
  LocalDatabaseService: {
    getCustomers: jest.fn(),
    saveCustomers: jest.fn(),
    addCustomer: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn(),
  },
}));

// Mock Apollo Client useQuery hook
const mockRefetch = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('@apollo/client', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  gql: jest.fn().mockImplementation((template: TemplateStringsArray) => template.join('')),
}));

// Mock GraphQL queries
jest.mock('../../graphql/queries', () => ({
  listZellerCustomers: 'mocked-query',
}));

// Mock console.log and console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

// Test data
const mockCustomers: ZellerCustomer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Admin',
  },
];

const mockCustomerInput: ZellerCustomerInput = {
  name: 'New Customer',
  email: 'new@example.com',
  role: 'Manager',
};

describe('useUserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    
    (LocalDatabaseService.getCustomers as jest.Mock).mockResolvedValue(mockCustomers);
    (LocalDatabaseService.saveCustomers as jest.Mock).mockResolvedValue(undefined);
    (LocalDatabaseService.addCustomer as jest.Mock).mockResolvedValue({
      id: '4',
      ...mockCustomerInput,
    });
    (LocalDatabaseService.updateCustomer as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Updated Name',
      email: 'updated@example.com',
      role: 'Admin',
    } as ZellerCustomer);
    (LocalDatabaseService.deleteCustomer as jest.Mock).mockResolvedValue(undefined);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Initial state and loading', () => {
    it('should initialize with correct default values', () => {
      const {result} = renderHook(() => useUserManagement());

      expect(result.current.customers).toEqual([]);
      expect(result.current.loading).toBe(true); // Initially loading from local DB
      expect(result.current.error).toBe(null);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedFilter).toBe('ALL');
    });

    it('should load customers from local database on mount', async () => {
      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(LocalDatabaseService.getCustomers).toHaveBeenCalledTimes(1);
      expect(result.current.customers).toEqual(mockCustomers);
      expect(result.current.error).toBe(null);
    });

    it('should handle error when loading from local database fails', async () => {
      const error = new Error('Database error');
      (LocalDatabaseService.getCustomers as jest.Mock).mockRejectedValue(error);

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load customers from local database');
      expect(result.current.customers).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading local customers:', error);
    });
  });

  describe('API synchronization', () => {
    it('should sync customers from API successfully', async () => {
      const apiCustomers = [
        {id: '5', name: 'API Customer', email: 'api@example.com', role: 'Manager'},
      ];
      
      mockRefetch.mockResolvedValue({
        data: {listZellerCustomers: {items: apiCustomers}},
      });

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromAPI();
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
      expect(LocalDatabaseService.saveCustomers).toHaveBeenCalledWith(apiCustomers);
      expect(result.current.customers).toEqual(apiCustomers);
      expect(result.current.error).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith('API Customers:', apiCustomers);
    });

    it('should handle empty API response', async () => {
      mockRefetch.mockResolvedValue({
        data: {listZellerCustomers: {items: []}},
      });

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromAPI();
      });

      expect(result.current.customers).toEqual([]);
      expect(LocalDatabaseService.saveCustomers).toHaveBeenCalledWith([]);
    });

    it('should handle API sync error', async () => {
      const error = new Error('API error');
      mockRefetch.mockRejectedValue(error);

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromAPI();
      });

      expect(result.current.error).toBe('Failed to sync customers from API');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error syncing from API:', error);
    });

    it('should handle null API response data', async () => {
      mockRefetch.mockResolvedValue({
        data: null,
      });

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromAPI();
      });

      expect(result.current.customers).toEqual([]);
      expect(LocalDatabaseService.saveCustomers).toHaveBeenCalledWith([]);
    });
  });

  describe('Customer management operations', () => {
    describe('addCustomer', () => {
      it('should add a new customer successfully', async () => {
        const newCustomer = {id: '4', ...mockCustomerInput};
        (LocalDatabaseService.addCustomer as jest.Mock).mockResolvedValue(newCustomer);

        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.addCustomer(mockCustomerInput);
        });

        expect(LocalDatabaseService.addCustomer).toHaveBeenCalledWith(mockCustomerInput);
        expect(result.current.customers).toContain(newCustomer);
        expect(result.current.error).toBe(null);
      });

      it('should handle add customer error and rethrow', async () => {
        const error = new Error('Add customer error');
        (LocalDatabaseService.addCustomer as jest.Mock).mockRejectedValue(error);

        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let thrownError: any;
        await act(async () => {
          try {
            await result.current.addCustomer(mockCustomerInput);
          } catch (e) {
            thrownError = e;
          }
        });

        expect(thrownError).toEqual(error);
        expect(result.current.error).toBe('Failed to add customer');
      });
    });

    describe('updateCustomer', () => {
      it('should update an existing customer successfully', async () => {
        const updatedCustomer = {
          id: '1',
          name: 'Updated Name',
          email: 'updated@example.com',
          role: 'Admin',
        } as ZellerCustomer;
        (LocalDatabaseService.updateCustomer as jest.Mock).mockResolvedValue(updatedCustomer);

        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const updates = {name: 'Updated Name', email: 'updated@example.com'};

        await act(async () => {
          await result.current.updateCustomer('1', updates);
        });

        expect(LocalDatabaseService.updateCustomer).toHaveBeenCalledWith('1', updates);
        expect(result.current.customers.find(c => c.id === '1')).toEqual(updatedCustomer);
        expect(result.current.error).toBe(null);
      });

      it('should handle update customer error and rethrow', async () => {
        const error = new Error('Update customer error');
        (LocalDatabaseService.updateCustomer as jest.Mock).mockRejectedValue(error);

        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const updates = {name: 'Updated Name'};

        let thrownError: any;
        await act(async () => {
          try {
            await result.current.updateCustomer('1', updates);
          } catch (e) {
            thrownError = e;
          }
        });

        expect(thrownError).toEqual(error);
        expect(result.current.error).toBe('Failed to update customer');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating customer:', error);
      });
    });

    describe('deleteCustomer', () => {
      it('should delete a customer successfully', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const initialLength = result.current.customers.length;

        await act(async () => {
          await result.current.deleteCustomer('1');
        });

        expect(LocalDatabaseService.deleteCustomer).toHaveBeenCalledWith('1');
        expect(result.current.customers.find(c => c.id === '1')).toBeUndefined();
        expect(result.current.customers.length).toBe(initialLength - 1);
        expect(result.current.error).toBe(null);
      });

      it('should handle delete customer error and rethrow', async () => {
        const error = new Error('Delete customer error');
        (LocalDatabaseService.deleteCustomer as jest.Mock).mockRejectedValue(error);

        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        let thrownError: any;
        await act(async () => {
          try {
            await result.current.deleteCustomer('1');
          } catch (e) {
            thrownError = e;
          }
        });

        expect(thrownError).toEqual(error);
        expect(result.current.error).toBe('Failed to delete customer');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting customer:', error);
      });
    });

    describe('refreshLocalData', () => {
      it('should refresh local data successfully', async () => {
        const newLocalData = [
          {id: '10', name: 'Refreshed Customer', email: 'refresh@example.com', role: 'Admin'},
        ] as ZellerCustomer[];
        
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Update the mock to return new data
        (LocalDatabaseService.getCustomers as jest.Mock).mockResolvedValue(newLocalData);

        await act(async () => {
          await result.current.refreshLocalData();
        });

        expect(LocalDatabaseService.getCustomers).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
        expect(result.current.customers).toEqual(newLocalData);
      });
    });
  });

  describe('Filtering and search functionality', () => {
    describe('Role filtering', () => {
      it('should filter customers by ADMIN role', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSelectedFilter('Admin');
        });

        const adminCustomers = result.current.customers.filter(c => c.role === 'Admin');
        expect(result.current.customers).toEqual(adminCustomers);
        expect(result.current.customers.length).toBe(2); // John Doe and Bob Johnson
      });

      it('should filter customers by MANAGER role', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSelectedFilter('Manager');
        });

        const managerCustomers = result.current.customers.filter(c => c.role === 'Manager');
        expect(result.current.customers).toEqual(managerCustomers);
        expect(result.current.customers.length).toBe(1); // Jane Smith
      });

      it('should show all customers when filter is ALL', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // First set a filter
        act(() => {
          result.current.setSelectedFilter('Admin');
        });

        // Then reset to ALL
        act(() => {
          result.current.setSelectedFilter('ALL');
        });

        expect(result.current.customers).toEqual(mockCustomers);
        expect(result.current.customers.length).toBe(3);
      });
    });

    describe('Search functionality', () => {
      it('should filter customers by name search', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchQuery('john');
        });

        expect(result.current.customers.length).toBe(2); // John Doe and Bob Johnson
        expect(result.current.customers.every(c => c.name.toLowerCase().includes('john'))).toBe(true);
      });

      it('should filter customers by email search', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchQuery('jane@example.com');
        });

        expect(result.current.customers.length).toBe(1);
        expect(result.current.customers[0].email).toBe('jane@example.com');
      });

      it('should handle empty search results', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchQuery('nonexistent');
        });

        expect(result.current.customers.length).toBe(0);
      });

      it('should clear search when query is empty', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // First set a search query
        act(() => {
          result.current.setSearchQuery('john');
        });

        expect(result.current.customers.length).toBe(2);

        // Then clear it
        act(() => {
          result.current.setSearchQuery('');
        });

        expect(result.current.customers.length).toBe(3); // All customers
      });
    });

    describe('Combined filtering', () => {
      it('should apply both role filter and search query', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSelectedFilter('Admin');
          result.current.setSearchQuery('doe');
        });

        // Should find John Doe (Admin) but not Bob Johnson (also Admin but name doesn't contain 'doe')
        expect(result.current.customers.length).toBe(1);
        expect(result.current.customers[0].name).toBe('John Doe');
        expect(result.current.customers[0].role).toBe('Admin');
      });

      it('should handle case-insensitive search', async () => {
        const {result} = renderHook(() => useUserManagement());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchQuery('JOHN');
        });

        expect(result.current.customers.length).toBe(2); // Should still find both Johns
      });
    });
  });

  describe('Loading states', () => {
    it('should combine local loading and API loading states', async () => {
      mockUseQuery.mockReturnValue({
        loading: true,
        error: null,
        refetch: mockRefetch,
      });

      const {result} = renderHook(() => useUserManagement());

      // Should be loading due to both local DB load and API loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(true); // Still loading due to API
      });
    });

    it('should handle API error state', () => {
      const apiError = new Error('API connection failed');
      mockUseQuery.mockReturnValue({
        loading: false,
        error: {message: 'API connection failed'},
        refetch: mockRefetch,
      });

      const {result} = renderHook(() => useUserManagement());

      expect(result.current.error).toBe('API connection failed');
    });

    it('should prioritize local error over API error', async () => {
      const localError = new Error('Local DB error');
      (LocalDatabaseService.getCustomers as jest.Mock).mockRejectedValue(localError);
      
      mockUseQuery.mockReturnValue({
        loading: false,
        error: {message: 'API error'},
        refetch: mockRefetch,
      });

      const {result} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load customers from local database');
    });
  });

  describe('Hook stability and memoization', () => {
    it('should maintain function reference stability', async () => {
      const {result, rerender} = renderHook(() => useUserManagement());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRenderFunctions = {
        addCustomer: result.current.addCustomer,
        updateCustomer: result.current.updateCustomer,
        deleteCustomer: result.current.deleteCustomer,
        syncFromAPI: result.current.syncFromAPI,
        refreshLocalData: result.current.refreshLocalData,
      };

      rerender({});

      // Functions should maintain the same reference
      expect(result.current.addCustomer).toBe(firstRenderFunctions.addCustomer);
      expect(result.current.updateCustomer).toBe(firstRenderFunctions.updateCustomer);
      expect(result.current.deleteCustomer).toBe(firstRenderFunctions.deleteCustomer);
      expect(result.current.syncFromAPI).toBe(firstRenderFunctions.syncFromAPI);
      expect(result.current.refreshLocalData).toBe(firstRenderFunctions.refreshLocalData);
    });
  });
});
