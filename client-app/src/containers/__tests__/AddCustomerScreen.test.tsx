import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddCustomerScreen from '../AddCustomerScreen/AddCustomerScreen';
import { useAppDispatch } from '../../store/hooks';
import { addCustomer } from '../../store/slices/customersSlice';

// Mock dependencies
jest.mock('../../store/hooks', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('../../store/slices/customersSlice', () => ({
  addCustomer: jest.fn(),
}));

jest.mock('../../components/Molecules', () => ({
  CustomerForm: ({ title, submitButtonText, cancelButtonText, onSubmit, onCancel }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'customer-form' },
      React.createElement(Text, { testID: 'form-title' }, title),
      React.createElement(TouchableOpacity, { 
        testID: 'submit-button',
        onPress: () => onSubmit({
          name: 'Test Customer',
          email: 'test@example.com',
          role: 'Admin'
        })
      }, React.createElement(Text, {}, submitButtonText)),
      React.createElement(TouchableOpacity, { 
        testID: 'cancel-button',
        onPress: onCancel
      }, React.createElement(Text, {}, cancelButtonText))
    );
  },
  ConfirmationModal: ({ visible, onConfirm, onCancel }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    if (!visible) return null;
    
    return React.createElement(View, { testID: 'confirmation-modal' },
      React.createElement(TouchableOpacity, { 
        testID: 'modal-confirm-button',
        onPress: onConfirm
      }, React.createElement(Text, {}, 'Confirm')),
      onCancel ? React.createElement(TouchableOpacity, { 
        testID: 'modal-cancel-button',
        onPress: onCancel
      }, React.createElement(Text, {}, 'Cancel')) : null
    );
  },
}));

describe('AddCustomerScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockProps = {
    navigation: mockNavigation as any,
    route: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders AddCustomerScreen with correct props', () => {
    render(<AddCustomerScreen {...mockProps} />);
    
    expect(screen.getByTestId('customer-form')).toBeTruthy();
    expect(screen.getByTestId('form-title')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
    expect(screen.getByTestId('cancel-button')).toBeTruthy();
  });

  it('passes correct props to CustomerForm', () => {
    render(<AddCustomerScreen {...mockProps} />);
    
    expect(screen.getByTestId('form-title')).toBeTruthy(); // title
    expect(screen.getByTestId('submit-button')).toBeTruthy();
    expect(screen.getByTestId('cancel-button')).toBeTruthy();
  });

  it('handles cancel action correctly', () => {
    render(<AddCustomerScreen {...mockProps} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.press(cancelButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('handles successful customer submission', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<AddCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(addCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        role: 'Admin'
      }));
    });

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
    });
  });

  it('handles customer submission failure', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<AddCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(addCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        role: 'Admin'
      }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
    });
  });

  it('navigates back when success modal confirm is pressed', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<AddCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('modal-confirm-button');
    fireEvent.press(confirmButton);

    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('dispatches addCustomer action with correct customer data', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<AddCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockDispatch).toHaveBeenCalledWith(addCustomer({
      name: 'Test Customer',
      email: 'test@example.com',
      role: 'Admin'
    }));
  });

  it('does not navigate back when error modal confirm is pressed', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<AddCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
    });

    const confirmButton = screen.getByTestId('modal-confirm-button');
    fireEvent.press(confirmButton);

    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  // Snapshot Tests
  it('matches snapshot when rendering', () => {
    const component = render(<AddCustomerScreen {...mockProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
