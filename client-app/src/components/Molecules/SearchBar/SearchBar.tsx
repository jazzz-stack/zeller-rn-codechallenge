import React from 'react';
import {View, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './SearchBarStyle';
import { SearchBarProps } from '../schema';

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
  placeholder = 'Search by name or role...',
  textStyle,
  onFocus,
}) => {
  return (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, textStyle]}
        placeholder={placeholder}
        placeholderTextColor="#BDC3C7"
        value={searchQuery}
        onChangeText={onSearchChange}
        autoFocus={true}
        onFocus={() => onFocus(true)}
        onBlur={() => onFocus(false)}
      />
      <TouchableOpacity onPress={onClose}>
        <Icon name="close" size={24} color="#3498DB" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
