import { TextStyle } from 'react-native';
import { UserRole, ZellerCustomer } from '../../types/User';

export interface EmptyStateProps {
  textStyle?: TextStyle;
}

export interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  loading: boolean;
}

export interface FilterButtonsProps {
  selectedFilter: UserRole;
  onFilterChange: (filter: UserRole) => void;
  onSearch: () => void;
}

export interface LoadingStateProps {
  textStyle?: TextStyle;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  placeholder?: string;
  textStyle?:any;
  onFocus?: (focused: boolean) => void;
}

export interface UserCardProps {
  user: ZellerCustomer;
  onEdit: (user: ZellerCustomer) => void;
  onDelete: (user: ZellerCustomer) => void;
}
