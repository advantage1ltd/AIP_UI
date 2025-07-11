import { http, HttpResponse } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { siteVisitHandlers } from './siteVisitHandlers'
import { safeDuressWordsHandlers } from './safeDuressWordsHandlers'
import { holidayRequestHandlers } from './holidayRequestHandlers'
import { customerSatisfactionHandlers } from './customerSatisfactionHandlers'
import { bankHolidayHandlers } from './bankHolidayHandlers'
import { customerHandlers } from './customerHandlers'
import { regionsHandlers } from './regionsHandlers'
import { sitesHandlers } from './sitesHandlers'
import { incidentHandlers } from './incidentHandlers'
import { userHandlers } from './userHandlers'
import { settingsHandlers } from './settingsHandlers'
import { headerHandlers } from './headerHandlers'
import { dashboardHandlers } from './dashboardHandlers'
import { mysteryShopperHandlers } from './mysteryShopperHandlers'
import { dailyActivityHandlers } from './dailyActivityHandlers'
import { dailyActivityAnalyticsHandlers } from './dailyActivityAnalyticsHandlers'
import { User, CustomerUser, AdvantageOneUser } from '@/types/user'
import { employeeDiaryHandlers } from './employeeDiaryHandlers'

export const handlers = [
  ...customerHandlers,
  ...userHandlers,
  ...headerHandlers,
  ...dashboardHandlers,
  ...siteVisitHandlers,
  ...safeDuressWordsHandlers,
  ...holidayRequestHandlers,
  ...customerSatisfactionHandlers,
  ...bankHolidayHandlers,
  ...regionsHandlers,
  ...sitesHandlers,
  ...incidentHandlers,
  ...mysteryShopperHandlers,
  ...dailyActivityHandlers,
  ...dailyActivityAnalyticsHandlers,
  ...settingsHandlers,
  ...employeeDiaryHandlers
]

// MSW Data Store with Enhanced Synchronization

interface StoreData {
  users: (CustomerUser | AdvantageOneUser)[];
  lastUpdated: number;
  version: number;
}

// In-memory store
let dataStore: StoreData | null = null;
let initPromise: Promise<StoreData> | null = null;

// Debug logging with timestamps
const log = {
  info: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} 📝 [MSW Store] ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`${new Date().toISOString()} ⚠️ [MSW Store] ${message}`, data ? data : '');
  },
  error: (message: string, data?: any) => {
    console.error(`${new Date().toISOString()} ❌ [MSW Store] ${message}`, data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} ✅ [MSW Store] ${message}`, data ? data : '');
  }
};

// Initialize store from db.json
const initializeStore = async (): Promise<StoreData> => {
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
      const stored = localStorage.getItem('msw_data_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 2) { // Version check
          dataStore = parsed;
          log.success('Loaded from localStorage', { users: dataStore.users.length });
          return dataStore;
        }
      }
      
      // Load from db.json if localStorage is empty or outdated
      const response = await fetch('/db.json');
      const data = await response.json();
      
      // Convert raw users to proper types
      const typedUsers = data.users.map((user: any) => {
        const isCustomerRole = user.role === 'CustomerSiteManager' || user.role === 'CustomerHOManager';
        if (isCustomerRole) {
          return user as CustomerUser;
        } else {
          return user as AdvantageOneUser;
        }
      });
      
      dataStore = {
        users: typedUsers,
        lastUpdated: Date.now(),
        version: 2 // Store version for future migrations
      };
      
      // Save to localStorage
      localStorage.setItem('msw_data_store', JSON.stringify(dataStore));
      log.success('Initialized with data from db.json', { users: dataStore.users.length });
      
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
      localStorage.setItem('msw_data_store', JSON.stringify(dataStore));
      log.success('Persisted to localStorage', { 
        users: dataStore!.users.length,
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
  localStorage.removeItem('msw_data_store');
  log.info('Cleared store');
};

// User operations with enhanced error handling and logging
export const userOperations = {
  getAll: async () => {
    const store = await getStore();
    log.info('Retrieved all users', { count: store.users.length });
    return store.users;
  },
  
  getById: async (id: string) => {
    const store = await getStore();
    const user = store.users.find(u => u.id === id);
    log.info(`Retrieved user ${id}`, { found: !!user });
    return user;
  },
  
  update: async (id: string, updates: Partial<CustomerUser | AdvantageOneUser>) => {
    const store = await getStore();
    const index = store.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      log.warn(`User ${id} not found for update`);
      return null;
    }
    
    const oldData = { ...store.users[index] };
    const isCustomerRole = updates.role === 'CustomerSiteManager' || updates.role === 'CustomerHOManager';
    
    // Ensure type safety when updating
    if (isCustomerRole) {
      store.users[index] = { ...store.users[index], ...updates } as CustomerUser;
    } else {
      store.users[index] = { ...store.users[index], ...updates } as AdvantageOneUser;
    }
    
    // Check if customer assignments were updated
    const assignmentUpdated = 'assignedCustomerIds' in updates && 
      JSON.stringify(updates.assignedCustomerIds) !== JSON.stringify(
        'assignedCustomerIds' in oldData ? oldData.assignedCustomerIds : []
      );
    
    log.info(`Updated user ${id}`, {
      changes: Object.keys(updates),
      assignmentUpdated,
      before: {
        role: oldData.role,
        assignedCustomerIds: 'assignedCustomerIds' in oldData ? oldData.assignedCustomerIds : 'N/A'
      },
      after: {
        role: store.users[index].role,
        assignedCustomerIds: 'assignedCustomerIds' in store.users[index] ? (store.users[index] as AdvantageOneUser).assignedCustomerIds : 'N/A'
      }
    });
    
    persistStore();
    
    // Dispatch custom event when customer assignments are updated
    if (assignmentUpdated) {
      const event = new CustomEvent('user-assignments-updated', {
        detail: {
          userId: id,
          user: store.users[index],
          oldAssignments: 'assignedCustomerIds' in oldData ? oldData.assignedCustomerIds : [],
          newAssignments: 'assignedCustomerIds' in store.users[index] ? (store.users[index] as AdvantageOneUser).assignedCustomerIds : []
        }
      });
      window.dispatchEvent(event);
      log.success(`Dispatched user-assignments-updated event for user ${id}`);
    }
    
    return store.users[index];
  },
  
  create: async (user: CustomerUser | AdvantageOneUser) => {
    const store = await getStore();
    store.users.push(user);
    persistStore();
    log.success('Created new user', { id: user.id, role: user.role });
    return user;
  },
  
  delete: async (id: string) => {
    const store = await getStore();
    const initialLength = store.users.length;
    store.users = store.users.filter(u => u.id !== id);
    
    if (store.users.length === initialLength) {
      log.warn(`User ${id} not found for deletion`);
      return;
    }
    
    persistStore();
    log.success(`Deleted user ${id}`);
  }
};

// Make debug functions available globally
(window as any).mswDebug = {
  clearStore,
  getStore,
  log
};