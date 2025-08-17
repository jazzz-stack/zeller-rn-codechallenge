import React from 'react';
import {
  View,
  SafeAreaView,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {Formik} from 'formik';
import {styles} from './CustomerFormStyle';
import {useCustomerFormHook} from './useCustomerFormHook';
import { SubmitButton } from '../../Atoms';
import { RoleSelector, FormInput, Header } from '../../Molecules';
import { CustomerFormProps } from '../schema';

const CustomerForm: React.FC<CustomerFormProps> = ({
  title,
  customer,
  onSubmit,
  onCancel,
  submitButtonText,
  isLoading = false,
}) => {
  // Use custom hook for business logic
  const {
    validationSchema,
    initialValues,
    handleFormSubmit,
  } = useCustomerFormHook({
    customer,
    onSubmit,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={title} onBackPress={onCancel} showBackButton={true} />

      <KeyboardAvoidingView
        testID="keyboard-avoiding-view"
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize={true}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => (
            <View
              style={[
                styles.container,
                Platform.OS === 'android' && styles.androidContainer,
              ]}>
              {/* Form */}
              <View style={styles.form}>
                <RoleSelector
                  selectedRole={values.role as 'Admin' | 'Manager'}
                  onRoleChange={role => setFieldValue('role', role)}
                  error={errors.role}
                  touched={touched.role}
                />

                {/* First Name Input */}
                <FormInput
                  label="First Name"
                  placeholder="Enter first name"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  autoCapitalize="words"
                  error={errors.firstName}
                  touched={touched.firstName}
                  required={true}
                />

                {/* Last Name Input */}
                <FormInput
                  label="Last Name"
                  placeholder="Enter last name"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  autoCapitalize="words"
                  error={errors.lastName}
                  touched={touched.lastName}
                  required={true}
                />

                {/* Email Input */}
                <FormInput
                  label="Email"
                  placeholder="Enter email address"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  touched={touched.email}
                  required={true}
                />
              </View>

              {/* Submit Button */}
              <View style={styles.buttonContainer}>
                <SubmitButton
                  title={submitButtonText}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty}
                  isLoading={isLoading}
                  loadingText="Processing..."
                />
              </View>
            </View>
          )}
        </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerForm;
