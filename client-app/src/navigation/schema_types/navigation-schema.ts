import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ZellerCustomer} from '../../types/User';

export type UserStackParamList = {
  Home: undefined;
  AddCustomer: undefined;
  EditCustomer: {customer: ZellerCustomer};
};

export type HomeScreenProps = NativeStackScreenProps<
  UserStackParamList,
  'Home'
>;

export type AddCustomerScreenProps = NativeStackScreenProps<
  UserStackParamList,
  'AddCustomer'
>;

export type EditCustomerScreenProps = NativeStackScreenProps<
  UserStackParamList,
  'EditCustomer'
>;
