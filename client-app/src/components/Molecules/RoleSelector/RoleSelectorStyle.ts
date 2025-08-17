import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 28, // Increased margin for more prominence
    padding: 16, // Add padding around the whole component
    backgroundColor: '#f8f9fd', // Subtle background to highlight importance
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e8f0',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 18, // Increased font size for importance
    fontWeight: '700', // Bolder font weight
    marginBottom: 8,
    color: '#333',
  },
  requiredIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#E74C3C',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f3f9',
    borderRadius: 100,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8, // Increased padding for better touch area
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    minHeight: 50, // Ensure adequate touch target
  },
  selectedRole: {
    backgroundColor: '#e8f2fb',
    borderColor: '#0171ce',
    borderWidth: 2, // Thicker border for emphasis
    elevation: 3, // Higher elevation when selected
    shadowOpacity: 0.15,
  },
  roleText: {
    fontSize: 16, // Larger text for better readability
    color: '#7F8C8D',
    fontWeight: '600', // Slightly bolder
    textAlign: 'center',
  },
  selectedRoleText: {
    color: '#0171ce',
    fontWeight: '700', // Even bolder when selected
  },
  selectedIndicator: {
    fontSize: 12,
    color: '#0171ce',
    fontWeight: 'bold',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '400',
  },
});
