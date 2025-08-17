import React from 'react';
import {Animated, View} from 'react-native';
import {FilterButtons, SearchBar} from '../../Molecules/index';
import {CustomerFilterHeaderProps} from '../schema';
import {useCustomerFilterHeader} from './useCustomerFilterHeader';
import {styles} from './CustomerFilterHeaderStyle';

const CustomerFilterHeader: React.FC<CustomerFilterHeaderProps> = ({
  isSearching,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onSearchToggle,
  onFilterChange,
  onSearchOpen,
  onFocus,
}) => {
  const {
    filterOpacity,
    searchOpacity,
    filterTranslateX,
    searchTranslateX,
    filterScale,
    searchScale,
  } = useCustomerFilterHeader({isSearching});

  return (
    <View style={styles.container}>
      {isSearching ? (
        <Animated.View
          style={[
            styles.absoluteStyle,
            {
              opacity: searchOpacity,
              transform: [{translateX: searchTranslateX}, {scale: searchScale}],
            },
          ]}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onClose={() => onSearchToggle(false)}
            onFocus={onFocus}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.absoluteStyle,
            {
              opacity: filterOpacity,
              transform: [{translateX: filterTranslateX}, {scale: filterScale}],
            },
          ]}>
          <FilterButtons
            selectedFilter={selectedFilter}
            onFilterChange={onFilterChange}
            onSearch={onSearchOpen}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default CustomerFilterHeader;
