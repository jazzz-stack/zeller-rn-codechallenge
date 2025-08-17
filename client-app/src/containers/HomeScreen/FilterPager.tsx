import React from 'react';
import PagerView from 'react-native-pager-view';
import { View, RefreshControl } from 'react-native';
import { AllCustomersPage } from './AllCustomersPage';
import { AdminCustomersPage } from './AdminCustomersPage';
import { ManagerCustomersPage } from './ManagerCustomersPage';
import { ZellerCustomer, UserRole } from '../../types/User';

const FILTERS: UserRole[] = ['ALL', 'Admin', 'Manager'];

export interface FilterPagerProps {
  customers: ZellerCustomer[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  customerSections: any[];
  selectedFilter: UserRole;
  onRefresh: () => void;
  onFilterChange: (filter: UserRole) => void;
  onEditCustomer: (user: ZellerCustomer) => void;
  onDeleteCustomer: (user: ZellerCustomer) => void;
  onScroll: (event: any) => void;
}

export const FilterPager: React.FC<FilterPagerProps> = ({
  customers,
  loading,
  error,
  refreshing,
  customerSections,
  selectedFilter,
  onRefresh,
  onFilterChange,
  onEditCustomer,
  onDeleteCustomer,
  onScroll,
}) => {
  const pagerRef = React.useRef<PagerView>(null);
  const selectedIndex = FILTERS.indexOf(selectedFilter);

  React.useEffect(() => {
    if (pagerRef.current) {
      pagerRef.current.setPage(selectedIndex);
    }
  }, [selectedIndex]);

  // Pagination state for each filter
  const [pageMap, setPageMap] = React.useState({ ALL: 1, Admin: 1, Manager: 1 });
  const PAGE_SIZE = 20;

  const getFilteredCustomers = (filter: UserRole) => {
    if (filter === 'ALL') return customers;
    return customers.filter(c => c.role === filter);
  };

  const getPaginatedCustomers = (filter: UserRole) => {
    const all = getFilteredCustomers(filter);
    return all.slice(0, pageMap[filter] * PAGE_SIZE);
  };

  const handleEndReached = (filter: UserRole) => {
    const all = getFilteredCustomers(filter);
    if (getPaginatedCustomers(filter).length < all.length) {
      setPageMap(prev => ({ ...prev, [filter]: prev[filter] + 1 }));
    }
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#3498DB"]}
      tintColor="#3498DB"
      title="Pull to refresh..."
      progressViewOffset={100}
      progressBackgroundColor="#fff"
    />
  );

  // Track last page to avoid unnecessary setPage calls
  const lastPage = React.useRef(selectedIndex);

  React.useEffect(() => {
    if (pagerRef.current && selectedIndex !== lastPage.current) {
      pagerRef.current.setPage(selectedIndex);
      lastPage.current = selectedIndex;
    }
  }, [selectedIndex]);

  return (
    <PagerView
      style={{ flex: 1 }}
      ref={pagerRef}
      testID="pager-view"
      onPageSelected={e => {
        const idx = e.nativeEvent.position;
        if (idx !== selectedIndex) {
          onFilterChange(FILTERS[idx]);
        }
      }}
    >
      <View key="ALL" style={{ flex: 1 }}>
        <AllCustomersPage
          customers={getPaginatedCustomers('ALL')}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEditCustomer={onEditCustomer}
          onDeleteCustomer={onDeleteCustomer}
          onScroll={onScroll}
          onEndReached={() => handleEndReached('ALL')}
          refreshControl={refreshControl}
        />
      </View>
      <View key="Admin" style={{ flex: 1 }}>
        <AdminCustomersPage
          customers={getPaginatedCustomers('Admin')}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEditCustomer={onEditCustomer}
          onDeleteCustomer={onDeleteCustomer}
          onScroll={onScroll}
          onEndReached={() => handleEndReached('Admin')}
          refreshControl={refreshControl}
        />
      </View>
      <View key="Manager" style={{ flex: 1 }}>
        <ManagerCustomersPage
          customers={getPaginatedCustomers('Manager')}
          loading={loading}
          error={error}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEditCustomer={onEditCustomer}
          onDeleteCustomer={onDeleteCustomer}
          onScroll={onScroll}
          onEndReached={() => handleEndReached('Manager')}
          refreshControl={refreshControl}
        />
      </View>
    </PagerView>
  );
};
