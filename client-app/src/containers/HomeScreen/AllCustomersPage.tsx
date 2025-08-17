import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { UserCard, LoadingState, EmptyState } from '../../components/Molecules';
import { ZellerCustomer } from '../../types/User';
import { styles } from './HomeScreenStyle';

import { RefreshControlProps } from 'react-native';

interface AllCustomersPageProps {
  customers: ZellerCustomer[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onEditCustomer: (user: ZellerCustomer) => void;
  onDeleteCustomer: (user: ZellerCustomer) => void;
  onScroll: (event: any) => void;
  onEndReached: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const AllCustomersPage: React.FC<AllCustomersPageProps> = ({
  customers,
  loading,
  error,
  refreshing,
  onRefresh,
  onEditCustomer,
  onDeleteCustomer,
  onScroll,
  onEndReached,
  refreshControl,
}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <FlatList
      data={customers}
      keyExtractor={(item: ZellerCustomer) => item.id}
      renderItem={({ item }) => (
        <UserCard user={item} onEdit={onEditCustomer} onDelete={onDeleteCustomer} />
      )}
      ListEmptyComponent={loading && !error ? <LoadingState /> : <EmptyState />}
      {...(refreshControl ? { refreshControl } : {})}
      contentContainerStyle={[styles.listContent]}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  </KeyboardAvoidingView>
);
