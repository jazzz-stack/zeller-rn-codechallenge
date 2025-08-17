import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {TouchableOpacity, Text} from 'react-native';
import Header from '../Header/Header';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock the Text component
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

// Mock useColorScheme specifically
const mockUseColorScheme = jest.fn();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

describe('Header', () => {
  const defaultProps = {
    title: 'Test Header',
  };

  it('renders with title', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('Test Header')).toBeTruthy();
  });

  it('shows back button by default when onBackPress is provided', () => {
    const onBackPress = jest.fn();
    const {UNSAFE_root} = render(
      <Header {...defaultProps} onBackPress={onBackPress} />
    );
    
    const backButton = UNSAFE_root.findByType(TouchableOpacity);
    expect(backButton).toBeTruthy();
  });

  it('calls onBackPress when back button is pressed', () => {
    const onBackPress = jest.fn();
    const {UNSAFE_root} = render(
      <Header {...defaultProps} onBackPress={onBackPress} />
    );
    
    const backButton = UNSAFE_root.findByType(TouchableOpacity);
    fireEvent.press(backButton);
    
    expect(onBackPress).toHaveBeenCalled();
  });

  it('hides back button when showBackButton is false', () => {
    const onBackPress = jest.fn();
    const {UNSAFE_root} = render(
      <Header 
        {...defaultProps} 
        onBackPress={onBackPress}
        showBackButton={false}
      />
    );
    
    expect(() => UNSAFE_root.findByType(TouchableOpacity)).toThrow();
  });

  it('renders right component when provided', () => {
    const RightComponent = () => <Text>Right</Text>;
    render(
      <Header 
        {...defaultProps} 
        rightComponent={<RightComponent />}
      />
    );
    
    expect(screen.getByText('Right')).toBeTruthy();
  });

  describe('Color scheme handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle light mode styling', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('Test Header')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle dark mode styling', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('Test Header')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle undefined color scheme', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('Test Header')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle null color scheme', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('Test Header')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });
  });
});
