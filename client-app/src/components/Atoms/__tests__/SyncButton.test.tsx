import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import SyncButton from '../SyncButton/SyncButton';

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

  it('renders correctly in different states', () => {
    // Default state
    const {rerender} = render(<SyncButton {...defaultProps} />);
    expect(screen.getByText('Sync')).toBeTruthy();
    expect(screen.getByText('sync')).toBeTruthy();

    // Loading state
    rerender(<SyncButton {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Syncing...')).toBeTruthy();
    expect(screen.getByText('refresh')).toBeTruthy();

    // Custom title
    rerender(<SyncButton {...defaultProps} title="Retry" />);
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('handles user interactions correctly', () => {
    const {rerender} = render(<SyncButton {...defaultProps} />);
    
    // Normal press
    fireEvent.press(screen.getByText('Sync').parent);
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);

    // Disabled state - should not call onPress
    rerender(<SyncButton {...defaultProps} disabled={true} />);
    fireEvent.press(screen.getByText('Sync').parent);
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1); // Still 1, not called again

    // Loading state - should not call onPress
    rerender(<SyncButton {...defaultProps} isLoading={true} />);
    fireEvent.press(screen.getByText('Syncing...').parent);
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('applies custom styles and props correctly', () => {
    const customStyle = {backgroundColor: 'red'};
    const customTextStyle = {fontSize: 20};
    const testID = 'sync-button';
    
    render(
      <SyncButton 
        {...defaultProps} 
        containerStyle={customStyle}
        textStyle={customTextStyle}
        testID={testID}
        iconSize={30}
        iconColor="#FF0000"
      />
    );

    // Check container style
    const button = screen.getByTestId(testID);
    expect(button.props.style).toEqual(expect.objectContaining(customStyle));

    // Check icon props
    const icon = screen.getByText('sync');
    expect(icon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 30,
          color: '#FF0000',
        }),
      ])
    );

    // Check text style
    const text = screen.getByText('Sync');
    const flattenedStyle = JSON.stringify(text.props.style);
    expect(flattenedStyle).toContain(JSON.stringify(customTextStyle));
  });

  it('handles disabled styling correctly', () => {
    const {rerender} = render(<SyncButton {...defaultProps} disabled={true} />);
    
    // Disabled state
    let icon = screen.getByText('sync');
    expect(icon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: '#999'}),
      ])
    );

    // Loading state (also disabled)
    rerender(<SyncButton {...defaultProps} isLoading={true} />);
    icon = screen.getByText('refresh');
    expect(icon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: '#999'}),
      ])
    );
  });

  it('handles accessibility and edge cases', () => {
    const accessibilityLabel = 'Sync data button';
    const {rerender} = render(
      <SyncButton {...defaultProps} accessibilityLabel={accessibilityLabel} />
    );
    
    // Accessibility
    expect(screen.getByLabelText(accessibilityLabel)).toBeTruthy();

    // Empty title
    rerender(<SyncButton {...defaultProps} title="" />);
    expect(screen.queryByText('Sync')).toBeNull();
    expect(screen.getByText('sync')).toBeTruthy(); // Icon still there

    // Zero icon size edge case
    rerender(<SyncButton {...defaultProps} iconSize={0} />);
    const icon = screen.getByText('sync');
    expect(icon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({fontSize: 0}),
      ])
    );
  });

  it('matches snapshot', () => {
    const component = render(<SyncButton {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});