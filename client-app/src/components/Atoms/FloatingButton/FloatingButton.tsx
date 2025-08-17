import React from 'react';
import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './FloatingButtonStyles';

interface FloatingButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  iconName = 'person-add',
  iconSize = 25,
  iconColor = '#ffffff',
  style,
  ...props
}) => {
  return (
    <View
      style={styles.keyboardAvoidingContainer}
      pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.button, styles[variant], styles[size], style]}
        {...props}>
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingButton;
