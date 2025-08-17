import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {TouchableOpacity} from 'react-native';
import SearchBar from '../SearchBar/SearchBar';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('SearchBar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    onClose: jest.fn(),
    onFocus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search by name or role...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar {...defaultProps} placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('displays search query value', () => {
    render(<SearchBar {...defaultProps} searchQuery="test query" />);
    
    expect(screen.getByDisplayValue('test query')).toBeTruthy();
  });

  it('calls onSearchChange when text input changes', () => {
    render(<SearchBar {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Search by name or role...');
    fireEvent.changeText(textInput, 'new search');
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('new search');
  });

  it('calls onClose when close button is pressed', () => {
    const {UNSAFE_root} = render(<SearchBar {...defaultProps} />);
    
    // Find the TouchableOpacity (close button)
    const closeButton = UNSAFE_root.findByType(TouchableOpacity);
    fireEvent.press(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onFocus with true when text input is focused', () => {
    render(<SearchBar {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Search by name or role...');
    fireEvent(textInput, 'onFocus');
    
    expect(defaultProps.onFocus).toHaveBeenCalledWith(true);
  });

  it('calls onFocus with false when text input is blurred', () => {
    render(<SearchBar {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Search by name or role...');
    fireEvent(textInput, 'onBlur');
    
    expect(defaultProps.onFocus).toHaveBeenCalledWith(false);
  });
});
