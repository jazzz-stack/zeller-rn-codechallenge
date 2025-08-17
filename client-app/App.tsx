import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ApolloProvider} from '@apollo/client';
import {Provider} from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import {apolloClient} from './src/config/apollo';
import {store} from './src/store';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? Colors.darker : Colors.lighter}
          />
          <AppNavigator />
      </ApolloProvider>
    </Provider>
  );
}

export default App;
