import React from 'react';
import {render, screen} from '@testing-library/react-native';
import Text from '../Text';

describe('Text', () => {
  it('renders children text', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders with different variants', () => {
    render(<Text variant="h1">Heading</Text>);
    expect(screen.getByText('Heading')).toBeTruthy();
  });

  it('renders with different colors', () => {
    render(<Text color="danger">Error message</Text>);
    expect(screen.getByText('Error message')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    render(<Text size="large">Large text</Text>);
    expect(screen.getByText('Large text')).toBeTruthy();
  });

  it('renders with different weights', () => {
    render(<Text weight="bold">Bold text</Text>);
    expect(screen.getByText('Bold text')).toBeTruthy();
  });

  it('passes through React Native Text props', () => {
    render(
      <Text numberOfLines={1} testID="text-component">
        Long text that should be truncated
      </Text>
    );
    
    const textElement = screen.getByTestId('text-component');
    expect(textElement.props.numberOfLines).toBe(1);
  });
});
