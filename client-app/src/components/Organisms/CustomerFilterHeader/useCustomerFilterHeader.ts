import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface UseCustomerFilterHeaderProps {
  isSearching: boolean;
}

export const useCustomerFilterHeader = ({ isSearching }: UseCustomerFilterHeaderProps) => {
  // Animation values
  const filterOpacity = useRef(new Animated.Value(1)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const filterTranslateX = useRef(new Animated.Value(0)).current;
  const searchTranslateX = useRef(new Animated.Value(100)).current;
  const filterScale = useRef(new Animated.Value(1)).current;
  const searchScale = useRef(new Animated.Value(0.8)).current;

  // Animate transitions when isSearching changes
  useEffect(() => {
    if (isSearching) {
      // Show SearchBar, Hide FilterButtons
      Animated.parallel([
        // Fade out and slide FilterButtons to left
        Animated.timing(filterOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(filterTranslateX, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(filterScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        // Fade in and slide SearchBar from right
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(searchTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(searchScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Show FilterButtons, Hide SearchBar
      Animated.parallel([
        // Fade out and slide SearchBar to right
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(searchTranslateX, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(searchScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        // Fade in and slide FilterButtons from left
        Animated.timing(filterOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(filterTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(filterScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSearching, filterOpacity, searchOpacity, filterTranslateX, searchTranslateX, filterScale, searchScale]);

  return {
    // Animation values for the UI components
    filterOpacity,
    searchOpacity,
    filterTranslateX,
    searchTranslateX,
    filterScale,
    searchScale,
  };
};
