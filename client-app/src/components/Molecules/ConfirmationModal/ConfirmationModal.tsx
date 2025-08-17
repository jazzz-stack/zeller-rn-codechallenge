import React, {use} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {styles} from './ConfirmationModalStyle';
import {useConfirmationModal} from './useConfirmationModal';

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  customerName?: string; // Keep for backward compatibility
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'success' | 'error' | 'warning' | 'info' | 'delete';
  showCancel?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  customerName,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'info',
  showCancel = true,
}) => {
  const {
    iconConfig,
    buttonConfig,
    displayTitle,
    displayMessage,
    displayConfirmText,
    scaleValue,
  } = useConfirmationModal({
    visible,
    title,
    message,
    customerName,
    confirmText,
    type,
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel || (() => {})}>
      <TouchableWithoutFeedback onPress={onCancel || (() => {})}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{scale: scaleValue}],
                },
              ]}>
              <View style={styles.iconContainer}>
                <Icon
                  name={iconConfig.name}
                  size={48}
                  color={iconConfig.color}
                />
              </View>

              <Text style={styles.title}>{displayTitle}</Text>
              <Text style={styles.message}>{displayMessage}</Text>

              <View style={styles.buttonContainer}>
                {showCancel && onCancel && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={isLoading}>
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    {backgroundColor: buttonConfig.backgroundColor},
                    !showCancel && styles.singleButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={onConfirm}
                  disabled={isLoading}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.confirmButtonText}>
                        {type === 'delete' ? 'Deleting...' : 'Please wait...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {displayConfirmText}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmationModal;
