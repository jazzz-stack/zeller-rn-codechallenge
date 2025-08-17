import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import SyncButton from '../SyncButton';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  
  return ({name, size, color, style, testID}: any) =>
    React.createElement(Text, {
      testID: testID || 'mock-icon',
      style: [style, {fontSize: size, color}],
    }, name);
});

describe('SyncButton', () => {
  const defaultProps = {
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<SyncButton {...defaultProps} />);
      
      expect(screen.getByText('Sync')).toBeTruthy();
      expect(screen.getByText('sync')).toBeTruthy(); // Icon name
    });

    it('renders with custom title', () => {
      render(<SyncButton {...defaultProps} title="Retry" />);
      
      expect(screen.getByText('Retry')).toBeTruthy();
      expect(screen.queryByText('Sync')).toBeNull();
    });

    it('renders loading state correctly', () => {
      render(<SyncButton {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Syncing...')).toBeTruthy();
      expect(screen.getByText('refresh')).toBeTruthy(); // Icon name for loading
    });

    it('renders disabled state correctly', () => {
      render(<SyncButton {...defaultProps} disabled={true} />);
      
      expect(screen.getByText('Sync')).toBeTruthy();
      expect(screen.getByText('sync')).toBeTruthy();
    });

    it('renders with custom icon properties', () => {
      render(<SyncButton {...defaultProps} iconSize={30} iconColor="#FF0000" />);
      
      const icon = screen.getByText('sync');
      expect(icon.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 30,
            color: '#FF0000',
          }),
        ])
      );
    });
  });

  describe('Interaction', () => {
    it('calls onPress when pressed and not disabled', () => {
      render(<SyncButton {...defaultProps} />);
      
      const button = screen.getByText('Sync').parent;
      fireEvent.press(button);
      
      expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      render(<SyncButton {...defaultProps} disabled={true} />);
      
      const button = screen.getByText('Sync').parent;
      fireEvent.press(button);
      
      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      render(<SyncButton {...defaultProps} isLoading={true} />);
      
      const button = screen.getByText('Syncing...').parent;
      fireEvent.press(button);
      
      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });

    it('passes through additional TouchableOpacity props', () => {
      const testID = 'custom-sync-button';
      render(<SyncButton {...defaultProps} testID={testID} />);
      
      expect(screen.getByTestId(testID)).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('applies custom container style', () => {
      const customStyle = {backgroundColor: 'red'};
      const testID = 'sync-button-container';
      render(<SyncButton {...defaultProps} containerStyle={customStyle} testID={testID} />);
      
      const button = screen.getByTestId(testID);
      expect(button.props.style).toEqual(
        expect.objectContaining(customStyle)
      );
    });

    it('applies custom text style', () => {
      const customTextStyle = {fontSize: 20};
      render(<SyncButton {...defaultProps} textStyle={customTextStyle} />);
      
      const text = screen.getByText('Sync');
      const flattenedStyle = JSON.stringify(text.props.style);
      expect(flattenedStyle).toContain(JSON.stringify(customTextStyle));
    });

    it('applies disabled styles when disabled', () => {
      render(<SyncButton {...defaultProps} disabled={true} />);
      
      const icon = screen.getByText('sync');
      expect(icon.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            color: '#999',
          }),
        ])
      );
    });

    it('applies disabled styles when loading', () => {
      render(<SyncButton {...defaultProps} isLoading={true} />);
      
      const icon = screen.getByText('refresh');
      expect(icon.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            color: '#999',
          }),
        ])
      );
    });
  });

  describe('Accessibility', () => {
    it('is accessible by default', () => {
      render(<SyncButton {...defaultProps} />);
      
      const button = screen.getByText('Sync').parent;
      expect(button.props.accessible).not.toBe(false);
    });

    it('passes through accessibility props', () => {
      const accessibilityLabel = 'Sync data button';
      render(<SyncButton {...defaultProps} accessibilityLabel={accessibilityLabel} />);
      
      const button = screen.getByLabelText(accessibilityLabel);
      expect(button).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined title gracefully', () => {
      render(<SyncButton {...defaultProps} title={undefined} />);
      
      expect(screen.getByText('Sync')).toBeTruthy(); // Should use default
    });

    it('handles empty string title', () => {
      render(<SyncButton {...defaultProps} title="" />);
      
      expect(screen.queryByText('Sync')).toBeNull();
      // Should render empty string, but icon should still be there
      expect(screen.getByText('sync')).toBeTruthy();
    });

    it('handles both disabled and loading states', () => {
      render(<SyncButton {...defaultProps} disabled={true} isLoading={true} />);
      
      expect(screen.getByText('Syncing...')).toBeTruthy();
      expect(screen.getByText('refresh')).toBeTruthy();
      
      const button = screen.getByText('Syncing...').parent;
      fireEvent.press(button);
      
      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });

    it('handles zero icon size', () => {
      render(<SyncButton {...defaultProps} iconSize={0} />);
      
      const icon = screen.getByText('sync');
      expect(icon.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 0,
          }),
        ])
      );
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot in default state', () => {
      const component = render(<SyncButton {...defaultProps} />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot in loading state', () => {
      const component = render(<SyncButton {...defaultProps} isLoading={true} />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot in disabled state', () => {
      const component = render(<SyncButton {...defaultProps} disabled={true} />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with custom props', () => {
      const component = render(
        <SyncButton 
          {...defaultProps} 
          title="Custom Title"
          iconSize={40}
          iconColor="#FF5733"
          containerStyle={{backgroundColor: '#000'}}
          textStyle={{color: '#FFF'}}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
});
