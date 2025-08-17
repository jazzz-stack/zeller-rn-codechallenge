import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {ZellerCustomer, ZellerCustomerInput, UserRole} from '../../types/User';
import {LocalDatabaseService} from '../../services/LocalDatabaseService';
import {apolloClient} from '../../config/apollo';
import {listZellerCustomers} from '../../graphql/queries';

interface CustomersState {
  customers: ZellerCustomer[];
  filteredCustomers: ZellerCustomer[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedFilter: UserRole;
}

const initialState: CustomersState = {
  customers: [],
  filteredCustomers: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedFilter: 'ALL',
};

// Async thunks
export const loadCustomersFromLocal = createAsyncThunk(
  'customers/loadFromLocal',
  async (_, {rejectWithValue}) => {
    try {
      const customers = await LocalDatabaseService.getCustomers();
      return customers;
    } catch (error) {
      console.error('loadCustomersFromLocal error:', error);
      return rejectWithValue('Failed to load customers from local database');
    }
  },
);

export const syncCustomersFromAPI = createAsyncThunk(
  'customers/syncFromAPI',
  async (_, {rejectWithValue}) => {
    try {
      // Syncing customers from API...
      const response = await apolloClient.query({
        query: listZellerCustomers,
        fetchPolicy: 'network-only',
      });
      const apiCustomers = response.data?.listZellerCustomers?.items || [];
      // Customers saved to local database
      await LocalDatabaseService.saveCustomers(apiCustomers);
      return apiCustomers;
    } catch (error: any) {
      // Only log non-network errors to avoid console spam when offline
      const isNetworkError =
        error.networkError ||
        error.message?.includes('Network request failed') ||
        error.message?.includes('timeout') ||
        error.message?.includes('fetch') ||
        error.name === 'ApolloError';

      if (!isNetworkError) {
        console.error('syncCustomersFromAPI error:', error);
      }

      // Provide more specific error messages based on different error types
      if (
        error.networkError ||
        error.message?.includes('Network request failed')
      ) {
        return rejectWithValue(
          'No internet connection. Please check your network and try again.',
        );
      } else if (error.message?.includes('timeout')) {
        return rejectWithValue(
          'Network timeout. Please check your connection and try again.',
        );
      } else if (error.message?.includes('fetch')) {
        return rejectWithValue(
          'Connection failed. Please check your internet connection.',
        );
      } else if (error.name === 'ApolloError') {
        return rejectWithValue(
          'Network error occurred. Please check your internet connection.',
        );
      } else {
        return rejectWithValue('Failed to sync customers. Please try again.');
      }
    }
  },
);

// Background sync that doesn't affect UI error state
export const backgroundSyncCustomersFromAPI = createAsyncThunk(
  'customers/backgroundSyncFromAPI',
  async () => {
    try {
      // Background syncing customers from API...
      const response = await apolloClient.query({
        query: listZellerCustomers,
        fetchPolicy: 'network-only',
      });
      const apiCustomers = response.data?.listZellerCustomers?.items || [];
      await LocalDatabaseService.saveCustomers(apiCustomers);
      return apiCustomers;
    } catch (error: any) {
      // Suppress network error logs for background sync to avoid console spam
      const isNetworkError =
        error.networkError ||
        error.message?.includes('Network request failed') ||
        error.message?.includes('timeout') ||
        error.message?.includes('fetch') ||
        error.name === 'ApolloError';

      if (isNetworkError) {
        // Silently handle network errors in background sync
        console.log('Background sync skipped - no internet connection');
      } else {
        // Log non-network errors for debugging
        console.log('Background sync failed (non-network error):', error);
      }

      // Return empty array instead of rejecting to avoid UI errors
      return [];
    }
  },
);

export const addCustomer = createAsyncThunk(
  'customers/add',
  async (customerInput: ZellerCustomerInput, {rejectWithValue}) => {
    try {
      const newCustomer = await LocalDatabaseService.addCustomer(customerInput);
      return newCustomer;
    } catch (error) {
      return rejectWithValue('Failed to add customer');
    }
  },
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async (
    {id, updates}: {id: string; updates: Partial<ZellerCustomerInput>},
    {rejectWithValue},
  ) => {
    try {
      const updatedCustomer = await LocalDatabaseService.updateCustomer(
        id,
        updates,
      );
      return updatedCustomer;
    } catch (error) {
      return rejectWithValue('Failed to update customer');
    }
  },
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id: string, {rejectWithValue}) => {
    try {
      await LocalDatabaseService.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete customer');
    }
  },
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      customersSlice.caseReducers.applyFilters(state);
    },
    setSelectedFilter: (state, action: PayloadAction<UserRole>) => {
      state.selectedFilter = action.payload;
      customersSlice.caseReducers.applyFilters(state);
    },
    clearError: state => {
      state.error = null;
    },
    applyFilters: state => {
      let filtered = [...state.customers];
      // Apply role filter
      if (state.selectedFilter !== 'ALL') {
        filtered = filtered.filter(customer => {
          return (
            customer.role.toUpperCase() === state.selectedFilter.toUpperCase()
          );
        });
      }

      // Apply search filter
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(
          customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.role.toLowerCase().includes(query),
        );
      }
      state.filteredCustomers = filtered;
    },
  },
  extraReducers: builder => {
    builder
      // Load customers from local
      .addCase(loadCustomersFromLocal.pending, state => {
        // console.log('loadCustomersFromLocal.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCustomersFromLocal.fulfilled, (state, action) => {
        // console.log('loadCustomersFromLocal.fulfilled - payload:', action.payload.length, 'customers');
        state.loading = false;
        state.customers = action.payload;
        customersSlice.caseReducers.applyFilters(state);
      })
      .addCase(loadCustomersFromLocal.rejected, (state, action) => {
        console.log('loadCustomersFromLocal.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sync customers from API
      .addCase(syncCustomersFromAPI.pending, state => {
        console.log('syncCustomersFromAPI.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCustomersFromAPI.fulfilled, (state, action) => {
        console.log(
          'syncCustomersFromAPI.fulfilled - payload:',
          action.payload.length,
          'customers',
        );
        state.loading = false;
        state.customers = action.payload;
        customersSlice.caseReducers.applyFilters(state);
      })
      .addCase(syncCustomersFromAPI.rejected, (state, action) => {
        console.log('syncCustomersFromAPI.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add customer
      .addCase(addCustomer.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
        customersSlice.caseReducers.applyFilters(state);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(
          customer => customer.id === action.payload.id,
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        customersSlice.caseReducers.applyFilters(state);
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete customer
      .addCase(deleteCustomer.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          customer => customer.id !== action.payload,
        );
        customersSlice.caseReducers.applyFilters(state);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Background sync from API (doesn't affect error state)
      .addCase(backgroundSyncCustomersFromAPI.fulfilled, (state, action) => {
        // Only update data if we actually got customers from API
        if (action.payload && action.payload.length > 0) {
          state.customers = action.payload;
          customersSlice.caseReducers.applyFilters(state);
        }
      });
  },
});

export const {setSearchQuery, setSelectedFilter, clearError} =
  customersSlice.actions;
export default customersSlice.reducer;
