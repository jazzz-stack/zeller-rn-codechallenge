import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import StackNavigator from './StackNavigator';

function AppNavigator(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: '#007AFF',
          background: isDarkMode ? Colors.darker : Colors.lighter,
          card: isDarkMode ? Colors.dark : Colors.light,
          text: isDarkMode ? Colors.white : Colors.black,
          border: isDarkMode ? '#2C2C2E' : '#C6C6C8',
          notification: '#FF3B30',
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
      >
      <StackNavigator />
    </NavigationContainer>
  );
}

export default AppNavigator;
