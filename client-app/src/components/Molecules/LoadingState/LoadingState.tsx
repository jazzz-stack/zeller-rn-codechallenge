import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Text} from '../../Atoms';
import { styles } from './LoadingStateStyles';
import { LoadingStateProps } from '../schema';

export const LoadingState: React.FC<LoadingStateProps> = ({
  textStyle,
}) => {
  return (
    <View style={[styles.loadingContainer]} testID="loading-state">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={[styles.loadingText, textStyle]}>Loading Customer...</Text>
    </View>
  );
};

export default LoadingState;
