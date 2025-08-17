import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
import Text from '../Text';
import {styles} from './SubmitButtonStyles';

export interface SubmitButtonProps
  extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  containerStyle?: any;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  title,
  isLoading = false,
  loadingText = 'Processing...',
  disabled = false,
  containerStyle,
  ...touchableProps
}) => {
  const isDisabled = disabled || isLoading;
  const displayText = isLoading ? loadingText : title;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.disabledButton,
        containerStyle,
      ]}
      disabled={isDisabled}
      {...touchableProps}>
      <Text style={[styles.buttonText]}>{displayText}</Text>
    </TouchableOpacity>
  );
};

export default SubmitButton;
