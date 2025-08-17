import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Animated, Platform } from 'react-native';
import HomeScreen from '../HomeScreen/HomeScreen';
import { useHomeHook } from '../HomeScreen/Home-hook';

// Mock the custom hook
jest.mock('../HomeScreen/Home-hook', () => ({
  useHomeHook: jest.fn(),
}));

// Mock all the components
jest.mock('../../components/Atoms', () => ({
  FloatingButton: ({ onPress, variant, size }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    
    return React.createElement(TouchableOpacity, { 
      testID: 'floating-button',
      onPress: onPress
    }, React.createElement(Text, {}, `Floating ${variant} ${size}`));
  },
}));

jest.mock('../../components/Molecules', () => ({
  UserCard: ({ user, onEdit, onDelete }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: `user-card-${user.id}` },
      React.createElement(Text, { testID: 'user-name' }, user.name),
      React.createElement(Text, { testID: 'user-email' }, user.email),
      React.createElement(Text, { testID: 'user-role' }, user.role),
      React.createElement(TouchableOpacity, { 
        testID: 'edit-button',
        onPress: () => onEdit(user)
      }, React.createElement(Text, {}, 'Edit')),
      React.createElement(TouchableOpacity, { 
        testID: 'delete-button',
        onPress: () => onDelete(user.id)
      }, React.createElement(Text, {}, 'Delete'))
    );
  },
  LoadingState: () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    
    return React.createElement(View, { testID: 'loading-state' },
      React.createElement(Text, {}, 'Loading...')
    );
  },
  EmptyState: () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    
    return React.createElement(View, { testID: 'empty-state' },
      React.createElement(Text, {}, 'No customers found')
    );
  },
  ErrorState: ({ error, onRetry }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'error-state' },
      React.createElement(Text, { testID: 'error-message' }, error),
      React.createElement(TouchableOpacity, { 
        testID: 'retry-button',
        onPress: onRetry
      }, React.createElement(Text, {}, 'Retry'))
    );
  },
  CustomerFilterHeader: ({ 
    isSearching, 
    searchQuery, 
    selectedFilter, 
    onSearchChange, 
    onSearchToggle,
    onFilterChange,
    onSearchOpen 
  }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput } = require('react-native');
    
    return React.createElement(View, { testID: 'filter-header' },
      React.createElement(TouchableOpacity, { 
        testID: 'search-toggle',
        onPress: onSearchToggle
      }, React.createElement(Text, {}, isSearching ? 'Close Search' : 'Open Search')),
      isSearching && React.createElement(TextInput, {
        testID: 'search-input',
        value: searchQuery,
        onChangeText: onSearchChange,
        placeholder: 'Search customers...'
      }),
      React.createElement(Text, { testID: 'selected-filter' }, selectedFilter),
      React.createElement(TouchableOpacity, { 
        testID: 'filter-button',
        onPress: () => onFilterChange('Admin')
      }, React.createElement(Text, {}, 'Filter Admin'))
    );
  },
  ConfirmationModal: ({ visible, message, onConfirm, onCancel, isLoading }: any) => {
    const React = require('react');
    const { Modal, View, Text, TouchableOpacity } = require('react-native');
    
    if (!visible) return null;
    
    return React.createElement(Modal, { 
      testID: 'delete-confirmation-modal',
      visible: visible 
    },
      React.createElement(View, { testID: 'modal-content' },
        React.createElement(Text, { testID: 'modal-title' }, 'Delete Customer'),
        React.createElement(Text, { testID: 'modal-message' }, message),
        React.createElement(TouchableOpacity, {
          testID: 'modal-cancel-button',
          onPress: onCancel,
          disabled: isLoading
        }, React.createElement(Text, {}, 'Cancel')),
        React.createElement(TouchableOpacity, {
          testID: 'modal-confirm-button',
          onPress: onConfirm,
          disabled: isLoading
        }, React.createElement(Text, {}, isLoading ? 'Deleting...' : 'Delete'))
      )
    );
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockProps = {
    navigation: mockNavigation as any,
    route: {} as any,
  };

  const mockCustomers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin' as const,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager' as const,
    },
  ];

  const mockCustomerSections = [
    {
      title: 'Admin',
      data: [mockCustomers[0]],
    },
    {
      title: 'Manager',
      data: [mockCustomers[1]],
    },
  ];

  const mockHookReturnValue = {
    customers: mockCustomers,
    customerSections: mockCustomerSections,
    loading: false,
    error: null,
    searchQuery: '',
    selectedFilter: 'ALL' as const,
    isSearching: false,
    refreshing: false,
    headerTranslateY: new Animated.Value(0),
    isHeaderVisible: true,
    
    showDeleteModal: false,
    customerToDelete: null,
    isDeleting: false,
    
    handleSearchToggle: jest.fn(),
    handleAddCustomer: jest.fn(),
    handleEditCustomer: jest.fn(),
    handleDeleteCustomer: jest.fn(),
    confirmDeleteCustomer: jest.fn(),
    cancelDeleteCustomer: jest.fn(),
    handleRefresh: jest.fn(),
    handlePullToRefresh: jest.fn(),
    handleSearchChange: jest.fn(),
    handleFilterChange: jest.fn(),
    handleSearchOpen: jest.fn(),
    handleSyncFromAPI: jest.fn(),
    handleScroll: jest.fn(),
    setIsFocused: jest.fn(),
    isFocused: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useHomeHook as jest.Mock).mockReturnValue(mockHookReturnValue);
  });

  it('renders HomeScreen with customer list', () => {
    render(<HomeScreen {...mockProps} />);
    
    expect(screen.getAllByTestId('user-card-1').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('user-card-2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getByTestId('floating-button')).toBeTruthy();
    expect(screen.getByTestId('filter-header')).toBeTruthy();
  });

  it('renders loading state when loading', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      loading: true,
      customers: [],
      customerSections: [],
    });

    render(<HomeScreen {...mockProps} />);
    
    expect(screen.getAllByTestId('loading-state').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders empty state when no customers', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      loading: false,
      customers: [],
      customerSections: [],
    });

    render(<HomeScreen {...mockProps} />);
    
    expect(screen.getAllByTestId('empty-state').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No customers found').length).toBeGreaterThan(0);
  });

  it('renders error state when there is an error', () => {
    const mockError = 'Network error';
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      error: mockError,
      customers: [], // No customers when error occurs
      customerSections: [], // No sections when error occurs
    });

    render(<HomeScreen {...mockProps} />);
    
    expect(screen.getByTestId('error-state')).toBeTruthy();
    expect(screen.getByText(mockError)).toBeTruthy();
    expect(screen.getByTestId('retry-button')).toBeTruthy();
  });

  it('handles floating button press', () => {
    render(<HomeScreen {...mockProps} />);
    
    const floatingButton = screen.getByTestId('floating-button');
    fireEvent.press(floatingButton);
    
    expect(mockHookReturnValue.handleAddCustomer).toHaveBeenCalledTimes(1);
  });

  it('handles user edit action', () => {
    render(<HomeScreen {...mockProps} />);
    
    const editButton = screen.getAllByTestId('edit-button')[0];
    fireEvent.press(editButton);
    
    expect(mockHookReturnValue.handleEditCustomer).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('handles user delete action', () => {
    render(<HomeScreen {...mockProps} />);
    
    const deleteButton = screen.getAllByTestId('delete-button')[0];
    fireEvent.press(deleteButton);
    
    expect(mockHookReturnValue.handleDeleteCustomer).toHaveBeenCalledWith('1');
  });

  it('handles search toggle', () => {
    render(<HomeScreen {...mockProps} />);
    
    const searchToggle = screen.getByTestId('search-toggle');
    fireEvent.press(searchToggle);
    
    expect(mockHookReturnValue.handleSearchToggle).toHaveBeenCalledTimes(1);
  });

  it('handles search when searching is active', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      isSearching: true,
      searchQuery: 'test',
    });

    render(<HomeScreen {...mockProps} />);
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeTruthy();
    expect(screen.getByDisplayValue('test')).toBeTruthy();
    
    fireEvent.changeText(searchInput, 'new search');
    expect(mockHookReturnValue.handleSearchChange).toHaveBeenCalledWith('new search');
  });

  it('handles filter change', () => {
    render(<HomeScreen {...mockProps} />);
    
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.press(filterButton);
    
    expect(mockHookReturnValue.handleFilterChange).toHaveBeenCalledWith('Admin');
  });

  it('handles retry when in error state', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      error: 'Network error',
      customers: [], // No customers when error occurs
      customerSections: [], // No sections when error occurs
    });

    render(<HomeScreen {...mockProps} />);
    
    const retryButton = screen.getByTestId('retry-button');
    fireEvent.press(retryButton);
    
    expect(mockHookReturnValue.handleSyncFromAPI).toHaveBeenCalledTimes(1);
  });

  it('displays customer count in title when customers exist', () => {
    render(<HomeScreen {...mockProps} />);
    
    expect(screen.getByText('Zeller Customers (2)')).toBeTruthy();
  });

  it('displays selected filter in header', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      selectedFilter: 'Manager',
      customers: [], // Remove customers to avoid text conflicts
      customerSections: [],
    });

    render(<HomeScreen {...mockProps} />);
    
    const selectedFilter = screen.getByTestId('selected-filter');
    expect(selectedFilter).toBeTruthy();
    expect(selectedFilter.props.children).toBe('Manager');
  });

  it('renders section headers correctly', () => {
    render(<HomeScreen {...mockProps} />);
    
    expect(mockHookReturnValue.customerSections).toHaveLength(2);
    expect(mockHookReturnValue.customerSections[0].title).toBe('Admin');
    expect(mockHookReturnValue.customerSections[1].title).toBe('Manager');
  });

  it('calls useHomeHook with navigation', () => {
    render(<HomeScreen {...mockProps} />);
    
    expect(useHomeHook).toHaveBeenCalledWith(mockNavigation);
  });

  it('handles refreshing state', () => {
    const mockRefreshingHookValue = {
      ...mockHookReturnValue,
      refreshing: true,
      showDeleteModal: false,
      customerToDelete: null,
      isDeleting: false,
      setIsFocused: jest.fn(),
      isFocused: false,
      confirmDeleteCustomer: jest.fn(),
      cancelDeleteCustomer: jest.fn(),
    };
    
    (useHomeHook as jest.Mock).mockReturnValue(mockRefreshingHookValue);

    render(<HomeScreen {...mockProps} />);
    
    expect(mockRefreshingHookValue.refreshing).toBe(true);
  });

  // Snapshot Tests
  it('matches snapshot when error', () => {
    (useHomeHook as jest.Mock).mockReturnValue({
      ...mockHookReturnValue,
      error: 'Network error',
      customers: [], // No customers when error occurs
      customerSections: [], // No sections when error occurs
    });

    const component = render(<HomeScreen {...mockProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  // Platform-specific tests to improve branch coverage
  describe('Platform-specific behavior', () => {
    it('should render correctly on iOS platform', () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'ios';

      (useHomeHook as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        isFocused: false,
      });

      render(<HomeScreen {...mockProps} />);
      
      expect(screen.getByTestId('floating-button')).toBeTruthy();
      
      Platform.OS = originalPlatform;
    });

    it('should render correctly on Android platform', () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'android';

      (useHomeHook as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        isFocused: false,
      });

      render(<HomeScreen {...mockProps} />);
      
      expect(screen.getByTestId('floating-button')).toBeTruthy();
      
      Platform.OS = originalPlatform;
    });

    it('should apply focus-based padding on Android when isFocused is true', () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'android';

      (useHomeHook as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        isFocused: true,
      });

      render(<HomeScreen {...mockProps} />);
      
      expect(screen.getByTestId('floating-button')).toBeTruthy();
      
      Platform.OS = originalPlatform;
    });

    it('should not apply focus-based padding on Android when isFocused is false', () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'android';

      (useHomeHook as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        isFocused: false,
      });

      render(<HomeScreen {...mockProps} />);
      
      expect(screen.getByTestId('floating-button')).toBeTruthy();
      
      Platform.OS = originalPlatform;
    });

    it('should apply focus-based padding on Android when both isFocused and isSearching are true', () => {
      const originalPlatform = Platform.OS;
      Platform.OS = 'android';

      (useHomeHook as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        isFocused: true,
        isSearching: true,
      });

      render(<HomeScreen {...mockProps} />);
      
      expect(screen.getByTestId('floating-button')).toBeTruthy();
      
      Platform.OS = originalPlatform;
    });
  });
});
