import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import EmptyState from '../EmptyState';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock the Atoms components
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
  SyncButton: ({onPress, title = 'Sync', ...props}: any) => {
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} {...props}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
}));

describe('EmptyState', () => {
  it('renders empty state message', () => {
    render(<EmptyState />);

    expect(screen.getByText('No customers found.')).toBeTruthy();
    expect(screen.getByText('Tap the + button to add your first customer')).toBeTruthy();
  });

  it('applies custom text style', () => {
    const customStyle = {color: 'red'};
    render(<EmptyState textStyle={customStyle} />);
    
    expect(screen.getByText('No customers found.')).toBeTruthy();
  });

  it('renders with correct testID', () => {
    render(<EmptyState />);
    
    expect(screen.getByTestId('empty-state')).toBeTruthy();
  });
});
