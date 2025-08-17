import {renderHook} from '@testing-library/react-native';
import {useCustomerFormHook} from '../CustomerForm/useCustomerFormHook';
import {ZellerCustomer} from '../../../types/User';

// Mock Yup for validation testing
jest.mock('yup', () => {
  const actualYup = jest.requireActual('yup');
  return {
    ...actualYup,
    object: () => ({
      shape: jest.fn(() => ({
        validate: jest.fn(),
        validateSync: jest.fn(),
        isValid: jest.fn(() => true),
      })),
    }),
    string: () => ({
      min: jest.fn(() => ({
        max: jest.fn(() => ({
          required: jest.fn(() => ({})),
        })),
      })),
      email: jest.fn(() => ({
        required: jest.fn(() => ({})),
      })),
      oneOf: jest.fn(() => ({
        required: jest.fn(() => ({})),
      })),
    }),
  };
});

describe('useCustomerFormHook', () => {
  const mockOnSubmit = jest.fn();

  const mockCustomer: ZellerCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Values', () => {
    it('returns empty initial values when no customer is provided', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
      });
    });

    it('returns initial values from customer when provided', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: mockCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      });
    });

    it('handles customer with single name correctly', () => {
      const singleNameCustomer: ZellerCustomer = {
        id: '2',
        name: 'Madonna',
        email: 'madonna@example.com',
        role: 'Manager',
      };

      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: singleNameCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: 'Madonna',
        lastName: '',
        email: 'madonna@example.com',
        role: 'Manager',
      });
    });

    it('handles customer with multiple last names correctly', () => {
      const multipleNameCustomer: ZellerCustomer = {
        id: '3',
        name: 'Mary Jane Watson Parker',
        email: 'mary.jane@example.com',
        role: 'Admin',
      };

      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: multipleNameCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: 'Mary',
        lastName: 'Jane Watson Parker',
        email: 'mary.jane@example.com',
        role: 'Admin',
      });
    });

    it('handles customer with empty name correctly', () => {
      const emptyNameCustomer: ZellerCustomer = {
        id: '4',
        name: '',
        email: 'test@example.com',
        role: 'Manager',
      };

      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: emptyNameCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: '',
        lastName: '',
        email: 'test@example.com',
        role: 'Manager',
      });
    });

    it('handles customer with whitespace-only name correctly', () => {
      const whitespaceNameCustomer: ZellerCustomer = {
        id: '5',
        name: '   ',
        email: 'whitespace@example.com',
        role: 'Admin',
      };

      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: whitespaceNameCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: '', // This covers the || '' part on line 41
        lastName: '  ',  // split(' ').slice(1).join(' ') on '   ' results in '  '
        email: 'whitespace@example.com',
        role: 'Admin',
      });
    });

    it('handles customer with name starting with spaces correctly', () => {
      const leadingSpaceCustomer: ZellerCustomer = {
        id: '6',
        name: ' John Doe',
        email: 'leadingspace@example.com',
        role: 'Manager',
      };

      const {result} = renderHook(() =>
        useCustomerFormHook({
          customer: leadingSpaceCustomer,
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.initialValues).toEqual({
        firstName: '', // split(' ')[0] returns '' which triggers || ''
        lastName: 'John Doe',
        email: 'leadingspace@example.com',
        role: 'Manager',
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with properly formatted customer data', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      const formValues = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'Manager',
      };

      result.current.handleFormSubmit(formValues);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Manager',
      });
    });

    it('trims whitespace from form values', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      const formValues = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john.doe@example.com  ',
        role: 'Admin',
      };

      result.current.handleFormSubmit(formValues);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      });
    });

    it('handles empty last name correctly', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      const formValues = {
        firstName: 'Madonna',
        lastName: '',
        email: 'madonna@example.com',
        role: 'Admin',
      };

      result.current.handleFormSubmit(formValues);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Madonna',
        email: 'madonna@example.com',
        role: 'Admin',
      });
    });

    it('handles empty first name correctly', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      const formValues = {
        firstName: '',
        lastName: 'Doe',
        email: 'doe@example.com',
        role: 'Manager',
      };

      result.current.handleFormSubmit(formValues);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Doe',
        email: 'doe@example.com',
        role: 'Manager',
      });
    });
  });

  describe('Validation Schema', () => {
    it('returns a validation schema object', () => {
      const {result} = renderHook(() =>
        useCustomerFormHook({
          onSubmit: mockOnSubmit,
        })
      );

      expect(result.current.validationSchema).toBeDefined();
      expect(typeof result.current.validationSchema).toBe('object');
    });
  });

  describe('Hook Dependencies', () => {
    it('updates initial values when customer prop changes', () => {
      const {result, rerender} = renderHook(
        ({customer}) =>
          useCustomerFormHook({
            customer,
            onSubmit: mockOnSubmit,
          }),
        {
          initialProps: {customer: undefined},
        }
      );

      expect(result.current.initialValues).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
      });

      rerender({customer: mockCustomer});

      expect(result.current.initialValues).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'Admin',
      });
    });

    it('creates new function references on re-render (expected behavior)', () => {
      const {result, rerender} = renderHook(
        (props) =>
          useCustomerFormHook({
            customer: props.customer,
            onSubmit: props.onSubmit,
          }),
        {
          initialProps: {
            customer: mockCustomer,
            onSubmit: mockOnSubmit,
          },
        }
      );

      const firstRender = {
        handleFormSubmit: result.current.handleFormSubmit,
        validationSchema: result.current.validationSchema,
      };

      rerender({
        customer: mockCustomer,
        onSubmit: mockOnSubmit,
      });

      expect(result.current.handleFormSubmit).not.toBe(firstRender.handleFormSubmit);
      expect(typeof result.current.handleFormSubmit).toBe('function');
      expect(typeof result.current.validationSchema).toBe('object');
    });
  });
});
