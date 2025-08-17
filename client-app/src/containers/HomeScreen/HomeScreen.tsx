import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Animated,
  Platform,
} from 'react-native';
import { FilterPager } from './FilterPager';
import {FloatingButton} from '../../components/Atoms';
import {
  UserCard,
  LoadingState,
  EmptyState,
  ErrorState,
  CustomerFilterHeader,
  ConfirmationModal,
} from '../../components/Molecules';
import {ZellerCustomer} from '../../types/User';
import {styles} from './HomeScreenStyle';
import {HomeScreenProps} from '../../navigation/schema_types/navigation-schema';
import {useHomeHook} from './Home-hook';

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const {
    customers,
    customerSections,
    loading,
    error,
    searchQuery,
    selectedFilter,
    isSearching,
    refreshing,
    headerTranslateY,
    showDeleteModal,
    customerToDelete,
    isDeleting,
    isFocused,
    handleSearchToggle,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    confirmDeleteCustomer,
    cancelDeleteCustomer,
    handlePullToRefresh,
    handleSearchChange,
    handleFilterChange,
    handleSearchOpen,
    handleScroll,
    handleSyncFromAPI,
    setIsFocused,
  } = useHomeHook(navigation);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      {error && customerSections?.length === 0 ? (
        <ErrorState
          error={error}
          onRetry={handleSyncFromAPI}
          loading={loading}
        />
      ) : (
        <View style={[styles.container]}>
          <Animated.View
            style={[
              styles.animatedHeader,
              { transform: [{ translateY: headerTranslateY }] },
            ]}
          >
            <CustomerFilterHeader
              isSearching={isSearching}
              searchQuery={searchQuery}
              selectedFilter={selectedFilter}
              onSearchChange={handleSearchChange}
              onSearchToggle={handleSearchToggle}
              onFilterChange={handleFilterChange}
              onSearchOpen={handleSearchOpen}
              onFocus={setIsFocused}
            />
            {customers.length > 0 && (
              <Text style={styles.title}>
                {'Zeller Customers'}
                {` (${customers.length})`}
              </Text>
            )}
          </Animated.View>
          <FilterPager
            customers={customers}
            loading={loading}
            error={error}
            refreshing={refreshing}
            customerSections={customerSections}
            selectedFilter={selectedFilter}
            onRefresh={handlePullToRefresh}
            onFilterChange={handleFilterChange}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onScroll={handleScroll}
          />
          <FloatingButton
            onPress={handleAddCustomer}
            variant="primary"
            size="medium"
          />
        </View>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        type="delete"
        message={`Are you sure you want to delete ${customerToDelete?.name}?`}
        onConfirm={confirmDeleteCustomer}
        onCancel={cancelDeleteCustomer}
        isLoading={isDeleting}
        confirmText="Delete"
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
