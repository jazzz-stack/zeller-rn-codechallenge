export interface ZellerCustomer {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
}

export interface ZellerCustomerInput {
  name: string;
  email: string;
  role: string;
}

export interface ZellerCustomerConnection {
  items: ZellerCustomer[];
  nextToken?: string;
}

export type UserRole = 'ALL' | 'Admin' | 'Manager';
