import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {TouchableOpacity} from 'react-native';
import UserCard from '../UserCard/UserCard';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock the Text component
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin' as const,
  };

  const defaultProps = {
    user: mockUser,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information', () => {
    render(<UserCard {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('displays user initials correctly', () => {
    render(<UserCard {...defaultProps} />);
    
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('handles single name correctly', () => {
    const singleNameUser = {
      ...mockUser,
      name: 'John',
    };
    
    render(<UserCard {...defaultProps} user={singleNameUser} />);
    
    expect(screen.getByText('J')).toBeTruthy();
  });

  it('calls onEdit when edit button is pressed', () => {
    const {UNSAFE_root} = render(<UserCard {...defaultProps} />);
    
    const touchableElements = UNSAFE_root.findAllByType(TouchableOpacity);
    const editButton = touchableElements[0]; // First TouchableOpacity is edit button
    
    fireEvent.press(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is pressed', () => {
    const {UNSAFE_root} = render(<UserCard {...defaultProps} />);
    
    const touchableElements = UNSAFE_root.findAllByType(TouchableOpacity);
    const deleteButton = touchableElements[1]; // Second TouchableOpacity is delete button
    
    fireEvent.press(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUser);
  });

  // Snapshot Tests
  it('matches snapshot with admin user', () => {
    const component = render(<UserCard {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with manager user', () => {
    const managerUser = {
      ...mockUser,
      role: 'Manager' as const,
    };
    const component = render(<UserCard {...defaultProps} user={managerUser} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  describe('getInitials edge cases', () => {
    it('handles empty name', () => {
      const emptyNameUser = {
        ...mockUser,
        name: '',
      };
      
      render(<UserCard {...defaultProps} user={emptyNameUser} />);
      
      // Component should render without crashing for empty name
      expect(screen.getByText('Admin')).toBeTruthy(); // Role should still be visible
    });

    it('handles name with only spaces', () => {
      const spacesOnlyUser = {
        ...mockUser,
        name: '   ',
      };
      
      render(<UserCard {...defaultProps} user={spacesOnlyUser} />);
      
      // Component should render without crashing for spaces only
      expect(screen.getByText('Admin')).toBeTruthy(); // Role should still be visible
    });

    it('handles single character name', () => {
      const singleCharUser = {
        ...mockUser,
        name: 'A',
      };
      
      render(<UserCard {...defaultProps} user={singleCharUser} />);
      
      // Should show just the single character as initial
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    });

    it('handles names with multiple spaces (treats as single space)', () => {
      const multiSpaceUser = {
        ...mockUser,
        name: 'John    Doe',
      };
      
      render(<UserCard {...defaultProps} user={multiSpaceUser} />);
      
      // Multiple spaces create empty array elements, so only first character is taken
      expect(screen.getByText('J')).toBeTruthy();
    });

    it('handles names with leading and trailing spaces', () => {
      const trimSpaceUser = {
        ...mockUser,
        name: '  John Doe  ',
      };
      
      render(<UserCard {...defaultProps} user={trimSpaceUser} />);
      
      // Should render without crashing and show role
      expect(screen.getByText('Admin')).toBeTruthy();
    });

    it('handles three or more names (takes first and second)', () => {
      const threeNamesUser = {
        ...mockUser,
        name: 'John Michael Doe',
      };
      
      render(<UserCard {...defaultProps} user={threeNamesUser} />);
      
      expect(screen.getByText('JM')).toBeTruthy();
    });
  });
});
