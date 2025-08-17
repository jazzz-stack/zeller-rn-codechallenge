import React from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Text} from '../../Atoms';
import {styles} from './ErrorStateStyles';
import {ErrorStateProps} from '../schema';

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, loading}) => {

  const renderRetryButton = () => {
      return (
        <TouchableOpacity
          style={[styles.retryButton, loading && {opacity: 0.8}]}
          onPress={() => onRetry()}
          activeOpacity={0.8}
          disabled={loading}
          testID="retry-button">
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color="#fff" 
              style={styles.retryButtonIcon} 
            />
          ) : (
            <Icon
              name="refresh"
              size={18}
              color="#fff"
              style={styles.retryButtonIcon}
            />
          )}
          <Text style={styles.retryButtonText}>
            {loading ? 'Loading...' : 'Try Again'}
          </Text>
        </TouchableOpacity>
      );
  };

  return (
    <View style={styles.errorContainer} testID="error-state">
      <View style={styles.errorContent}>
        {/* Error Illustration */}
        <View style={styles.iconContainer}>
          <Icon
            name="wifi-off"
            size={40}
            color="#ef4444"
            style={styles.errorIcon}
          />
        </View>

        {/* Error Title */}
        <Text style={styles.errorTitle}>{'Connection Problem'}</Text>

        {/* Error Message */}
        <Text style={styles.errorMessage}>
          {
            'It seems there is a connection issue, or the server may be temporarily down. Please check and try again after some time.'
          }
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>{renderRetryButton()}</View>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          Make sure you're connected to the internet and mock-server is running.
        </Text>
      </View>
    </View>
  );
};

export default ErrorState;
