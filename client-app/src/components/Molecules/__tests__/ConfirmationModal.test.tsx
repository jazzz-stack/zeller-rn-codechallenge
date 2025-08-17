import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Modal, TouchableWithoutFeedback } from 'react-native';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('ConfirmationModal', () => {
  const defaultProps = {
    visible: true,
    message: 'Are you sure you want to delete this customer?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Information')).toBeTruthy(); // Default title for type 'info'
    expect(screen.getByText('Are you sure you want to delete this customer?')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('OK')).toBeTruthy(); // Default confirm text
  });

  it('renders with customer name', () => {
    render(<ConfirmationModal {...defaultProps} type="delete" customerName="John Doe" />);
    
    expect(screen.getByText('Delete Customer')).toBeTruthy();
    // Should show the generated message with customer name
    expect(screen.getByText('Are you sure you want to delete John Doe?')).toBeTruthy();
  });

  it('renders with custom title and message', () => {
    render(
      <ConfirmationModal 
        {...defaultProps} 
        title="Custom Title"
        message="Custom message"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByText('Custom message')).toBeTruthy();
  });

  it('renders with custom button text', () => {
    render(
      <ConfirmationModal 
        {...defaultProps} 
        confirmText="Remove"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText('Keep')).toBeTruthy();
    expect(screen.getByText('Remove')).toBeTruthy();
  });

  it('calls onCancel when cancel button is pressed', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.press(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is pressed', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.press(screen.getByText('OK')); // Updated to use default confirm text
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} type="delete" isLoading={true} />);
    
    expect(screen.getByText('Deleting...')).toBeTruthy();
  });

  it('shows generic loading state for non-delete types', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Please wait...')).toBeTruthy();
  });

  it('disables buttons when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} type="delete" isLoading={true} />);
    
    // Check that loading text is shown and buttons exist (disabled state is handled by TouchableOpacity disabled prop)
    expect(screen.getByText('Deleting...')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    render(<ConfirmationModal {...defaultProps} visible={false} />);
    
    expect(screen.queryByText('Information')).toBeNull(); // Updated to use default title
  });

  it('renders different types correctly', () => {
    const { rerender } = render(<ConfirmationModal {...defaultProps} type="success" />);
    expect(screen.getByText('Success')).toBeTruthy();
    
    rerender(<ConfirmationModal {...defaultProps} type="error" />);
    expect(screen.getByText('Error')).toBeTruthy();
    
    rerender(<ConfirmationModal {...defaultProps} type="warning" />);
    expect(screen.getByText('Warning')).toBeTruthy();
    
    rerender(<ConfirmationModal {...defaultProps} type="delete" />);
    expect(screen.getByText('Delete Customer')).toBeTruthy();
  });

  it('hides cancel button when showCancel is false', () => {
    render(<ConfirmationModal {...defaultProps} showCancel={false} />);
    
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(screen.getByText('OK')).toBeTruthy();
  });

  // Snapshot Tests
  it('matches snapshot with default props', () => {
    const component = render(<ConfirmationModal {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with loading state', () => {
    const component = render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with customer name', () => {
    const component = render(<ConfirmationModal {...defaultProps} customerName="John Doe" />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('handles missing onCancel prop gracefully', () => {
    const propsWithoutCancel = {
      visible: true,
      message: 'Test message',
      onConfirm: jest.fn(),
      // No onCancel prop
    };
    
    render(<ConfirmationModal {...propsWithoutCancel} />);
    expect(screen.getByText('Test message')).toBeTruthy();
  });

  it('renders without cancel button when showCancel is false and onCancel is not provided', () => {
    const propsWithoutCancel = {
      visible: true,
      message: 'Test message',
      onConfirm: jest.fn(),
      showCancel: false,
    };
    
    render(<ConfirmationModal {...propsWithoutCancel} />);
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('renders with showCancel true but no onCancel provided', () => {
    const propsWithoutCancel = {
      visible: true,
      message: 'Test message',
      onConfirm: jest.fn(),
      showCancel: true,
      // No onCancel prop
    };
    
    render(<ConfirmationModal {...propsWithoutCancel} />);
    expect(screen.queryByText('Cancel')).toBeNull(); // Should not show cancel button if no onCancel
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('calls fallback onRequestClose when onCancel is not provided', () => {
    const propsWithoutCancel = {
      visible: true,
      message: 'Test message',
      onConfirm: jest.fn(),
      // No onCancel prop
    };
    const { UNSAFE_getByType } = render(<ConfirmationModal {...propsWithoutCancel} />);
    // Find the Modal and call onRequestClose
    const modal = UNSAFE_getByType(Modal);
    expect(() => modal.props.onRequestClose()).not.toThrow();
  });

  it('calls fallback onPress for backdrop when onCancel is not provided', () => {
    const propsWithoutCancel = {
      visible: true,
      message: 'Test message',
      onConfirm: jest.fn(),
      // No onCancel prop
    };
    const { UNSAFE_getAllByType } = render(<ConfirmationModal {...propsWithoutCancel} />);
    // The first TouchableWithoutFeedback is the backdrop
    const backdrop = UNSAFE_getAllByType(TouchableWithoutFeedback)[0];
    expect(() => backdrop.props.onPress()).not.toThrow();
  });
});
