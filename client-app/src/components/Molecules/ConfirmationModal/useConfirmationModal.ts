import React from "react";
import { Animated } from "react-native";

export const useConfirmationModal = ({
  visible,
  title,
  message,
  customerName,
  confirmText,
  type,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        } else {
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }, [visible, scaleValue]);
    
    

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {name: 'check-circle', color: '#4CAF50'};
      case 'error':
        return {name: 'error', color: '#FF3B30'};
      case 'warning':
      case 'delete':
        return {name: 'warning', color: '#f8b50aff'};
      default:
        return {name: 'info', color: '#007AFF'};
    }
  };

  const getButtonConfig = () => {
    switch (type) {
      case 'success':
        return {backgroundColor: '#4CAF50'};
      case 'error':
        return {backgroundColor: '#FF3B30'};
      case 'warning':
        return {backgroundColor: '#f8b50aff'};
      case 'delete':
        return {backgroundColor: '#FF3B30'};
      default:
        return {backgroundColor: '#007AFF'};
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return title || 'Success';
      case 'error':
        return title || 'Error';
      case 'warning':
        return title || 'Warning';
      case 'delete':
        return title || 'Delete Customer';
      default:
        return title || 'Information';
    }
  };

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'delete':
        return confirmText === 'OK' ? 'Delete' : confirmText;
      default:
        return confirmText;
    }
  };

  const defaultMessage =
    customerName && type === 'delete'
      ? `Are you sure you want to delete ${customerName}?`
      : message;

  const displayMessage = defaultMessage;
  const iconConfig = getIconConfig();
  const buttonConfig = getButtonConfig();
  const displayTitle = getDefaultTitle();
  const displayConfirmText = getDefaultConfirmText();

  return {
    iconConfig,
    buttonConfig,
    displayTitle,
    displayMessage,
    displayConfirmText,
    scaleValue,
  };
}