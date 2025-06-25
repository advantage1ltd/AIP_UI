import { CUSTOMER_PAGES } from '@/config/customerPages';

export interface PageAccess {
  id: string;
  title: string;
  path: string;
}

export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>;
  availablePages: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

export const pageAccessApi = {
  // Save page access settings
  saveSettings: async (settings: PageAccessSettings): Promise<void> => {
    try {
      const response = await fetch('/api/settings/page-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save page access settings');
      }
    } catch (error) {
      console.error('Error saving page access settings:', error);
      throw error;
    }
  },

  // Get page access settings
  getSettings: async (): Promise<PageAccessSettings> => {
    try {
      const response = await fetch('/api/settings/page-access');
      
      if (!response.ok) {
        throw new Error('Failed to get page access settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting page access settings:', error);
      throw error;
    }
  }
};

interface PageAccessResponse {
  pageAccessByRole: Record<string, string[]>
  availablePages: PageAccess[]
}

// Get all customer page IDs
const customerPageIds = Object.values(CUSTOMER_PAGES).map(page => page.id);

export const defaultPageAccess: Record<string, string[]> = {
  'CustomerSiteManager': [
    'dashboard', 
    'profile',
    'settings',
    'customer-daily-activity-report',
    'customer-incident-graph',
    'customer-incident-report',
    'customer-satisfaction-report',
    'customer-be-safe-be-secure',
    'customer-officer-support',
    'customer-reporting',
    'customer-views-config'
  ],
  'CustomerHOManager': [
    'dashboard', 
    'profile',
    'settings',
    'customer-daily-activity-report',
    'customer-incident-graph',
    'customer-incident-report',
    'customer-satisfaction-report',
    'customer-be-safe-be-secure',
    'customer-officer-support',
    'customer-reporting',
    'customer-views-config'
  ],
  'Administrator': ['*'],
  'AdvantageOneOfficer': [
    'dashboard',
    'profile',
    'settings',
    'incident-report',
    'site-visit',
    'patrol-log',
    'officer-support',
    'officer-expenses'
  ],
  'AdvantageOneHOOfficer': [
    'dashboard',
    'profile',
    'settings',
    'incident-report',
    'mystery-shopper',
    'site-visit',
    'holiday-requests',
    'bank-holiday',
    'customer-satisfaction',
    'patrol-log',
    'safe-duress-words',
    'officer-support',
    'officer-expenses'
  ]
};

export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>;
  availablePages: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

// Helper function to check if a user has access to a specific page
export const hasPageAccess = (userRole: string, pageId: string): boolean => {
  if (!userRole) return false;
  
  const roleAccess = defaultPageAccess[userRole];
  if (!roleAccess) return false;
  
  // Administrator has access to everything
  if (userRole === 'Administrator' || roleAccess.includes('*')) return true;
  
  return roleAccess.includes(pageId);
};

const availablePages: PageAccess[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard' },
  { id: 'action-calendar', title: 'Action Calendar', path: '/action-calendar' },
  { id: 'profile', title: 'Profile', path: '/profile' },
  { id: 'settings', title: 'Settings', path: '/settings' },
  
  // Administration
  { id: 'user-setup', title: 'User Setup', path: '/administration/user-setup' },
  { id: 'employee-registration', title: 'Employee Registration', path: '/administration/employee-registration' },
  { id: 'customer-setup', title: 'Customer Setup', path: '/administration/customer-setup' },
  { id: 'stock-control', title: 'Stock Control', path: '/administration/stock-control' },
  
  // Operations
  { id: 'incident-report', title: 'Incident Report', path: '/operations/incident-report' },
  { id: 'mystery-shopper', title: 'Mystery Shopper', path: '/operations/mystery-shopper' },
  { id: 'site-visit', title: 'Site Visit', path: '/operations/site-visit' },
  { id: 'holiday-requests', title: 'Holiday Requests', path: '/operations/holiday-requests' },
  { id: 'bank-holiday', title: 'Bank Holiday', path: '/operations/bank-holiday' },
  { id: 'customer-satisfaction', title: 'Customer Satisfaction', path: '/operations/customer-satisfaction' },
  { id: 'patrol-log', title: 'Patrol Log', path: '/operations/patrol-log' },
  { id: 'safe-duress-words', title: 'Safe Duress Words', path: '/operations/safe-duress-words' },
  { id: 'officer-support', title: 'Officer Support', path: '/operations/officer-support' },
  { id: 'officer-expenses', title: 'Officer Expenses', path: '/operations/officer-expenses' },
  
  // Employee
  { id: 'uniform-equipment', title: 'Uniform & Equipment', path: '/employee/uniform-equipment' },
  { id: 'disciplinary', title: 'Disciplinary', path: '/employee/disciplinary' },
  { id: 'diary', title: 'Diary', path: '/employee/diary' },
  
  // Management
  { id: 'customer-reporting', title: 'Customer Reporting', path: '/management/customer-reporting' },
  { id: 'manager-support', title: 'Manager Support', path: '/management/manager-support' },
  { id: 'incidents-report', title: 'Incidents Report', path: '/management/incidents-report' },
  { id: 'officer-performance', title: 'Officer Performance', path: '/management/officer-performance' },
  
  // Compliance
  { id: 'contract-renewal', title: 'Contract Renewal', path: '/compliance/contract-renewal' },
  { id: 'password-register', title: 'Password Register', path: '/compliance/password-register' },
  { id: 'asset-register', title: 'Asset Register', path: '/compliance/asset-register' },
  
  // Recruitment
  { id: 'vetting', title: 'Vetting', path: '/recruitment/vetting' },
  { id: 'cbt', title: 'CBT', path: '/recruitment/cbt' },
  { id: 'take-test', title: 'Take Test', path: '/recruitment/take-test' },
  { id: 'test-session', title: 'Test Session', path: '/recruitment/test-session/:id' },
  
  // Customer pages
  { id: 'customer-views-config', title: 'Views Configuration', path: '/customer/views-config' },
  { id: 'customer-incident-report', title: 'Incident Report', path: '/customer/incident-report' },
  { id: 'customer-satisfaction-report', title: 'Satisfaction Report', path: '/customer/satisfaction-report' },
  { id: 'customer-be-safe-be-secure', title: 'Be Safe Be Secure', path: '/customer/be-safe-be-secure' },
  { id: 'customer-daily-activity-report', title: 'Daily Activity Report', path: '/customer/daily-activity-report' },
  { id: 'customer-incident-graph', title: 'Incident Graph', path: '/customer/incident-graph' },
  { id: 'customer-officer-support', title: 'Officer Support', path: '/customer/officer-support' },
  { id: 'customer-reporting', title: 'Customer Reporting', path: '/customer/reporting' },
  
  // CRM
  { id: 'crm-dashboard', title: 'CRM Dashboard', path: '/crm/dashboard' },
  { id: 'crm-contacts', title: 'Contacts', path: '/crm/contacts' },
  { id: 'crm-leads', title: 'Leads', path: '/crm/leads' },
  { id: 'crm-deals', title: 'Deals', path: '/crm/deals' },
  { id: 'crm-pipeline', title: 'Pipeline', path: '/crm/pipeline' },
  { id: 'crm-tasks', title: 'Tasks', path: '/crm/tasks' }
];

export async function getPageAccess(): Promise<PageAccessResponse> {
  try {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role;
    console.log('🔑 [PageAccess] User role:', userRole);
    
    if (!userRole) {
      console.warn('⚠️ [PageAccess] No user role found in localStorage');
      return {
        pageAccessByRole: {},
        availablePages: []
      };
    }
    
    // Get page access for the user's role
    const roleAccess = defaultPageAccess[userRole];
    console.log('📝 [PageAccess] Role access:', roleAccess);
    
    if (!roleAccess) {
      console.warn(`⚠️ [PageAccess] No access defined for role: ${userRole}`);
      return {
        pageAccessByRole: {},
        availablePages: []
      };
    }
    
    // Return only the pages that the user has access to
    const accessiblePages = availablePages.filter(page => roleAccess.includes(page.id));
    console.log('📋 [PageAccess] Accessible pages:', accessiblePages);
    
    return {
      pageAccessByRole: { [userRole]: roleAccess },
      availablePages: accessiblePages
      };
  } catch (error) {
    console.error('❌ [PageAccess] Error getting page access:', error);
    throw error;
  }
} 