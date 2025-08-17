import React, {useRef, useEffect, useMemo} from 'react';
import {View, TouchableOpacity, Text, Animated} from 'react-native';
import {UserRole} from '../../../types/User';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './FilterButtonsStyle';
import { FilterButtonsProps } from '../schema';

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilter,
  onFilterChange,
  onSearch,
}) => {
  const filters: {label: string; value: UserRole}[] = useMemo(() => [
    {label: 'All', value: 'ALL'},
    {label: 'Admin', value: 'Admin'},
    {label: 'Manager', value: 'Manager'},
  ], []);

  // Create animated values for each filter
  const animatedValues = useRef(
    filters.reduce((acc, filter) => {
      acc[filter.value] = new Animated.Value(0);
      return acc;
    }, {} as Record<UserRole, Animated.Value>)
  ).current;

  useEffect(() => {
    // Animate all buttons with smooth spring transition
    filters.forEach(filter => {
      Animated.spring(animatedValues[filter.value], {
        toValue: selectedFilter === filter.value ? 1 : 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedFilter, animatedValues, filters]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.activeFilter,
            ]}
            onPress={() => onFilterChange(filter.value)}
            activeOpacity={0.8}>
            <Animated.View
              style={{
                opacity: animatedValues[filter.value].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1.0],
                }),
                transform: [
                  {
                    scale: animatedValues[filter.value].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1.08],
                    }),
                  },
                ],
              }}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.value && styles.activeFilterText,
                ]}>
                {filter.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={() => onSearch()}>
        <Icon name="search" size={30} color="#0171ce" />
      </TouchableOpacity>
    </View>
  );
};

export default FilterButtons;
