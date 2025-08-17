import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingLeft: 0,
    marginBottom: 8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userDetails: {
    flex: 1,
  },
  userDetailsStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userNameContainer: {
    height: 50,
    width: 50,
    borderRadius: 14,
    backgroundColor: '#e8f2fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0171ce',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  roleText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e8f2fb',
    borderColor: '#0171ce',
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: '#FDEDED',
    borderColor: '#E74C3C',
    borderWidth: 1,
  },
});
