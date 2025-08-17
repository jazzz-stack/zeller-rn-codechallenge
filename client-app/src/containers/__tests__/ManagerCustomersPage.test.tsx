import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ManagerCustomersPage } from '../HomeScreen/ManagerCustomersPage';
import { ZellerCustomer } from '../../types/User';

const mockCustomers: ZellerCustomer[] = [
  { id: '1', name: 'Charlie', email: 'charlie@example.com', role: 'Manager' },
  { id: '2', name: 'Dana', email: 'dana@example.com', role: 'Manager' },
];

describe('ManagerCustomersPage', () => {
  it('renders customer list', () => {
    const { getByText } = render(
      <ManagerCustomersPage
        customers={mockCustomers}
        loading={false}
        error={null}
        refreshing={false}
        onRefresh={jest.fn()}
        onEditCustomer={jest.fn()}
        onDeleteCustomer={jest.fn()}
        onScroll={jest.fn()}
        onEndReached={jest.fn()}
      />
    );
    expect(getByText('Charlie')).toBeTruthy();
    expect(getByText('Dana')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <ManagerCustomersPage
        customers={[]}
        loading={true}
        error={null}
        refreshing={false}
        onRefresh={jest.fn()}
        onEditCustomer={jest.fn()}
        onDeleteCustomer={jest.fn()}
        onScroll={jest.fn()}
        onEndReached={jest.fn()}
      />
    );
    expect(getByTestId('loading-state')).toBeTruthy();
  });

  it('shows empty state when no customers and not loading', () => {
    const { getByTestId } = render(
      <ManagerCustomersPage
        customers={[]}
        loading={false}
        error={null}
        refreshing={false}
        onRefresh={jest.fn()}
        onEditCustomer={jest.fn()}
        onDeleteCustomer={jest.fn()}
        onScroll={jest.fn()}
        onEndReached={jest.fn()}
      />
    );
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('calls onEditCustomer when edit is triggered', () => {
    const onEdit = jest.fn();
    const { getAllByTestId } = render(
      <ManagerCustomersPage
        customers={mockCustomers}
        loading={false}
        error={null}
        refreshing={false}
        onRefresh={jest.fn()}
        onEditCustomer={onEdit}
        onDeleteCustomer={jest.fn()}
        onScroll={jest.fn()}
        onEndReached={jest.fn()}
      />
    );
    // Assuming UserCard exposes a testID for edit button
    fireEvent.press(getAllByTestId('usercard-edit')[0]);
    expect(onEdit).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('calls onDeleteCustomer when delete is triggered', () => {
    const onDelete = jest.fn();
    const { getAllByTestId } = render(
      <ManagerCustomersPage
        customers={mockCustomers}
        loading={false}
        error={null}
        refreshing={false}
        onRefresh={jest.fn()}
        onEditCustomer={jest.fn()}
        onDeleteCustomer={onDelete}
        onScroll={jest.fn()}
        onEndReached={jest.fn()}
      />
    );
    // Assuming UserCard exposes a testID for delete button
    fireEvent.press(getAllByTestId('usercard-delete')[0]);
    expect(onDelete).toHaveBeenCalledWith(mockCustomers[0]);
  });
});
