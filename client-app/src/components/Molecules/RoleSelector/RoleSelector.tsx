import React, {useRef, useEffect, useMemo} from 'react';
import {View, TouchableOpacity, useColorScheme, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Text} from '../../Atoms';
import {styles} from './RoleSelectorStyle';

export interface RoleSelectorProps {
  selectedRole: 'Admin' | 'Manager' | '';
  onRoleChange: (role: 'Admin' | 'Manager') => void;
  error?: string;
  touched?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  error,
  touched,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const roles: {label: string; value: 'Admin' | 'Manager'}[] = useMemo(() => [
    {label: 'Admin', value: 'Admin'},
    {label: 'Manager', value: 'Manager'},
  ], []);

  // Create animated values for each role
  const animatedValues = useRef(
    roles.reduce((acc, role) => {
      acc[role.value] = new Animated.Value(0);
      return acc;
    }, {} as Record<'Admin' | 'Manager', Animated.Value>)
  ).current;

  useEffect(() => {
    // Animate all buttons with smooth spring transition
    roles.forEach(role => {
      Animated.spring(animatedValues[role.value], {
        toValue: selectedRole === role.value ? 1 : 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedRole, animatedValues, roles]);

  // UI styling
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const errorColor = '#E74C3C';
  const subtitleColor = isDarkMode ? '#AAAAAA' : '#666666';

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Icon name="admin-panel-settings" size={20} color="#0171ce" style={styles.icon} />
        <Text style={[styles.label, {color: textColor}]}>User Role</Text>
        <Text style={styles.requiredIndicator}>*</Text>
      </View>
      <Text style={[styles.subtitle, {color: subtitleColor}]}>
        Select the appropriate role for this user
      </Text>
      <View style={styles.roleContainer}>
        {roles.map(role => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.roleButton,
              selectedRole === role.value && styles.selectedRole,
            ]}
            onPress={() => onRoleChange(role.value)}
            activeOpacity={0.8}>
            <Animated.View
              style={{
                opacity: animatedValues[role.value].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1.0],
                }),
                transform: [
                  {
                    scale: animatedValues[role.value].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1.08],
                    }),
                  },
                ],
              }}>
              <Text
                style={[
                  styles.roleText,
                  selectedRole === role.value && styles.selectedRoleText,
                ]}>
                {role.label} {selectedRole === role.value && '✓'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      {touched && error && (
        <Text style={[styles.errorText, {color: errorColor}]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default RoleSelector;
