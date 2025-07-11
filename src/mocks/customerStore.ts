import { CustomerWithRelations as Customer } from '@/types/customer';

interface CustomerStoreData {
  customers: Customer[];
  lastUpdated: number;
  version: number;
}

// In-memory store
let dataStore: CustomerStoreData | null = null;
let initPromise: Promise<CustomerStoreData> | null = null;

// Debug logging with timestamps
const log = {
  info: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} 📝 [Customer Store] ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`${new Date().toISOString()} ⚠️ [Customer Store] ${message}`, data ? data : '');
  },
  error: (message: string, data?: any) => {
    console.error(`${new Date().toISOString()} ❌ [Customer Store] ${message}`, data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} ✅ [Customer Store] ${message}`, data ? data : '');
  }
};

// Initialize store from db.json
const initializeStore = async (): Promise<CustomerStoreData> => {
  if (initPromise) {
    log.info('Waiting for existing initialization...');
    return initPromise;
  }
  
  initPromise = (async () => {
    if (dataStore !== null) {
      log.info('Store already initialized');
      return dataStore;
    }
    
    try {
      // Try localStorage first
      const stored = localStorage.getItem('msw_customer_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1) { // Version check
          dataStore = parsed;
          log.success('Loaded from localStorage', { customers: dataStore.customers.length });
          return dataStore;
        }
      }
      
      // Load from db.json if localStorage is empty or outdated
      const response = await fetch('/db.json');
      const data = await response.json();
      
      dataStore = {
        customers: data.customerDetails || [],
        lastUpdated: Date.now(),
        version: 1 // Store version for future migrations
      };
      
      // Save to localStorage
      localStorage.setItem('msw_customer_store', JSON.stringify(dataStore));
      log.success('Initialized with data from db.json', { customers: dataStore.customers.length });
      
      return dataStore;
    } catch (error) {
      log.error('Failed to initialize:', error);
      throw error;
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
};

// Save store to localStorage with debouncing
let saveTimeout: NodeJS.Timeout | null = null;
const persistStore = () => {
  if (!dataStore) return;
  
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    try {
      dataStore!.lastUpdated = Date.now();
      localStorage.setItem('msw_customer_store', JSON.stringify(dataStore));
      log.success('Persisted to localStorage', { 
        customers: dataStore!.customers.length,
        lastUpdated: new Date(dataStore!.lastUpdated).toISOString()
      });
    } catch (error) {
      log.error('Failed to persist:', error);
    }
  }, 100); // Debounce saves
};

// Load store from localStorage or initialize
export const getStore = async () => {
  return initializeStore();
};

// Clear store (for testing)
export const clearStore = () => {
  dataStore = null;
  localStorage.removeItem('msw_customer_store');
  log.info('Cleared store');
};

// Customer operations with enhanced error handling and logging
export const customerOperations = {
  getAll: async () => {
    const store = await getStore();
    log.info('Retrieved all customers', { count: store.customers.length });
    return store.customers;
  },
  
  getById: async (id: number) => {
    const store = await getStore();
    const customer = store.customers.find(c => c.id === id);
    log.info(`Retrieved customer ${id}`, { found: !!customer });
    return customer;
  },
  
  update: async (id: number, updates: Partial<Customer>) => {
    const store = await getStore();
    const index = store.customers.findIndex(c => c.id === id);
    
    if (index === -1) {
      log.warn(`Customer ${id} not found for update`);
      return null;
    }
    
    const oldData = { ...store.customers[index] };
    store.customers[index] = { ...store.customers[index], ...updates };
    
    log.info(`Updated customer ${id}`, {
      changes: Object.keys(updates),
      before: {
        name: oldData.companyName,
        pageAssignments: oldData.pageAssignments
      },
      after: {
        name: store.customers[index].companyName,
        pageAssignments: store.customers[index].pageAssignments
      }
    });
    
    persistStore();
    return store.customers[index];
  },
  
  create: async (customer: Customer) => {
    const store = await getStore();
    store.customers.push(customer);
    persistStore();
    log.success('Created new customer', { id: customer.id, name: customer.companyName });
    return customer;
  },
  
  delete: async (id: number) => {
    const store = await getStore();
    const initialLength = store.customers.length;
    store.customers = store.customers.filter(c => c.id !== id);
    
    if (store.customers.length === initialLength) {
      log.warn(`Customer ${id} not found for deletion`);
      return;
    }
    
    persistStore();
    log.success(`Deleted customer ${id}`);
  }
};

// Make debug functions available globally
(window as any).customerDebug = {
  clearStore,
  getStore,
  log
}; 