import {StyleSheet, Platform, StatusBar} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  androidContainer: {
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0,
  },
  form: {
    flex: 1,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f2f3f9',
    borderRadius: 50,
  },
  roleButton: {
    flex: 1,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#e8f2fb',
    borderColor: '#0171ce',
    borderWidth: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 40,
    marginTop: 20,
  },
});
