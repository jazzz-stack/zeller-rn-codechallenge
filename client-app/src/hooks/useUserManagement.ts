import {useState, useEffect, useCallback} from 'react';
import {useQuery} from '@apollo/client';
import {ZellerCustomer, ZellerCustomerInput, UserRole} from '../types/User';
import {LocalDatabaseService} from '../services/LocalDatabaseService';
import {listZellerCustomers} from '../graphql/queries';

export const useUserManagement = () => {
  const [customers, setCustomers] = useState<ZellerCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<ZellerCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<UserRole>('ALL');

  // GraphQL query to fetch customers from API
  const {loading: apiLoading, error: apiError, refetch} = useQuery(listZellerCustomers, {
    fetchPolicy: 'network-only',
    skip: true, // Don't run automatically, only when refetch is called
  });

  // Load customers from local database on mount first
  const loadLocalCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const localCustomers = await LocalDatabaseService.getCustomers();
      setCustomers(localCustomers);
    } catch (err) {
      setError('Failed to load customers from local database');
      console.error('Error loading local customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync customers from API to local database
  const syncFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await refetch();
      const apiCustomers = response.data?.listZellerCustomers?.items || [];
      console.log('API Customers:', apiCustomers);
      
      // Save to local database
      await LocalDatabaseService.saveCustomers(apiCustomers);
      
      // Update local state
      setCustomers(apiCustomers);
    } catch (err) {
      setError('Failed to sync customers from API');
      console.error('Error syncing from API:', err);
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // Add new customer
  const addCustomer = useCallback(async (customerInput: ZellerCustomerInput) => {
    try {
      setLoading(true);
      const newCustomer = await LocalDatabaseService.addCustomer(customerInput);
      setCustomers(prev => [...prev, newCustomer]);
    } catch (err) {
      setError('Failed to add customer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing customer
  const updateCustomer = useCallback(async (id: string, updates: Partial<ZellerCustomerInput>) => {
    try {
      setLoading(true);
      const updatedCustomer = await LocalDatabaseService.updateCustomer(id, updates);
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === id ? updatedCustomer : customer
        )
      );
    } catch (err) {
      setError('Failed to update customer');
      console.error('Error updating customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await LocalDatabaseService.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      setError('Failed to delete customer');
      console.error('Error deleting customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = customers;

    // Apply role filter
    if (selectedFilter !== 'ALL') {
      filtered = filtered.filter(customer => customer.role === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        customer =>
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query)
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, selectedFilter, searchQuery]);

  // Load local customers on mount
  useEffect(() => {
    loadLocalCustomers();
  }, [loadLocalCustomers]);

  return {
    customers: filteredCustomers,
    loading: loading || apiLoading,
    error: error || (apiError?.message ?? null),
    searchQuery,
    selectedFilter,
    setSearchQuery,
    setSelectedFilter,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    syncFromAPI,
    refreshLocalData: loadLocalCustomers,
  };
};
