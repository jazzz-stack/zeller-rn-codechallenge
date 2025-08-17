import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import FloatingButton from '../FloatingButton/FloatingButton';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('FloatingButton', () => {
  it('should render with testID', () => {
    const {getByTestId} = render(<FloatingButton testID="floating-button" />);
    const button = getByTestId('floating-button');

    expect(button).toBeTruthy();
  });

  it('should pass testID prop correctly', () => {
    const {getByTestId} = render(<FloatingButton testID="my-custom-test-id" />);
    const button = getByTestId('my-custom-test-id');

    expect(button).toBeTruthy();
  });

  it('should handle onPress with testID', () => {
    const onPressMock = jest.fn();
    const {getByTestId} = render(
      <FloatingButton testID="floating-button" onPress={onPressMock} />
    );
    const button = getByTestId('floating-button');

    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should render with all custom props', () => {
    const {getByTestId} = render(
      <FloatingButton 
        testID="floating-button"
        variant="danger"
        size="large"
        iconName="add"
        iconSize={30}
        iconColor="#000000"
      />
    );
    const button = getByTestId('floating-button');

    expect(button).toBeTruthy();
  });

  // Snapshot Tests
  it('matches snapshot with default props', () => {
    const component = render(<FloatingButton testID="floating-button" />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with onPress handler', () => {
    const onPressMock = jest.fn();
    const component = render(
      <FloatingButton testID="floating-button" onPress={onPressMock} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
