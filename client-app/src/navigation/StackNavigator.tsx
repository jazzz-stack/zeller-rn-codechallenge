import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {UserStackParamList} from './schema_types/navigation-schema';
import {HomeScreen, AddCustomerScreen, EditCustomerScreen} from '../containers';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

const Stack = createNativeStackNavigator<UserStackParamList>();

function StackNavigator(): React.JSX.Element {
  return (
    <View style={styles.androidContainer}>
      <Stack.Navigator 
        id={undefined}
        initialRouteName="Home" 
        screenOptions={{headerShown: false}}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
        <Stack.Screen name="EditCustomer" component={EditCustomerScreen} />
      </Stack.Navigator>
    </View>
  );
}

export default StackNavigator;

const styles = StyleSheet.create({
  androidContainer: {
    flex: 1,
    // Ensure the container takes full height on Android
    paddingTop: StatusBar.currentHeight || 0,
  },
});
