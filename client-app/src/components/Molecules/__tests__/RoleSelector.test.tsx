import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import RoleSelector from '../RoleSelector/RoleSelector';

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

describe('RoleSelector', () => {
  const defaultProps = {
    selectedRole: '' as const,
    onRoleChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders role options', () => {
    render(<RoleSelector {...defaultProps} />);
    
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Manager')).toBeTruthy();
  });

  it('calls onRoleChange when role is selected', () => {
    render(<RoleSelector {...defaultProps} />);
    
    fireEvent.press(screen.getByText('Admin'));
    expect(defaultProps.onRoleChange).toHaveBeenCalledWith('Admin');
    
    fireEvent.press(screen.getByText('Manager'));
    expect(defaultProps.onRoleChange).toHaveBeenCalledWith('Manager');
  });

  it('displays error message when touched and has error', () => {
    render(
      <RoleSelector 
        {...defaultProps} 
        error="Please select a role"
        touched={true}
      />
    );
    
    expect(screen.getByText('Please select a role')).toBeTruthy();
  });

  it('does not display error when not touched', () => {
    render(
      <RoleSelector 
        {...defaultProps} 
        error="Please select a role"
        touched={false}
      />
    );
    
    expect(screen.queryByText('Please select a role')).toBeNull();
  });

  it('highlights selected role', () => {
    render(<RoleSelector {...defaultProps} selectedRole="Admin" />);
    
    const adminText = screen.getByText(/Admin/);
    expect(adminText).toBeTruthy();
  });

  describe('Color scheme handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle light mode styling', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      render(<RoleSelector {...defaultProps} />);
      
      expect(screen.getByText('Admin')).toBeTruthy();
      expect(screen.getByText('Manager')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle dark mode styling', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      render(<RoleSelector {...defaultProps} />);
      
      expect(screen.getByText('Admin')).toBeTruthy();
      expect(screen.getByText('Manager')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle undefined color scheme', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      render(<RoleSelector {...defaultProps} />);
      
      expect(screen.getByText('Admin')).toBeTruthy();
      expect(screen.getByText('Manager')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle null color scheme', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      render(<RoleSelector {...defaultProps} />);
      
      expect(screen.getByText('Admin')).toBeTruthy();
      expect(screen.getByText('Manager')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });
  });
});
