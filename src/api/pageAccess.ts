import { CUSTOMER_PAGES } from '@/config/customerPages';
import { api } from '@/config/api';

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
  // Save page access settings to real backend
  saveSettings: async (settings: PageAccessSettings): Promise<void> => {
    try {
      await api.put('/PageAccess/settings', settings);
    } catch (error) {
      console.warn('Backend page access API not available, settings will not be saved');
    }
  },

  // Get page access settings
  getSettings: async (): Promise<PageAccessSettings> => {
    try {
      console.log('🔍 [PageAccess API] Fetching settings from real backend /PageAccess/settings');
      const response = await api.get<{ success: boolean; data: PageAccessSettings }>(
        '/PageAccess/settings'
      );
      if (response.data?.data) {
        console.log('✅ [PageAccess API] Successfully loaded settings from API');
        return response.data.data;
      }
    } catch (error) {
      console.warn('❌ [PageAccess API] Request failed, using default settings:', error);
    }

    // Define available pages first
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
      { id: 'uniform-equipment', title: 'Uniform Equipment', path: '/operations/uniform-equipment' },
      { id: 'disciplinary', title: 'Disciplinary', path: '/operations/disciplinary' },
      { id: 'diary', title: 'Diary', path: '/operations/diary' },
      { id: 'customer-reporting', title: 'Customer Reporting', path: '/operations/customer-reporting' },
      { id: 'manager-support', title: 'Manager Support', path: '/operations/manager-support' },
      { id: 'incidents-report', title: 'Incidents Report', path: '/operations/incidents-report' },
      { id: 'officer-performance', title: 'Officer Performance', path: '/operations/officer-performance' },

      // Compliance
      { id: 'contract-renewal', title: 'Contract Renewal', path: '/compliance/contract-renewal' },
      { id: 'password-register', title: 'Password Register', path: '/compliance/password-register' },
      { id: 'asset-register', title: 'Asset Register', path: '/compliance/asset-register' },
      { id: 'guard-certification', title: 'Guard Certification', path: '/compliance/guard-certification' },

      // Recruitment
      { id: 'vetting', title: 'Vetting', path: '/recruitment/vetting' },
      { id: 'cbt', title: 'CBT', path: '/recruitment/cbt' },
      { id: 'take-test', title: 'Take Test', path: '/recruitment/take-test' },
      { id: 'test-session', title: 'Test Session', path: '/recruitment/test-session' },

      // CRM
      { id: 'crm-dashboard', title: 'CRM Dashboard', path: '/crm/dashboard' },
      { id: 'crm-contacts', title: 'CRM Contacts', path: '/crm/contacts' },
      { id: 'crm-leads', title: 'CRM Leads', path: '/crm/leads' },
      { id: 'crm-deals', title: 'CRM Deals', path: '/crm/deals' },
      { id: 'crm-pipeline', title: 'CRM Pipeline', path: '/crm/pipeline' },
      { id: 'crm-tasks', title: 'CRM Tasks', path: '/crm/tasks' },

      // Customer pages
      ...Object.values(CUSTOMER_PAGES).map(page => ({
        id: page.id,
        title: page.title,
        path: page.path
      }))
    ];

    const defaultPageAccessByRole: Record<string, string[]> = {
      Administrator: availablePages.map(page => page.id),
      AdvantageOneHOOfficer: [
        'dashboard', 'action-calendar', 'profile',
        'user-setup', 'employee-registration', 'customer-setup', 'stock-control',
        'incident-report', 'mystery-shopper', 'site-visit', 'holiday-requests',
        'bank-holiday', 'customer-satisfaction', 'patrol-log', 'safe-duress-words',
        'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
        'diary', 'customer-reporting', 'manager-support', 'incidents-report',
        'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
        'vetting', 'cbt', 'take-test', 'test-session', 'crm-dashboard', 'crm-contacts',
        'crm-leads', 'crm-deals', 'crm-pipeline', 'crm-tasks'
      ],
      AdvantageOneOfficer: [
        'dashboard', 'action-calendar', 'profile',
        'incident-report', 'mystery-shopper', 'site-visit', 'holiday-requests',
        'bank-holiday', 'customer-satisfaction', 'patrol-log', 'safe-duress-words',
        'officer-support', 'officer-expenses', 'uniform-equipment', 'disciplinary',
        'diary', 'customer-reporting', 'manager-support', 'incidents-report',
        'officer-performance', 'contract-renewal', 'password-register', 'asset-register',
        'vetting', 'cbt', 'take-test', 'test-session', 'crm-dashboard', 'crm-contacts',
        'crm-leads', 'crm-deals', 'crm-pipeline', 'crm-tasks'
      ],
      CustomerHOManager: [
        'dashboard', 'action-calendar', 'profile',
        'customer-reporting', 'customer-views-config', 'customer-incident-report',
        'customer-satisfaction-report', 'customer-be-safe-be-secure',
        'customer-daily-activity-report', 'customer-incident-graph',
        'customer-officer-support', 'customer-reporting'
      ],
      CustomerSiteManager: [
        'dashboard', 'action-calendar', 'profile',
        'customer-reporting', 'customer-views-config', 'customer-incident-report',
        'customer-satisfaction-report', 'customer-be-safe-be-secure',
        'customer-daily-activity-report', 'customer-incident-graph',
        'customer-officer-support', 'customer-reporting'
      ]
    };

    console.log('📋 Using default page access settings');
    console.log('🔑 Available roles:', Object.keys(defaultPageAccessByRole));
    console.log('📄 Administrator pages:', defaultPageAccessByRole.Administrator?.length || 0);

    return {
      pageAccessByRole: defaultPageAccessByRole,
      availablePages: availablePages
    };
  }
};

interface PageAccessResponse {
  pageAccessByRole: Record<string, string[]>
  availablePages: PageAccess[]
}

// Get all customer page IDs
const customerPageIds = Object.values(CUSTOMER_PAGES).map(page => page.id);

export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>;
  availablePages: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

export const hasPageAccess = (userRole: string, pageId: string): boolean => {
  console.warn('hasPageAccess() is deprecated. Use the dynamic settings API instead.');
  return false;
};

export async function getPageAccess(): Promise<PageAccessResponse> {
  console.warn('getPageAccess() is deprecated. Use pageAccessApi.getSettings() instead.');
  return pageAccessApi.getSettings();
} 