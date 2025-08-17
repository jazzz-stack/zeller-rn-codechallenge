import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#7F8C8D',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
  },
  syncButtonText: {
    marginLeft: 10,
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '500',
  },
});
