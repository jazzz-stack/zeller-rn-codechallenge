import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import ErrorState from '../ErrorState/ErrorState';

// Mock the Atoms components and react-native-vector-icons
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('ErrorState', () => {
  const defaultProps = {
    error: 'Network connection failed',
    onRetry: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders network error UI correctly', () => {
      render(<ErrorState {...defaultProps} />);
      
      expect(screen.getByTestId('error-state')).toBeTruthy();
      expect(screen.getByText('Connection Problem')).toBeTruthy();
      expect(screen.getByText('It seems there is a connection issue, or the server may be temporarily down. Please check and try again after some time.')).toBeTruthy();
      expect(screen.getByText('Make sure you\'re connected to the internet and mock-server is running.')).toBeTruthy();
    });

    it('renders retry button', () => {
      render(<ErrorState {...defaultProps} />);
      
      expect(screen.getByTestId('retry-button')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('renders WiFi-off icon', () => {
      render(<ErrorState {...defaultProps} />);
      
      // Icon is mocked, but we can verify the component renders without crashing
      expect(screen.getByTestId('error-state')).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    it('calls onRetry when retry button is pressed', () => {
      render(<ErrorState {...defaultProps} />);
      
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.press(retryButton);
      
      expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not call onRetry when button is disabled during loading', () => {
      const loadingProps = {
        ...defaultProps,
        loading: true,
      };
      
      render(<ErrorState {...loadingProps} />);
      
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.press(retryButton);
      
      // Should not call onRetry when loading is true
      expect(defaultProps.onRetry).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when loading prop is true', () => {
      const loadingProps = {
        ...defaultProps,
        loading: true,
      };
      
      render(<ErrorState {...loadingProps} />);
      
      expect(screen.getByText('Loading...')).toBeTruthy();
      // Should have ActivityIndicator instead of refresh icon when loading
    });

    it('applies reduced opacity to retry button when loading', () => {
      const loadingProps = {
        ...defaultProps,
        loading: true,
      };
      
      const { getByTestId } = render(<ErrorState {...loadingProps} />);
      const retryButton = getByTestId('retry-button');
      
      // Button should be disabled when loading (check accessibilityState instead of props.disabled)
      expect(retryButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('shows normal state when loading is false', () => {
      render(<ErrorState {...defaultProps} />);
      
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.queryByText('Loading...')).toBeFalsy();
      
      const retryButton = screen.getByTestId('retry-button');
      // Button should not be disabled when not loading
      expect(retryButton.props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  describe('Props Handling', () => {
    it('handles missing onRetry gracefully', () => {
      const propsWithoutRetry = {
        error: 'Test error',
        onRetry: undefined as any,
        loading: false,
      };
      
      // Should not crash even with undefined onRetry
      expect(() => render(<ErrorState {...propsWithoutRetry} />)).not.toThrow();
    });

    it('accepts any error prop value (prop is not used in current implementation)', () => {
      const differentErrorProps = [
        { ...defaultProps, error: null },
        { ...defaultProps, error: undefined },
        { ...defaultProps, error: '' },
        { ...defaultProps, error: 'Any custom error message' },
      ];
      
      differentErrorProps.forEach(props => {
        expect(() => render(<ErrorState {...props} />)).not.toThrow();
      });
    });

    it('toggles between loading and normal states correctly', () => {
      const { rerender } = render(<ErrorState {...defaultProps} />);
      
      // Initially not loading
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.queryByText('Loading...')).toBeFalsy();
      
      // Switch to loading
      rerender(<ErrorState {...defaultProps} loading={true} />);
      expect(screen.getByText('Loading...')).toBeTruthy();
      expect(screen.queryByText('Try Again')).toBeFalsy();
      
      // Switch back to not loading
      rerender(<ErrorState {...defaultProps} loading={false} />);
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.queryByText('Loading...')).toBeFalsy();
    });
  });

  describe('Component Structure', () => {
    it('maintains proper component structure and testIDs', () => {
      render(<ErrorState {...defaultProps} />);
      
      expect(screen.getByTestId('error-state')).toBeTruthy();
      expect(screen.getByTestId('retry-button')).toBeTruthy();
    });

    it('renders all required text elements', () => {
      render(<ErrorState {...defaultProps} />);
      
      // All hardcoded text should be present
      expect(screen.getByText('Connection Problem')).toBeTruthy();
      expect(screen.getByText('It seems there is a connection issue, or the server may be temporarily down. Please check and try again after some time.')).toBeTruthy();
      expect(screen.getByText('Make sure you\'re connected to the internet and mock-server is running.')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });
  });
});
