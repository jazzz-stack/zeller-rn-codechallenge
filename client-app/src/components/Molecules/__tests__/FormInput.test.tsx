import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import FormInput from '../FormInput/FormInput';

// Mock the Text component
jest.mock('../../Atoms', () => ({
  Text: ({children, style, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

// Mock useColorScheme specifically
const mockUseColorScheme = jest.fn();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

describe('FormInput', () => {
  const defaultProps = {
    label: 'Test Label',
  };

  it('renders with label', () => {
    render(<FormInput {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeTruthy();
  });

  it('shows required indicator when required', () => {
    render(<FormInput {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('displays error message when touched and has error', () => {
    render(
      <FormInput 
        {...defaultProps} 
        error="This field is required"
        touched={true}
      />
    );
    
    expect(screen.getByText('This field is required')).toBeTruthy();
  });

  it('does not display error when not touched', () => {
    render(
      <FormInput 
        {...defaultProps} 
        error="This field is required"
        touched={false}
      />
    );
    
    expect(screen.queryByText('This field is required')).toBeNull();
  });

  it('passes TextInput props correctly', () => {
    render(
      <FormInput 
        {...defaultProps} 
        placeholder="Enter text"
        value="test value"
        onChangeText={jest.fn()}
      />
    );
    
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
    expect(screen.getByDisplayValue('test value')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    render(
      <FormInput 
        {...defaultProps} 
        onChangeText={onChangeText}
        placeholder="Enter text"
      />
    );
    
    const textInput = screen.getByPlaceholderText('Enter text');
    fireEvent.changeText(textInput, 'new text');
    
    expect(onChangeText).toHaveBeenCalledWith('new text');
  });

  describe('Required field indicator', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does not show required indicator when required is false', () => {
      render(<FormInput {...defaultProps} required={false} />);
      
      expect(screen.queryByText('*')).toBeNull();
    });

    it('does not show required indicator when required is not provided', () => {
      render(<FormInput {...defaultProps} />);
      
      expect(screen.queryByText('*')).toBeNull();
    });
  });

  describe('Error state handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does not display error when touched but no error provided', () => {
      render(
        <FormInput 
          {...defaultProps} 
          touched={true}
        />
      );
      
      // Should not find any error text
      expect(screen.queryByText(/error/i)).toBeNull();
    });

    it('does not display error when error provided but not touched', () => {
      render(
        <FormInput 
          {...defaultProps} 
          error="Some error"
          touched={false}
        />
      );
      
      expect(screen.queryByText('Some error')).toBeNull();
    });

    it('does not display error when both touched and error are undefined', () => {
      render(<FormInput {...defaultProps} />);
      
      // Should not find any error text
      expect(screen.queryByText(/error/i)).toBeNull();
    });
  });

  describe('Color scheme handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle light mode styling', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      render(<FormInput {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle dark mode styling', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      render(<FormInput {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle undefined color scheme', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      render(<FormInput {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });

    it('should handle null color scheme', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      render(<FormInput {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeTruthy();
      expect(mockUseColorScheme).toHaveBeenCalled();
    });
  });
});
