import {useMemo} from 'react';
import * as Yup from 'yup';
import {ZellerCustomer, ZellerCustomerInput} from '../../../types/User';

interface UseCustomerFormHookProps {
  customer?: ZellerCustomer;
  onSubmit: (customerData: ZellerCustomerInput) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const useCustomerFormHook = ({
  customer,
  onSubmit,
}: UseCustomerFormHookProps) => {
  // Validation Schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    role: Yup.string()
      .oneOf(['Admin', 'Manager'], 'Please select a valid role')
      .required('Role is required'),
  });

  // Get initial values from customer or set defaults
  const initialValues = useMemo((): FormValues => ({
    firstName: customer?.name ? customer.name.split(' ')[0] || '' : '',
    lastName: customer?.name ? customer.name.split(' ').slice(1).join(' ') || '' : '',
    email: customer?.email || '',
    role: customer?.role || '',
  }), [customer]);

  // Form submission handler
  const handleFormSubmit = (values: FormValues) => {
    const customerData: ZellerCustomerInput = {
      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      email: values.email.trim(),
      role: values.role,
    };
    onSubmit(customerData);
  };

  return {
    validationSchema,
    initialValues,
    handleFormSubmit,
  };
};
