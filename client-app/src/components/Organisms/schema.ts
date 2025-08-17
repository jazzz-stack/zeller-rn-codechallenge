import { UserRole, ZellerCustomer, ZellerCustomerInput } from '../../types/User';

export interface CustomerFormProps {
  title: string;
  customer?: ZellerCustomer;
  onSubmit: (customerData: ZellerCustomerInput) => void;
  onCancel: () => void;
  submitButtonText: string;
  isLoading?: boolean;
}

export interface UseCustomerFormHookProps {
  customer?: ZellerCustomer;
  onSubmit: (customerData: ZellerCustomerInput) => void;
  isLoading?: boolean;
}

export interface CustomerFilterHeaderProps {
  isSearching: boolean;
  searchQuery: string;
  selectedFilter: UserRole;
  onSearchChange: (query: string) => void;
  onSearchToggle: (shouldSearch: boolean) => void;
  onFilterChange: (filter: UserRole) => void;
  onSearchOpen: () => void;
  onFocus?: (focused: boolean) => void;
}
