import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import EditCustomerScreen from '../EditCustomerScreen/EditCustomerScreen';
import { useAppDispatch } from '../../store/hooks';
import { updateCustomer } from '../../store/slices/customersSlice';

// Mock dependencies
jest.mock('../../store/hooks', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('../../store/slices/customersSlice', () => ({
  updateCustomer: jest.fn(),
}));

jest.mock('../../components/Molecules', () => ({
  CustomerForm: ({ title, customer, submitButtonText, cancelButtonText, onSubmit, onCancel }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'customer-form' },
      React.createElement(Text, { testID: 'form-title' }, title),
      React.createElement(Text, { testID: 'customer-name' }, customer?.name || ''),
      React.createElement(Text, { testID: 'customer-email' }, customer?.email || ''),
      React.createElement(Text, { testID: 'customer-role' }, customer?.role || ''),
      React.createElement(TouchableOpacity, { 
        testID: 'submit-button',
        onPress: () => onSubmit({
          name: 'Updated Customer',
          email: 'updated@example.com',
          role: 'Manager'
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

describe('EditCustomerScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  };

  const mockCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin' as const,
  };

  const mockProps = {
    navigation: mockNavigation as any,
    route: {
      params: {
        customer: mockCustomer,
      },
    } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders EditCustomerScreen with correct props', () => {
    render(<EditCustomerScreen {...mockProps} />);
    
    expect(screen.getByTestId('customer-form')).toBeTruthy();
    expect(screen.getByTestId('form-title')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
    expect(screen.getByTestId('cancel-button')).toBeTruthy();
  });

  it('passes customer data to CustomerForm', () => {
    render(<EditCustomerScreen {...mockProps} />);
    
    expect(screen.getByTestId('customer-name')).toBeTruthy();
    expect(screen.getByTestId('customer-email')).toBeTruthy();
    expect(screen.getByTestId('customer-role')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('john@example.com')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('passes correct props to CustomerForm', () => {
    render(<EditCustomerScreen {...mockProps} />);
    
    expect(screen.getByText('Edit Customer')).toBeTruthy(); // title
    expect(screen.getByText('Update Customer')).toBeTruthy(); // submit button text
    expect(screen.getByTestId('submit-button')).toBeTruthy();
    expect(screen.getByTestId('cancel-button')).toBeTruthy();
  });

  it('handles cancel action correctly', () => {
    render(<EditCustomerScreen {...mockProps} />);
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.press(cancelButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('handles successful customer update', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<EditCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateCustomer({
        id: '1',
        updates: {
          name: 'Updated Customer',
          email: 'updated@example.com',
          role: 'Manager'
        }
      }));
    });

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeTruthy();
    });
  });

  it('handles customer update failure', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<EditCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateCustomer({
        id: '1',
        updates: {
          name: 'Updated Customer',
          email: 'updated@example.com',
          role: 'Manager'
        }
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

    render(<EditCustomerScreen {...mockProps} />);
    
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

  it('dispatches updateCustomer action with correct customer id and updates', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<EditCustomerScreen {...mockProps} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateCustomer({
      id: '1',
      updates: {
        name: 'Updated Customer',
        email: 'updated@example.com',
        role: 'Manager'
      }
    }));
  });

  it('does not navigate back when error modal confirm is pressed', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Network error'));
    mockDispatch.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<EditCustomerScreen {...mockProps} />);
    
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

  it('renders with different customer data', () => {
    const differentCustomer = {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager' as const,
    };

    const propsWithDifferentCustomer = {
      ...mockProps,
      route: {
        params: {
          customer: differentCustomer,
        },
      } as any,
    };

    render(<EditCustomerScreen {...propsWithDifferentCustomer} />);
    
    expect(screen.getByText('Jane Smith')).toBeTruthy();
    expect(screen.getByText('jane@example.com')).toBeTruthy();
    expect(screen.getByText('Manager')).toBeTruthy();
  });

  // Snapshot Tests
  it('matches snapshot when rendering with customer', () => {
    const component = render(<EditCustomerScreen {...mockProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with different customer data', () => {
    const differentCustomer = {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Manager' as const,
    };

    const propsWithDifferentCustomer = {
      ...mockProps,
      route: {
        params: {
          customer: differentCustomer,
        },
      } as any,
    };

    const component = render(<EditCustomerScreen {...propsWithDifferentCustomer} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
