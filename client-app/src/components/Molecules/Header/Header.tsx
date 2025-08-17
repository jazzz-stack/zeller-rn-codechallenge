import React from 'react';
import {View, TouchableOpacity, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Text} from '../../Atoms';
import {styles} from './HeaderStyle';

export interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  containerStyle?: any;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  rightComponent,
  containerStyle,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const borderColor = isDarkMode ? '#333' : '#E5E5EA';

  return (
    <View style={[styles.header, {borderBottomColor: borderColor}, containerStyle]}>
      {/* Left Button */}
      <View style={styles.headerButton}>
        {showBackButton && onBackPress && (
          <TouchableOpacity style={styles.buttonContainer} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={[styles.headerTitle, {color: textColor}]}>{title}</Text>

      {/* Right Component */}
      <View style={styles.headerButton}>
        {rightComponent}
      </View>
    </View>
  );
};

export default Header;
