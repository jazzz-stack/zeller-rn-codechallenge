import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useHomeHook } from '../HomeScreen/Home-hook';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ZellerCustomer } from '../../types/User';

// 1. First mock Apollo Client completely before any imports that might use it
jest.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => children,
  ApolloClient: jest.fn(() => ({
    query: jest.fn(),
    mutate: jest.fn(),
  })),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn(() => ({})),
  useQuery: jest.fn(() => ({ 
    data: null, 
    loading: false, 
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => [
    jest.fn(), 
    { loading: false, error: null, data: null }
  ]),
  gql: jest.fn((strings: TemplateStringsArray) => strings.join('')),
}));

// Mock error link
jest.mock('@apollo/client/link/error', () => ({
  onError: jest.fn().mockImplementation(() => ({
    concat: jest.fn().mockImplementation((link) => link),
  })),
}));

// 2. Mock Redux hooks
jest.mock('../../store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// 3. Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// 4. Create mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getState: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  reset: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
} as any;

// Mock customers data
const mockCustomers: ZellerCustomer[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Manager' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin' },
];

describe('useHomeHook', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(undefined),
    });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        customers: {
          filteredCustomers: mockCustomers,
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL',
        }
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    return new Promise(resolve => setTimeout(resolve, 200));
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useHomeHook(mockNavigation)
    );

    expect(result.current.customers).toEqual(mockCustomers);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });


  it('should create sorted customer sections', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    expect(result.current.customerSections).toEqual([
      {title: 'A', data: [mockCustomers[0]]},
      {title: 'B', data: [mockCustomers[1]]},
      {title: 'C', data: [mockCustomers[2]]},
    ]);
  });

  it('should navigate to AddCustomer when handleAddCustomer is called', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    act(() => result.current.handleAddCustomer());
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddCustomer');
  });

  it('should navigate to EditCustomer with customer data', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    act(() => result.current.handleEditCustomer(mockCustomers[0]));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditCustomer', {
      customer: mockCustomers[0],
    });
  });

  it('should show delete confirmation modal', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    act(() => result.current.handleDeleteCustomer(mockCustomers[0]));
    
    expect(result.current.showDeleteModal).toBe(true);
    expect(result.current.customerToDelete).toEqual(mockCustomers[0]);
  });

  it('should handle successful customer deletion', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({unwrap: mockUnwrap});

    const {result} = renderHook(() => useHomeHook(mockNavigation));
    
    act(() => result.current.handleDeleteCustomer(mockCustomers[0]));
    expect(result.current.showDeleteModal).toBe(true);
    
    jest.clearAllMocks();
    
    await act(async () => {
      await result.current.confirmDeleteCustomer();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2); // delete call + loadCustomersFromLocal call
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
  });

  it('should handle failed customer deletion', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Delete failed'));
    mockDispatch.mockReturnValue({unwrap: mockUnwrap});

    const {result} = renderHook(() => useHomeHook(mockNavigation));
    
    act(() => result.current.handleDeleteCustomer(mockCustomers[0]));
    expect(result.current.showDeleteModal).toBe(true);
    
    await act(async () => {
      await result.current.confirmDeleteCustomer();
    });

    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
  });

  it('should handle cancel delete customer', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    
    act(() => result.current.handleDeleteCustomer(mockCustomers[0]));
    expect(result.current.showDeleteModal).toBe(true);
    
    act(() => result.current.cancelDeleteCustomer());
    
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
  });

  it('should handle confirmDeleteCustomer when no customer is selected', async () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    
    expect(result.current.customerToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
    
    await act(async () => {
      await result.current.confirmDeleteCustomer();
    });
    
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle search toggle and clear search query', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => result.current.handleSearchToggle(true));
    expect(result.current.isSearching).toBe(true);

    act(() => result.current.handleSearchToggle(false));
    expect(result.current.isSearching).toBe(false);
  });

  it('should handle pull to refresh', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({unwrap: mockUnwrap});

    const {result} = renderHook(() => useHomeHook(mockNavigation));

    await act(async () => {
      await result.current.handlePullToRefresh();
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(4); 
  });

  it('should handle pull to refresh with local data error', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Local data error'));
    mockDispatch.mockReturnValue({unwrap: mockUnwrap});

    const {result} = renderHook(() => useHomeHook(mockNavigation));

    await act(async () => {
      await result.current.handlePullToRefresh();
    });

    expect(result.current.refreshing).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should handle scroll to hide/show header', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 50},
        },
      });
    });

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 20},
        },
      });
    });
  });

  it('should hide header when scrolling down significantly', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 0},
        },
      });
    });

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 50},
        },
      });
    });

    expect(result.current.isHeaderVisible).toBe(false);
  });

  it('should show header when scrolling up and header is hidden', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 50},
        },
      });
    });

    expect(result.current.isHeaderVisible).toBe(false);

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 30},
        },
      });
    });

    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should handle filter change', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => result.current.handleFilterChange('Admin'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle search change', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => result.current.handleSearchChange('test query'));
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle empty customers list', () => {
    (useAppSelector as jest.Mock).mockImplementation(selector => {
      return selector({
        customers: {
          filteredCustomers: [],
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL',
        },
      });
    });

    const {result} = renderHook(() => useHomeHook(mockNavigation));
    expect(result.current.customerSections).toEqual([]);
  });

  it('should show error state', () => {
    (useAppSelector as jest.Mock).mockImplementation(selector => {
      return selector({
        customers: {
          filteredCustomers: [],
          loading: false,
          error: 'Test error',
          searchQuery: '',
          selectedFilter: 'ALL',
        },
      });
    });

    const {result} = renderHook(() => useHomeHook(mockNavigation));
    expect(result.current.error).toBe('Test error');
  });

  it('should handle search open by resetting filter to ALL', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => result.current.handleSearchOpen());
    expect(result.current.isSearching).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle sync from API', async () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    jest.clearAllMocks();

    await act(async () => {
      await result.current.handleSyncFromAPI();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('should handle refresh', async () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    jest.clearAllMocks();

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2); // loadCustomersFromLocal called twice (once for refresh, once from hook init side effect)
  });

  it('should not trigger scroll animation for small scroll differences', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 5},
        },
      });
    });
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should group customers with same first letter correctly', () => {
    const customersWithSameFirstLetter: ZellerCustomer[] = [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
      { id: '2', name: 'Anna Smith', email: 'anna@example.com', role: 'Manager' },
      { id: '3', name: 'Bob Brown', email: 'bob@example.com', role: 'Admin' },
    ];

    (useAppSelector as jest.Mock).mockImplementation(selector => {
      return selector({
        customers: {
          filteredCustomers: customersWithSameFirstLetter,
          loading: false,
          error: null,
          searchQuery: '',
          selectedFilter: 'ALL',
        },
      });
    });

    const {result} = renderHook(() => useHomeHook(mockNavigation));

    expect(result.current.customerSections).toEqual([
      {title: 'A', data: [customersWithSameFirstLetter[0], customersWithSameFirstLetter[1]]},
      {title: 'B', data: [customersWithSameFirstLetter[2]]},
    ]);
  });

  it('should handle scrolling up when header is hidden', () => {
    const {result} = renderHook(() => useHomeHook(mockNavigation));
    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 50}, 
        },
      });
    });

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 65}, 
        },
      });
    });

    expect(result.current.isHeaderVisible).toBe(false);

    act(() => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: {y: 50}, 
        },
      });
    });

    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should use background sync when local data exists', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockUnwrap = jest.fn().mockResolvedValue(mockCustomers); // Return non-empty array
    mockDispatch.mockReturnValue({unwrap: mockUnwrap});
    jest.clearAllMocks();
    const { result } = renderHook(() => useHomeHook(mockNavigation));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    expect(mockDispatch).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
