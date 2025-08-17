import Realm from 'realm';
import { ZellerCustomer, ZellerCustomerInput } from '../types/User';

// Realm Schema for ZellerCustomer
class ZellerCustomerSchema extends Realm.Object {
  static schema: Realm.ObjectSchema = {
    name: 'ZellerCustomer',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      email: 'string',
      role: 'string',
    },
  };
}

export class LocalDatabaseService {
  private static realm: Realm | null = null;

  private static async getRealm(): Promise<Realm> {
    if (!this.realm) {
      this.realm = await Realm.open({
        schema: [ZellerCustomerSchema],
        schemaVersion: 1,
      });
    }
    return this.realm;
  }

  static async getCustomers(): Promise<ZellerCustomer[]> {
    try {
      const realm = await this.getRealm();
      const customers = realm.objects<ZellerCustomer>('ZellerCustomer');
      // Convert Realm objects to plain JavaScript objects to avoid invalidation issues
      return customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
      }));
    } catch (error) {
      return [];
    }
  }

  static async saveCustomers(customers: ZellerCustomer[]): Promise<void> {
    try {
      const realm = await this.getRealm();
      realm.write(() => {
        // Clear existing data
        const existingCustomers = realm.objects('ZellerCustomer');
        realm.delete(existingCustomers);
        
        // Add new customers
        customers.forEach(customer => {
          realm.create('ZellerCustomer', customer);
        });
      });
    } catch (error) {
      console.error('Error saving customers:', error);
      throw error;
    }
  }

  static async addCustomer(customerInput: ZellerCustomerInput): Promise<ZellerCustomer> {
    try {
      const realm = await this.getRealm();
      const newCustomer: ZellerCustomer = {
        id: Date.now().toString(), // Simple ID generation
        name: customerInput.name,
        email: customerInput.email,
        role: customerInput.role as 'Admin' | 'Manager',
      };
      
      realm.write(() => {
        realm.create('ZellerCustomer', newCustomer);
      });
      
      return newCustomer;
    } catch (error) {
      throw error;
    }
  }

  static async updateCustomer(id: string, updates: Partial<ZellerCustomerInput>): Promise<ZellerCustomer> {
    try {
      const realm = await this.getRealm();
      const customer = realm.objectForPrimaryKey<ZellerCustomer>('ZellerCustomer', id);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      let updatedCustomer: ZellerCustomer;
      realm.write(() => {
        Object.keys(updates).forEach(key => {
          if (updates[key as keyof ZellerCustomerInput] !== undefined) {
            (customer as any)[key] = updates[key as keyof ZellerCustomerInput];
          }
        });
      });
      
      // Return a plain JavaScript object to avoid Realm object invalidation
      updatedCustomer = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
      };
      return updatedCustomer;
    } catch (error) {
      throw error;
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      const realm = await this.getRealm();
      const customer = realm.objectForPrimaryKey('ZellerCustomer', id);
      
      if (customer) {
        realm.write(() => {
          realm.delete(customer);
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async clearCustomers(): Promise<void> {
    try {
      const realm = await this.getRealm();
      realm.write(() => {
        const customers = realm.objects('ZellerCustomer');
        realm.delete(customers);
      });
    } catch (error) {
      throw error;
    }
  }

  static async closeRealm(): Promise<void> {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}
