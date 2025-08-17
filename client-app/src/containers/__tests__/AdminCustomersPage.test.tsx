import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdminCustomersPage } from '../HomeScreen/AdminCustomersPage';
import { ZellerCustomer } from '../../types/User';

const mockCustomers: ZellerCustomer[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'Admin' },
];

describe('AdminCustomersPage', () => {
  it('renders customer list', () => {
    const { getByText } = render(
      <AdminCustomersPage
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
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <AdminCustomersPage
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
      <AdminCustomersPage
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
      <AdminCustomersPage
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
      <AdminCustomersPage
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
