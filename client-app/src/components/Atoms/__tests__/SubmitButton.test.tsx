import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import SubmitButton from '../SubmitButton';

// Mock the Text component
jest.mock('../Text', () => {
  const {Text} = require('react-native');
  return Text;
});

describe('SubmitButton', () => {
  it('renders with title', () => {
    render(<SubmitButton title="Submit" />);
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<SubmitButton title="Submit" onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading text when loading', () => {
    render(<SubmitButton title="Submit" isLoading loadingText="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const {getByTestId} = render(
      <SubmitButton title="Submit" disabled onPress={onPress} testID="button" />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const {getByTestId} = render(
      <SubmitButton title="Submit" isLoading onPress={onPress} testID="button" />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
