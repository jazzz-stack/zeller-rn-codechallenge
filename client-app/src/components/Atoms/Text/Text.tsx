import React from 'react';
import {Text as RNText, TextProps as RNTextProps} from 'react-native';
import { styles } from './TextStyles';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'bold' | 'light';
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  size = 'medium',
  weight = 'normal',
  style,
  children,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles.text,
        styles[variant],
        styles[color],
        styles[size],
        styles[weight],
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
};

export default Text;
