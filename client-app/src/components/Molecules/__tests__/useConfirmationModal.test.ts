import { renderHook } from '@testing-library/react-native';
import { useConfirmationModal } from '../ConfirmationModal/useConfirmationModal';

describe('useConfirmationModal', () => {
  const defaultProps = {
    visible: true,
    title: '',
    message: 'Test message',
    customerName: '',
    confirmText: 'OK',
    type: 'info',
  };

  it('should return correct icon config for success type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'success' })
    );

    expect(result.current.iconConfig).toEqual({
      name: 'check-circle',
      color: '#4CAF50',
    });
  });

  it('should return correct icon config for error type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'error' })
    );

    expect(result.current.iconConfig).toEqual({
      name: 'error',
      color: '#FF3B30',
    });
  });

  it('should return correct icon config for warning type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'warning' })
    );

    expect(result.current.iconConfig).toEqual({
      name: 'warning',
      color: '#f8b50aff',
    });
  });

  it('should return correct icon config for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'delete' })
    );

    expect(result.current.iconConfig).toEqual({
      name: 'warning',
      color: '#f8b50aff',
    });
  });

  it('should return correct icon config for default/info type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'info' })
    );

    expect(result.current.iconConfig).toEqual({
      name: 'info',
      color: '#007AFF',
    });
  });

  it('should return correct button config for success type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'success' })
    );

    expect(result.current.buttonConfig).toEqual({
      backgroundColor: '#4CAF50',
    });
  });

  it('should return correct button config for error type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'error' })
    );

    expect(result.current.buttonConfig).toEqual({
      backgroundColor: '#FF3B30',
    });
  });

  it('should return correct button config for warning type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'warning' })
    );

    expect(result.current.buttonConfig).toEqual({
      backgroundColor: '#f8b50aff',
    });
  });

  it('should return correct button config for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'delete' })
    );

    expect(result.current.buttonConfig).toEqual({
      backgroundColor: '#FF3B30',
    });
  });

  it('should return correct button config for default/info type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'info' })
    );

    expect(result.current.buttonConfig).toEqual({
      backgroundColor: '#007AFF',
    });
  });

  it('should return correct default title for success type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'success', title: '' })
    );

    expect(result.current.displayTitle).toBe('Success');
  });

  it('should return correct default title for error type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'error', title: '' })
    );

    expect(result.current.displayTitle).toBe('Error');
  });

  it('should return correct default title for warning type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'warning', title: '' })
    );

    expect(result.current.displayTitle).toBe('Warning');
  });

  it('should return correct default title for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'delete', title: '' })
    );

    expect(result.current.displayTitle).toBe('Delete Customer');
  });

  it('should return correct default title for info type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'info', title: '' })
    );

    expect(result.current.displayTitle).toBe('Information');
  });

  it('should return custom title when provided', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'success', title: 'Custom Title' })
    );

    expect(result.current.displayTitle).toBe('Custom Title');
  });

  it('should return correct confirm text for delete type with default OK', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'delete', confirmText: 'OK' })
    );

    expect(result.current.displayConfirmText).toBe('Delete');
  });

  it('should return custom confirm text for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'delete', confirmText: 'Remove' })
    );

    expect(result.current.displayConfirmText).toBe('Remove');
  });

  it('should return original confirm text for non-delete types', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ ...defaultProps, type: 'success', confirmText: 'Continue' })
    );

    expect(result.current.displayConfirmText).toBe('Continue');
  });

  it('should generate message with customer name for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ 
        ...defaultProps, 
        type: 'delete', 
        customerName: 'John Doe',
        message: 'Original message'
      })
    );

    expect(result.current.displayMessage).toBe('Are you sure you want to delete John Doe?');
  });

  it('should use original message when no customer name for delete type', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ 
        ...defaultProps, 
        type: 'delete', 
        customerName: '',
        message: 'Delete this item?'
      })
    );

    expect(result.current.displayMessage).toBe('Delete this item?');
  });

  it('should use original message for non-delete types regardless of customer name', () => {
    const { result } = renderHook(() =>
      useConfirmationModal({ 
        ...defaultProps, 
        type: 'success', 
        customerName: 'John Doe',
        message: 'Operation completed successfully'
      })
    );

    expect(result.current.displayMessage).toBe('Operation completed successfully');
  });
});
