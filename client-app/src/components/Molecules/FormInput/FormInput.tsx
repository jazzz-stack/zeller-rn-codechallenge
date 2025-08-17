import React from 'react';
import {View, TextInput, useColorScheme, TextInputProps} from 'react-native';
import {Text} from '../../Atoms';
import {styles} from './FormInputStyle';

export interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  containerStyle?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  required = false,
  containerStyle,
  ...textInputProps
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  // UI styling
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#333' : '#ddd';
  const errorColor = '#E74C3C';
  const placeholderColor = isDarkMode ? '#666' : '#999';
  const inputBorderColor = touched && error ? errorColor : borderColor;

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, {color: textColor}]}>{label}</Text>
        {required && <Text style={styles.requiredIndicator}>*</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: inputBorderColor,
          },
        ]}
        placeholderTextColor={placeholderColor}
        {...textInputProps}
      />
      {touched && error && (
        <Text style={[styles.errorText, {color: errorColor}]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default FormInput;
