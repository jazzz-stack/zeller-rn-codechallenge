import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Text from '../Text';
import {styles} from './SyncButtonStyles';

export interface SyncButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title?: string;
  isLoading?: boolean;
  disabled?: boolean;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: any;
  textStyle?: any;
}

const SyncButton: React.FC<SyncButtonProps> = ({
  title = 'Sync',
  isLoading = false,
  disabled = false,
  iconSize = 25,
  iconColor = '#3498DB',
  containerStyle,
  textStyle,
  ...touchableProps
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.syncButton,
        isDisabled && styles.disabledButton,
        containerStyle,
      ]}
      disabled={isDisabled}
      {...touchableProps}
    >
      <Icon
        name={isLoading ? 'refresh' : 'sync'}
        size={iconSize}
        color={isDisabled ? '#999' : iconColor}
        style={isLoading ? styles.spinning : undefined}
      />
      <Text style={[styles.syncButtonText, isDisabled && styles.disabledText, textStyle]}>
        {isLoading ? 'Syncing...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default SyncButton;
