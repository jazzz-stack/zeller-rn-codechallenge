import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import CustomerFilterHeader from '../CustomerFilterHeader/CustomerFilterHeader';
import {UserRole} from '../../../types/User';

// Mock the child components
jest.mock('../../Molecules/index', () => ({
  FilterButtons: ({selectedFilter, onFilterChange, onSearch}: any) => {
    const React = require('react');
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity testID="filter-buttons" onPress={onSearch}>
        <Text>{selectedFilter}</Text>
      </TouchableOpacity>
    );
  },
  SearchBar: ({searchQuery, onClose}: any) => {
    const React = require('react');
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity testID="search-bar" onPress={onClose}>
        <Text>{searchQuery || 'Search'}</Text>
      </TouchableOpacity>
    );
  },
}));

// Mock the hook
jest.mock('../CustomerFilterHeader/useCustomerFilterHeader', () => ({
  useCustomerFilterHeader: jest.fn(() => ({
    filterOpacity: {_value: 1},
    searchOpacity: {_value: 0},
    filterTranslateX: {_value: 0},
    searchTranslateX: {_value: 100},
    filterScale: {_value: 1},
    searchScale: {_value: 0.8},
  })),
}));

describe('CustomerFilterHeader', () => {
  const defaultProps = {
    isSearching: false,
    searchQuery: '',
    selectedFilter: 'Admin' as UserRole,
    onSearchChange: jest.fn(),
    onSearchToggle: jest.fn(),
    onFilterChange: jest.fn(),
    onSearchOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders FilterButtons when not searching', () => {
    render(<CustomerFilterHeader {...defaultProps} />);
    
    expect(screen.getByTestId('filter-buttons')).toBeTruthy();
    expect(screen.queryByTestId('search-bar')).toBeNull();
  });

  it('renders SearchBar when searching', () => {
    render(<CustomerFilterHeader {...defaultProps} isSearching={true} />);
    
    expect(screen.getByTestId('search-bar')).toBeTruthy();
    expect(screen.queryByTestId('filter-buttons')).toBeNull();
  });

  it('passes correct props to FilterButtons', () => {
    render(
      <CustomerFilterHeader 
        {...defaultProps} 
        selectedFilter={'Manager' as UserRole}
      />
    );
    
    const filterButtons = screen.getByTestId('filter-buttons');
    expect(screen.getByText('Manager')).toBeTruthy();
  });

  it('passes correct props to SearchBar', () => {
    render(
      <CustomerFilterHeader 
        {...defaultProps} 
        isSearching={true}
        searchQuery="test query"
      />
    );
    
    expect(screen.getByText('test query')).toBeTruthy();
  });

  it('calls useCustomerFilterHeader hook with correct params', () => {
    const mockHook = require('../CustomerFilterHeader/useCustomerFilterHeader').useCustomerFilterHeader;
    
    render(<CustomerFilterHeader {...defaultProps} isSearching={true} />);
    
    expect(mockHook).toHaveBeenCalledWith({isSearching: true});
  });

  it('calls onSearchToggle when SearchBar onClose is triggered', () => {
    const onSearchToggleMock = jest.fn();
    
    render(
      <CustomerFilterHeader 
        {...defaultProps} 
        isSearching={true}
        onSearchToggle={onSearchToggleMock}
      />
    );
    
    const searchBar = screen.getByTestId('search-bar');
    fireEvent.press(searchBar);
    
    expect(onSearchToggleMock).toHaveBeenCalledWith(false);
  });

  it('calls onSearch when FilterButtons onSearch is triggered', () => {
    const onSearchOpenMock = jest.fn();
    
    render(
      <CustomerFilterHeader 
        {...defaultProps} 
        onSearchOpen={onSearchOpenMock}
      />
    );
    
    const filterButtons = screen.getByTestId('filter-buttons');
    fireEvent.press(filterButtons);
    
    expect(onSearchOpenMock).toHaveBeenCalled();
  });
});
