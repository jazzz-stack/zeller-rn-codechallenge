import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {styles} from './UserCardStyles';
import {UserCardProps} from '../schema';
import {Text} from '../../Atoms';

const UserCard: React.FC<UserCardProps> = ({user, onEdit, onDelete}) => {
  const getInitials = (name: string) => {
    const words = name.split(' ');
    const firstInitial = words[0]?.[0] || '';
    const lastInitial = words[1]?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.userDetailsStyle}>
          <View style={styles.userNameContainer}>
            <Text style={styles.userInitials}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            testID="usercard-edit"
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(user)}>
            <Icon name="edit" size={18} color="#0171ce" />
          </TouchableOpacity>
          <TouchableOpacity
            testID="usercard-delete"
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(user)}>
            <Icon name="delete" size={18} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserCard;
