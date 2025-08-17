import React from 'react';
import {View} from 'react-native';
import {Text, SyncButton} from '../../Atoms';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './EmptyStateStyles';
import { EmptyStateProps } from '../schema';



export const EmptyState: React.FC<EmptyStateProps> = ({textStyle}) => {
  return (
    <View style={styles.emptyContainer} testID="empty-state">
      <Icon
        name="people-outline"
        size={80}
        color="#BDC3C7"
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, textStyle]}>{'No customers found.'}</Text>
      <Text style={[styles.emptySubText, textStyle]}>
        {'Tap the + button to add your first customer'}
      </Text>
    </View>
  );
};

export default EmptyState;
