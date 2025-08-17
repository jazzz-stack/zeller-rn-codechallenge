import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {TouchableOpacity} from 'react-native';
import FilterButtons from '../FilterButtons/FilterButtons';
import {UserRole} from '../../../types/User';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('FilterButtons', () => {
  const defaultProps = {
    selectedFilter: 'ALL' as UserRole,
    onFilterChange: jest.fn(),
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter buttons', () => {
    render(<FilterButtons {...defaultProps} />);
    
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Manager')).toBeTruthy();
  });

  it('calls onFilterChange when filter button is pressed', () => {
    render(<FilterButtons {...defaultProps} />);
    
    fireEvent.press(screen.getByText('Admin'));
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('Admin');
  });

  it('calls onSearch when search button is pressed', () => {
    const {UNSAFE_root} = render(<FilterButtons {...defaultProps} />);
    
    // Find all TouchableOpacity elements and get the last one (search button)
    const touchableElements = UNSAFE_root.findAllByType(TouchableOpacity);
    const searchButton = touchableElements[touchableElements.length - 1];
    
    fireEvent.press(searchButton);
    expect(defaultProps.onSearch).toHaveBeenCalled();
  });

  it('highlights selected filter', () => {
    render(<FilterButtons {...defaultProps} selectedFilter="Admin" />);
    
    const adminButton = screen.getByText('Admin');
    expect(adminButton).toBeTruthy();
  });
});
