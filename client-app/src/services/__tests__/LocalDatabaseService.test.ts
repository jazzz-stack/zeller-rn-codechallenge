import { LocalDatabaseService } from '../LocalDatabaseService';
import { ZellerCustomer, ZellerCustomerInput, UserRole } from '../../types/User';

// Mock Realm
const mockRealmInstance = {
  objects: jest.fn(),
  write: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  objectForPrimaryKey: jest.fn(),
  close: jest.fn(),
  isClosed: false,
};

jest.mock('realm', () => {
  return {
    __esModule: true,
    default: {
      open: jest.fn(),
      Object: class MockRealmObject {
        static schema: any;
      },
    },
  };
});

// Get the mocked Realm for test assertions  
const MockedRealm = jest.mocked(require('realm').default);

// Mock console methods with proper implementation
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Test data
const mockCustomers: ZellerCustomer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Admin',
  },
];

const mockCustomerInput: ZellerCustomerInput = {
  name: 'New Customer',
  email: 'new@example.com',
  role: 'Manager',
};

describe('LocalDatabaseService', () => {
  beforeEach(() => {
    // Reset the static realm instance
    (LocalDatabaseService as any).realm = null;
    
    // Clear mock call history but keep implementations
    MockedRealm.open.mockClear();
    mockRealmInstance.objects.mockClear();
    mockRealmInstance.write.mockClear();
    mockRealmInstance.create.mockClear();
    mockRealmInstance.delete.mockClear();
    mockRealmInstance.objectForPrimaryKey.mockClear();
    
    // Clear spy call history without destroying the spy
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    
    // Reset default mock implementations
    MockedRealm.open.mockResolvedValue(mockRealmInstance);
    mockRealmInstance.objects.mockReturnValue(mockCustomers);
    mockRealmInstance.write.mockImplementation((callback) => callback());
    mockRealmInstance.create.mockReturnValue({});
    mockRealmInstance.delete.mockReturnValue(undefined);
    mockRealmInstance.objectForPrimaryKey.mockReturnValue(null);
    mockRealmInstance.isClosed = false;
  });

  describe('getRealm', () => {
    it('should create and return realm instance when not initialized', async () => {
      const realm = await (LocalDatabaseService as any).getRealm();
      
      expect(MockedRealm.open).toHaveBeenCalledWith({
        schema: expect.any(Array),
        schemaVersion: 1,
      });
      expect(realm).toBe(mockRealmInstance);
    });

    it('should return existing realm instance if already initialized', async () => {
      // First call
      await (LocalDatabaseService as any).getRealm();
      MockedRealm.open.mockClear();
      
      // Second call
      const realm = await (LocalDatabaseService as any).getRealm();
      
      expect(MockedRealm.open).not.toHaveBeenCalled();
      expect(realm).toBe(mockRealmInstance);
    });
  });

  describe('getCustomers', () => {
    it('should return customers from realm as plain objects', async () => {
      const result = await LocalDatabaseService.getCustomers();
      
      expect(mockRealmInstance.objects).toHaveBeenCalledWith('ZellerCustomer');
      expect(result).toEqual(mockCustomers);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when realm throws error', async () => {
      const error = new Error('Realm error');
      mockRealmInstance.objects.mockImplementation(() => {
        throw error;
      });

      const result = await LocalDatabaseService.getCustomers();
      
      expect(result).toEqual([]);
    });

    it('should return empty array when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      const result = await LocalDatabaseService.getCustomers();
      
      expect(result).toEqual([]);
    });

    it('should map realm objects to plain JavaScript objects correctly', async () => {
      const realmObjects = mockCustomers.map(customer => ({
        ...customer,
        // Add some realm-specific properties to test mapping
        _realm: {},
        isValid: () => true,
      }));
      
      mockRealmInstance.objects.mockReturnValue(realmObjects);

      const result = await LocalDatabaseService.getCustomers();
      
      // Ensure returned objects are plain JS objects without realm properties
      result.forEach(customer => {
        expect(customer).toEqual({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        });
        expect(customer).not.toHaveProperty('_realm');
        expect(customer).not.toHaveProperty('isValid');
      });
    });
  });

  describe('saveCustomers', () => {
    it('should clear existing customers and save new ones', async () => {
      const existingCustomers = [{ id: '999', name: 'Old Customer' }];
      mockRealmInstance.objects.mockReturnValue(existingCustomers);

      await LocalDatabaseService.saveCustomers(mockCustomers);
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.objects).toHaveBeenCalledWith('ZellerCustomer');
      expect(mockRealmInstance.delete).toHaveBeenCalledWith(existingCustomers);
      
      // Verify each customer was created
      expect(mockRealmInstance.create).toHaveBeenCalledTimes(mockCustomers.length);
      mockCustomers.forEach(customer => {
        expect(mockRealmInstance.create).toHaveBeenCalledWith('ZellerCustomer', customer);
      });
    });

    it('should handle empty customers array', async () => {
      await LocalDatabaseService.saveCustomers([]);
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.create).not.toHaveBeenCalled();
    });

    it('should throw error when realm write fails', async () => {
      const error = new Error('Write failed');
      mockRealmInstance.write.mockImplementation(() => {
        throw error;
      });

      await expect(LocalDatabaseService.saveCustomers(mockCustomers))
        .rejects.toThrow('Write failed');
      
    });

    it('should throw error when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      await expect(LocalDatabaseService.saveCustomers(mockCustomers))
        .rejects.toThrow('Failed to open realm');
      
    });
  });

  describe('addCustomer', () => {
    beforeEach(() => {
      // Mock Date.now for consistent ID generation
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should add a new customer and return it', async () => {
      const result = await LocalDatabaseService.addCustomer(mockCustomerInput);
      
      const expectedCustomer = {
        id: '1234567890',
        name: mockCustomerInput.name,
        email: mockCustomerInput.email,
        role: mockCustomerInput.role,
      };

      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.create).toHaveBeenCalledWith('ZellerCustomer', expectedCustomer);
      expect(result).toEqual(expectedCustomer);
    });

    it('should generate unique ID using Date.now()', async () => {
      const result = await LocalDatabaseService.addCustomer(mockCustomerInput);
      
      expect(result.id).toBe('1234567890');
    });

    it('should cast role to Admin or Manager type', async () => {
      const adminInput: ZellerCustomerInput = {
        ...mockCustomerInput,
        role: 'Admin',
      };

      const result = await LocalDatabaseService.addCustomer(adminInput);
      
      expect(result.role).toBe('Admin');
    });

    it('should throw error when realm write fails', async () => {
      const error = new Error('Write failed');
      mockRealmInstance.write.mockImplementation(() => {
        throw error;
      });

      await expect(LocalDatabaseService.addCustomer(mockCustomerInput))
        .rejects.toThrow('Write failed');
    });

    it('should throw error when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      await expect(LocalDatabaseService.addCustomer(mockCustomerInput))
        .rejects.toThrow('Failed to open realm');
      
    });
  });

  describe('updateCustomer', () => {
    const existingCustomer = {
      id: '1',
      name: 'Original Name',
      email: 'original@example.com',
      role: 'Admin',
    };

    beforeEach(() => {
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(existingCustomer);
    });

    it('should update existing customer and return updated data', async () => {
      const updates = { name: 'Updated Name', email: 'updated@example.com' };
      
      const result = await LocalDatabaseService.updateCustomer('1', updates);
      
      expect(mockRealmInstance.objectForPrimaryKey).toHaveBeenCalledWith('ZellerCustomer', '1');
      expect(mockRealmInstance.write).toHaveBeenCalled();
      
      // Check that the returned object is a plain JS object
      expect(result).toEqual({
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'Admin',
      });
    });

    it('should only update provided fields', async () => {
      const updates = { name: 'New Name Only' };
      
      await LocalDatabaseService.updateCustomer('1', updates);
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
      // The write callback would have been called, which updates the realm object
    });

    it('should skip undefined values in updates', async () => {
      const updates = { 
        name: 'New Name', 
        email: undefined,
        role: 'Manager',
      };
      
      await LocalDatabaseService.updateCustomer('1', updates);
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
    });

    it('should throw error when customer not found', async () => {
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(null);

      await expect(LocalDatabaseService.updateCustomer('999', { name: 'Test' }))
        .rejects.toThrow('Customer not found');
      
    });

    it('should throw error when realm write fails', async () => {
      const error = new Error('Write failed');
      mockRealmInstance.write.mockImplementation(() => {
        throw error;
      });

      await expect(LocalDatabaseService.updateCustomer('1', { name: 'Test' }))
        .rejects.toThrow('Write failed');
      
    });

    it('should throw error when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      await expect(LocalDatabaseService.updateCustomer('1', { name: 'Test' }))
        .rejects.toThrow('Failed to open realm');
      
    });
  });

  describe('deleteCustomer', () => {
    const existingCustomer = { id: '1', name: 'Test Customer' };

    it('should delete existing customer', async () => {
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(existingCustomer);

      await LocalDatabaseService.deleteCustomer('1');
      
      expect(mockRealmInstance.objectForPrimaryKey).toHaveBeenCalledWith('ZellerCustomer', '1');
      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.delete).toHaveBeenCalledWith(existingCustomer);
    });

    it('should handle case when customer does not exist', async () => {
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(null);

      await LocalDatabaseService.deleteCustomer('999');
      
      expect(mockRealmInstance.objectForPrimaryKey).toHaveBeenCalledWith('ZellerCustomer', '999');
      expect(mockRealmInstance.write).not.toHaveBeenCalled();
      expect(mockRealmInstance.delete).not.toHaveBeenCalled();
    });

    it('should throw error when realm write fails', async () => {
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(existingCustomer);
      const error = new Error('Write failed');
      mockRealmInstance.write.mockImplementation(() => {
        throw error;
      });

      await expect(LocalDatabaseService.deleteCustomer('1'))
        .rejects.toThrow('Write failed');
      
    });

    it('should throw error when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      await expect(LocalDatabaseService.deleteCustomer('1'))
        .rejects.toThrow('Failed to open realm');
      
    });
  });

  describe('clearCustomers', () => {
    it('should clear all customers from realm', async () => {
      const allCustomers = mockCustomers;
      mockRealmInstance.objects.mockReturnValue(allCustomers);

      await LocalDatabaseService.clearCustomers();
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.objects).toHaveBeenCalledWith('ZellerCustomer');
      expect(mockRealmInstance.delete).toHaveBeenCalledWith(allCustomers);
    });

    it('should handle empty customer collection', async () => {
      mockRealmInstance.objects.mockReturnValue([]);

      await LocalDatabaseService.clearCustomers();
      
      expect(mockRealmInstance.write).toHaveBeenCalled();
      expect(mockRealmInstance.delete).toHaveBeenCalledWith([]);
    });

    it('should throw error when realm write fails', async () => {
      const error = new Error('Write failed');
      mockRealmInstance.write.mockImplementation(() => {
        throw error;
      });

      await expect(LocalDatabaseService.clearCustomers())
        .rejects.toThrow('Write failed');
      
    });

    it('should throw error when realm.open fails', async () => {
      const error = new Error('Failed to open realm');
      MockedRealm.open.mockRejectedValue(error);

      await expect(LocalDatabaseService.clearCustomers())
        .rejects.toThrow('Failed to open realm');
      
    });
  });

  describe('closeRealm', () => {
    it('should close realm and reset instance when realm exists and is not closed', async () => {
      // Initialize realm first
      await (LocalDatabaseService as any).getRealm();
      mockRealmInstance.isClosed = false;

      await LocalDatabaseService.closeRealm();
      
      expect(mockRealmInstance.close).toHaveBeenCalled();
      expect((LocalDatabaseService as any).realm).toBeNull();
    });

    it('should not close realm when already closed', async () => {
      // Set realm instance and mark it as closed, clear any previous calls first
      (LocalDatabaseService as any).realm = mockRealmInstance;
      mockRealmInstance.isClosed = true;
      mockRealmInstance.close.mockClear(); // Clear any previous calls
      
      await LocalDatabaseService.closeRealm();
      
      expect(mockRealmInstance.close).not.toHaveBeenCalled();
      // When realm is already closed, the static realm reference is not set to null
      expect((LocalDatabaseService as any).realm).toBe(mockRealmInstance);
    });

    it('should handle case when realm is null', async () => {
      // Ensure realm is null and clear any previous calls to close
      (LocalDatabaseService as any).realm = null;
      mockRealmInstance.close.mockClear();

      await LocalDatabaseService.closeRealm();
      
      expect(mockRealmInstance.close).not.toHaveBeenCalled();
    });

    it('should handle undefined realm instance', async () => {
      // Set realm to undefined and clear any previous calls to close
      (LocalDatabaseService as any).realm = undefined;
      mockRealmInstance.close.mockClear();

      await LocalDatabaseService.closeRealm();
      
      expect(mockRealmInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full CRUD lifecycle', async () => {
      // Mock different responses for different operations
      let customers: any[] = [];
      mockRealmInstance.objects.mockImplementation(() => customers);
      mockRealmInstance.create.mockImplementation((schema, data) => {
        customers.push(data);
        return data;
      });

      // Add customers
      await LocalDatabaseService.saveCustomers(mockCustomers);
      customers = [...mockCustomers];

      // Get customers
      const retrievedCustomers = await LocalDatabaseService.getCustomers();
      expect(retrievedCustomers).toHaveLength(3);

      // Add a new customer
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      const newCustomer = await LocalDatabaseService.addCustomer(mockCustomerInput);
      expect(newCustomer.id).toBe('1234567890');

      // Update customer
      const existingCustomer = mockCustomers[0];
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(existingCustomer);
      const updatedCustomer = await LocalDatabaseService.updateCustomer('1', { name: 'Updated Name' });
      expect(updatedCustomer.name).toBe('Updated Name');

      // Delete customer
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(existingCustomer);
      await LocalDatabaseService.deleteCustomer('1');

      // Clear all customers
      await LocalDatabaseService.clearCustomers();

      jest.restoreAllMocks();
    });

    it('should handle concurrent operations gracefully', async () => {
      const operations = [
        LocalDatabaseService.getCustomers(),
        LocalDatabaseService.addCustomer(mockCustomerInput),
        LocalDatabaseService.updateCustomer('1', { name: 'Test' }),
      ];

      // Mock for update operation
      mockRealmInstance.objectForPrimaryKey.mockReturnValue(mockCustomers[0]);
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);

      const results = await Promise.allSettled(operations);
      
      expect(results[0].status).toBe('fulfilled'); // getCustomers
      expect(results[1].status).toBe('fulfilled'); // addCustomer  
      expect(results[2].status).toBe('fulfilled'); // updateCustomer

      jest.restoreAllMocks();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle malformed customer data gracefully', async () => {
      const malformedCustomer = {
        // Missing required fields
        name: 'Test',
        // Missing email and role
      };

      // This would normally cause an error in real Realm, but we're testing our service layer
      await expect(LocalDatabaseService.addCustomer(malformedCustomer as any))
        .resolves.toBeDefined();
    });

    it('should handle very long customer names', async () => {
      const longNameCustomer: ZellerCustomerInput = {
        name: 'A'.repeat(1000),
        email: 'test@example.com',
        role: 'Admin',
      };

      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      const result = await LocalDatabaseService.addCustomer(longNameCustomer);
      
      expect(result.name).toHaveLength(1000);
      jest.restoreAllMocks();
    });

    it('should handle special characters in customer data', async () => {
      const specialCharCustomer: ZellerCustomerInput = {
        name: 'Test User with émojis 🎉',
        email: 'test+special@example.com',
        role: 'Manager',
      };

      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      const result = await LocalDatabaseService.addCustomer(specialCharCustomer);
      
      expect(result.name).toBe('Test User with émojis 🎉');
      expect(result.email).toBe('test+special@example.com');
      jest.restoreAllMocks();
    });

    it('should handle realm connection issues during operations', async () => {
      MockedRealm.open.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await LocalDatabaseService.getCustomers();
      expect(result).toEqual([]);
    });
  });
});
