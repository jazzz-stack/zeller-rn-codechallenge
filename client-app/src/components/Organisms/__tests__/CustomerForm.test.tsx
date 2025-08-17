import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react-native';
import {Platform} from 'react-native';
import CustomerForm from '../CustomerForm/CustomerForm';
import {ZellerCustomer} from '../../../types/User';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock just the parts we need from react-native
jest.doMock('react-native', () => {
  const React = require('react');

  const View = React.forwardRef((props, ref) =>
    React.createElement('View', {...props, ref}),
  );
  const Text = React.forwardRef((props, ref) =>
    React.createElement('Text', {...props, ref}),
  );
  const TouchableOpacity = React.forwardRef((props, ref) =>
    React.createElement('TouchableOpacity', {...props, ref}),
  );
  const SafeAreaView = React.forwardRef((props, ref) =>
    React.createElement('SafeAreaView', {...props, ref}),
  );
  const ScrollView = React.forwardRef((props, ref) =>
    React.createElement('ScrollView', {...props, ref}),
  );
  const KeyboardAvoidingView = React.forwardRef((props, ref) =>
    React.createElement('KeyboardAvoidingView', {...props, ref}),
  );
  const TextInput = React.forwardRef((props, ref) =>
    React.createElement('TextInput', {...props, ref}),
  );

  return {
    Platform: {OS: 'ios'}, // Default platform
    StyleSheet: {
      create: styles => styles,
    },
    StatusBar: {
      currentHeight: 24,
    },
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
  };
});

// Mock Formik to avoid validation complexities
let mockHandleSubmit = jest.fn();
let mockFormikProps = {
  handleChange: jest.fn((field: string) => (value: string) => {}),
  handleBlur: jest.fn(),
  handleSubmit: mockHandleSubmit,
  setFieldValue: jest.fn(),
  values: {},
  errors: {},
  touched: {},
  isValid: true,
  dirty: true, // Changed to true so submit button isn't disabled
};

jest.mock('formik', () => ({
  Formik: ({children, initialValues}: any) => {
    const props = {
      ...mockFormikProps,
      values: initialValues,
    };
    return children(props);
  },
}));

// Mock Atoms components
jest.mock('../../Atoms', () => ({
  SubmitButton: ({
    title,
    onPress,
    disabled,
    isLoading,
    loadingText,
    ...props
  }: any) => {
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        testID="submit-button"
        {...props}>
        <Text testID="submit-button-text">
          {isLoading ? loadingText : title}
        </Text>
      </TouchableOpacity>
    );
  },
}));

// Mock Molecules components
jest.mock('../../Molecules', () => ({
  RoleSelector: ({
    selectedRole,
    onRoleChange,
    error,
    touched,
    ...props
  }: any) => {
    const {View, Text, TouchableOpacity} = require('react-native');
    return (
      <View testID="role-selector" {...props}>
        <Text>Select Role</Text>
        <TouchableOpacity
          onPress={() => onRoleChange('Admin')}
          testID="admin-option">
          <Text>Admin {selectedRole === 'Admin' && '✓'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRoleChange('Manager')}
          testID="manager-option">
          <Text>Manager {selectedRole === 'Manager' && '✓'}</Text>
        </TouchableOpacity>
        {error && touched && <Text testID="role-error">{error}</Text>}
      </View>
    );
  },
  FormInput: ({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    touched,
    required,
    placeholder,
    ...props
  }: any) => {
    const {View, Text, TextInput} = require('react-native');
    return (
      <View
        testID={`form-input-${label?.toLowerCase().replace(' ', '-')}`}
        {...props}>
        <Text testID={`label-${label?.toLowerCase().replace(' ', '-')}`}>
          {label} {required && '*'}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          testID={`input-${label?.toLowerCase().replace(' ', '-')}`}
        />
        {error && touched && (
          <Text testID={`error-${label?.toLowerCase().replace(' ', '-')}`}>
            {error}
          </Text>
        )}
      </View>
    );
  },
  Header: ({title, onBackPress, showBackButton, ...props}: any) => {
    const {View, Text, TouchableOpacity} = require('react-native');
    return (
      <View testID="header" {...props}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} testID="back-button">
            <Text>Back</Text>
          </TouchableOpacity>
        )}
        <Text testID="header-title">{title}</Text>
      </View>
    );
  },
}));

// Mock the custom hook
jest.mock('../CustomerForm/useCustomerFormHook', () => ({
  useCustomerFormHook: jest.fn(() => ({
    validationSchema: {},
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
    },
    handleFormSubmit: jest.fn(),
  })),
}));

describe('CustomerForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    title: 'Add Customer',
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    submitButtonText: 'Add Customer',
    isLoading: false,
  };

  const mockCustomer: ZellerCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockClear();
  });

  it('renders form with all required elements', () => {
    render(<CustomerForm {...defaultProps} />);

    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('header-title')).toBeTruthy();
    expect(screen.getByTestId('role-selector')).toBeTruthy();
    expect(screen.getByTestId('form-input-first-name')).toBeTruthy();
    expect(screen.getByTestId('form-input-last-name')).toBeTruthy();
    expect(screen.getByTestId('form-input-email')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  it('shows back button and handles back press', () => {
    render(<CustomerForm {...defaultProps} />);

    const backButton = screen.getByTestId('back-button');
    expect(backButton).toBeTruthy();

    fireEvent.press(backButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('renders form inputs with correct labels and placeholders', () => {
    render(<CustomerForm {...defaultProps} />);

    expect(screen.getByTestId('label-first-name')).toBeTruthy();
    expect(screen.getByTestId('label-last-name')).toBeTruthy();
    expect(screen.getByTestId('label-email')).toBeTruthy();

    expect(screen.getByPlaceholderText('Enter first name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter last name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter email address')).toBeTruthy();
  });

  it('handles role selection', () => {
    render(<CustomerForm {...defaultProps} />);

    const adminOption = screen.getByTestId('admin-option');
    const managerOption = screen.getByTestId('manager-option');

    expect(adminOption).toBeTruthy();
    expect(managerOption).toBeTruthy();

    fireEvent.press(adminOption);
    fireEvent.press(managerOption);
  });

  it('shows loading state on submit button', () => {
    render(<CustomerForm {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('submit-button-text')).toBeTruthy();
    expect(screen.getByText('Processing...')).toBeTruthy();
  });

  it('displays correct title for editing customer', () => {
    render(
      <CustomerForm
        {...defaultProps}
        title="Edit Customer"
        customer={mockCustomer}
        submitButtonText="Update Customer"
      />,
    );

    expect(screen.getByText('Edit Customer')).toBeTruthy();
    expect(screen.getByText('Update Customer')).toBeTruthy();
  });

  it('handles form submission', () => {
    render(<CustomerForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls Formik handleSubmit when submit button is pressed with valid form', () => {
    render(<CustomerForm {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');

    mockHandleSubmit.mockClear();

    fireEvent.press(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  describe('Platform-specific behavior', () => {
    it('tests Platform.OS conditional branches for complete coverage', () => {
      const originalOS = Platform.OS;

      try {
        Object.defineProperty(Platform, 'OS', {
          value: 'android',
          configurable: true,
        });

        const {unmount} = render(<CustomerForm {...defaultProps} />);
        expect(screen.getByTestId('submit-button')).toBeTruthy();
        unmount();

        Object.defineProperty(Platform, 'OS', {
          value: 'windows',
          configurable: true,
        });

        render(<CustomerForm {...defaultProps} />);
        expect(screen.getByTestId('submit-button')).toBeTruthy();
      } finally {
        Object.defineProperty(Platform, 'OS', {
          value: originalOS,
          configurable: true,
        });
      }
    });
  });

  describe('Form validation states', () => {
    it('disables submit button when form is invalid', () => {
      const mockFormik = require('formik');
      const originalFormik = mockFormik.Formik;
      mockFormik.Formik = ({children, initialValues}: any) => {
        const mockFormikProps = {
          handleChange: jest.fn((field: string) => (value: string) => {}),
          handleBlur: jest.fn(),
          handleSubmit: mockHandleSubmit,
          setFieldValue: jest.fn(),
          values: initialValues,
          errors: {},
          touched: {},
          isValid: false, // Invalid form
          dirty: true,
        };
        return children(mockFormikProps);
      };

      render(<CustomerForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton.props.disabled).toBe(true);

      mockFormik.Formik = originalFormik;
    });

    it('disables submit button when form is not dirty', () => {
      const mockFormik = require('formik');
      const originalFormik = mockFormik.Formik;
      mockFormik.Formik = ({children, initialValues}: any) => {
        const mockFormikProps = {
          handleChange: jest.fn((field: string) => (value: string) => {}),
          handleBlur: jest.fn(),
          handleSubmit: mockHandleSubmit,
          setFieldValue: jest.fn(),
          values: initialValues,
          errors: {},
          touched: {},
          isValid: true,
          dirty: false, // Not dirty form
        };
        return children(mockFormikProps);
      };

      render(<CustomerForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton.props.disabled).toBe(true);

      mockFormik.Formik = originalFormik;
    });

    it('enables submit button when form is valid and dirty', () => {
      render(<CustomerForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton.props.disabled).toBe(false);
    });

    it('disables submit button when form is both invalid and not dirty', () => {
      const originalIsValid = mockFormikProps.isValid;
      const originalDirty = mockFormikProps.dirty;

      mockFormikProps.isValid = false; // Invalid
      mockFormikProps.dirty = false; // Not dirty

      render(<CustomerForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton.props.disabled).toBe(true);

      mockFormikProps.isValid = originalIsValid;
      mockFormikProps.dirty = originalDirty;
    });

    it('uses default isLoading value when not provided', () => {
      const propsWithoutLoading = {
        title: 'Add Customer',
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        submitButtonText: 'Add Customer',
      };

      render(<CustomerForm {...propsWithoutLoading} />);

      const submitButton = screen.getByTestId('submit-button');
      const submitButtonText = screen.getByTestId('submit-button-text');

      expect(submitButton.props.disabled).toBe(false); // Should not be disabled by loading
      expect(submitButtonText.props.children).toBe('Add Customer'); // Should show normal text, not loading
    });

    it('passes error and touched states to form components', () => {
      const originalErrors = mockFormikProps.errors;
      const originalTouched = mockFormikProps.touched;

      mockFormikProps.errors = {
        role: 'Role is required',
        firstName: 'First name is required',
        lastName: 'Last name is required',
        email: 'Email is required',
      };
      mockFormikProps.touched = {
        role: true,
        firstName: true,
        lastName: true,
        email: true,
      };

      render(<CustomerForm {...defaultProps} />);

      expect(screen.getByTestId('role-error')).toBeTruthy();

      mockFormikProps.errors = originalErrors;
      mockFormikProps.touched = originalTouched;
    });

    it('passes undefined error and touched states', () => {
      const originalErrors = mockFormikProps.errors;
      const originalTouched = mockFormikProps.touched;

      mockFormikProps.errors = {};
      mockFormikProps.touched = {};

      render(<CustomerForm {...defaultProps} />);

      expect(screen.getByTestId('submit-button')).toBeTruthy();

      mockFormikProps.errors = originalErrors;
      mockFormikProps.touched = originalTouched;
    });

    it('handles customer prop for editing existing customer', () => {
      const existingCustomer = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin' as const,
      };

      const editProps = {
        ...defaultProps,
        customer: existingCustomer,
        title: 'Edit Customer',
        submitButtonText: 'Update Customer',
      };

      render(<CustomerForm {...editProps} />);

      expect(screen.getByText('Edit Customer')).toBeTruthy();
      expect(screen.getByTestId('submit-button-text')).toBeTruthy();
    });

    it('handles undefined customer prop for adding new customer', () => {
      const addProps = {
        ...defaultProps,
        customer: undefined,
        title: 'Add Customer',
        submitButtonText: 'Add Customer',
      };

      render(<CustomerForm {...addProps} />);

      expect(screen.getAllByText('Add Customer').length).toBeGreaterThan(0);
      expect(screen.getByTestId('submit-button-text')).toBeTruthy();
    });
  });
});
