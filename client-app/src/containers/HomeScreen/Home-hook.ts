import {useEffect, useRef, useState, useMemo} from 'react';
import {Animated} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  loadCustomersFromLocal,
  syncCustomersFromAPI,
  backgroundSyncCustomersFromAPI,
  deleteCustomer,
  setSearchQuery,
  setSelectedFilter,
} from '../../store/slices/customersSlice';
import {ZellerCustomer, UserRole} from '../../types/User';
import {HomeScreenProps} from '../../navigation/schema_types/navigation-schema';

export interface CustomerSection {
  title: string;
  data: ZellerCustomer[];
}

export const useHomeHook = (navigation: HomeScreenProps['navigation']) => {
  const dispatch = useAppDispatch();

  // Local UI state
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<ZellerCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Animation for header visibility
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Redux state
  const {
    filteredCustomers: customers,
    loading,
    error,
    searchQuery,
    selectedFilter,
  } = useAppSelector(state => state.customers);

  // Create sorted sections for customers
  const customerSections = useMemo(() => {
    if (!customers || customers.length === 0) {
      return [];
    }

    // Sort customers alphabetically by name
    const sortedCustomers = [...customers].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    // Group customers by first letter
    const grouped = sortedCustomers.reduce((acc: Record<string, ZellerCustomer[]>, customer) => {
      const firstLetter = customer.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(customer);
      return acc;
    }, {});

    // Convert to sections array and sort alphabetically
    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter],
      }));
  }, [customers]);

  // Smart loading strategy on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Step 1: Always load from local database first
        const localResult = await dispatch(loadCustomersFromLocal()).unwrap();
        // Step 2: Determine sync strategy based on local data availability
        if (localResult.length > 0) {
          // User has local data - use background sync (won't show errors in UI)
          dispatch(backgroundSyncCustomersFromAPI());
        } else {
          // First time user - use regular sync (will show errors in UI if network fails)
          try {
            await dispatch(syncCustomersFromAPI()).unwrap();
          } catch (syncError) {
            // Error will be shown in UI via Redux state
          }
        }
      } catch (loadError) {
        // If loading local data fails, try API sync anyway
        try {
          await dispatch(syncCustomersFromAPI()).unwrap();
        } catch (syncError) {
          // Error will be shown in UI via Redux state
        }
      }
    };
    
    initializeData();
  }, [dispatch]);

  // Business logic handlers
  const handleSearchToggle = (_shouldSearch: boolean) => {
    setIsSearching(!isSearching);
    handleSearchChange(''); // Clear search when toggling
  };

  const handleAddCustomer = () => {
    navigation.navigate('AddCustomer');
  };

  const handleEditCustomer = (user: ZellerCustomer) => {
    navigation.navigate('EditCustomer', {customer: user});
  };

  const handleDeleteCustomer = (user: ZellerCustomer) => {
    setCustomerToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteCustomer(customerToDelete.id)).unwrap();
      // Success - modal state will be handled by the component
    } catch (err) {
      // Error - modal state will be handled by the component  
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const cancelDeleteCustomer = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
    setIsDeleting(false);
  };

  const handleRefresh = async () => {
    dispatch(loadCustomersFromLocal());
  };

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    try {
      // Step 1: Always load local data first to show something immediately
      const localResult = await dispatch(loadCustomersFromLocal()).unwrap();
      dispatch(backgroundSyncCustomersFromAPI());

    } catch (error) {
      // If local loading fails, try background sync anyway
      dispatch(backgroundSyncCustomersFromAPI());
    } finally {
      // Ensure refreshing state is always cleared
      setRefreshing(false);
    }
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleFilterChange = (filter: UserRole) => {
    dispatch(setSelectedFilter(filter));
  };

  const handleSearchOpen = () => {
    setIsSearching(true);
    dispatch(setSelectedFilter('ALL'));
  };

  const handleSyncFromAPI = async () => {
    try {
      await dispatch(syncCustomersFromAPI()).unwrap();
      // If sync succeeds, error state will be automatically cleared by Redux
    } catch (error) {
      // Error will be shown in UI via Redux state
      // Don't log here to prevent duplicate console logs
    }
  };

  // Handle scroll to show/hide header
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    // Only trigger animation if scroll difference is significant
    if (Math.abs(diff) > 10) {
      if (diff > 0 && currentScrollY > 30 && isHeaderVisible) {
        // Scrolling down - hide header
        setIsHeaderVisible(false);
        Animated.timing(headerTranslateY, {
          toValue: -150, // Move header completely out of view
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (diff < 0 && !isHeaderVisible) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      lastScrollY.current = currentScrollY;
    }
  };

  return {
    customers,
    customerSections,
    loading,
    error,
    searchQuery,
    selectedFilter,
    isSearching,
    refreshing,
    headerTranslateY,
    isHeaderVisible,
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
    handleRefresh,
    handlePullToRefresh,
    handleSearchChange,
    handleFilterChange,
    handleSearchOpen,
    handleSyncFromAPI,
    handleScroll,
    setIsFocused,
  };
};
