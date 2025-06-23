export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>
}

export async function savePageAccessSettings(settings: PageAccessSettings): Promise<void> {
  try {
    const response = await fetch('/api/page-access', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error('Failed to save page access settings')
    }
  } catch (error) {
    console.error('Error saving page access settings:', error)
    throw error
  }
}

export async function getPageAccessSettings(): Promise<PageAccessSettings> {
  try {
    const response = await fetch('/api/page-access')
    
    if (!response.ok) {
      throw new Error('Failed to get page access settings')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting page access settings:', error)
    throw error
  }
}

interface PageAccess {
  id: string
  title: string
  path: string
}

interface PageAccessResponse {
  pageAccessByRole: Record<string, string[]>
  availablePages: PageAccess[]
}

const defaultPageAccess: Record<string, string[]> = {
  'AdvantageOneOfficer': [
    'dashboard', 
    'action-calendar',
    'profile',
    // Operations pages
    'incident-report',
    'patrol-log',
    'holiday-requests',
    'safe-duress-words',
    'officer-support',
    'officer-expenses',
    // Employee pages
    'uniform-equipment',
    'diary',
    // Recruitment pages - if take-test is enabled, test-session should be too
    'take-test',
    'test-session'
  ],
  'AdvantageOneHOOfficer': [
    'dashboard', 
    'action-calendar',
    'profile',
    // Administration pages
    'user-setup',
    'employee-registration',
    'customer-setup',
    'stock-control',
    // Operations pages
    'incident-report',
    'mystery-shopper',
    'site-visit',
    'holiday-requests',
    'bank-holiday',
    'customer-satisfaction',
    'patrol-log',
    'safe-duress-words',
    'officer-support',
    'officer-expenses',
    // Employee pages
    'uniform-equipment',
    'disciplinary',
    'diary',
    // Management pages
    'customer-reporting',
    'manager-support',
    'incidents-report',
    'officer-performance',
    // Compliance pages
    'contract-renewal',
    'password-register',
    'asset-register',
    // Recruitment pages
    'vetting',
    'cbt',
    'take-test',
    'test-session',
    // CRM pages
    'crm-dashboard',
    'crm-contacts',
    'crm-leads',
    'crm-deals',
    'crm-pipeline',
    'crm-tasks'
  ],
  'Administrator': [
    'dashboard',
    'action-calendar',
    'profile',
    'settings',
    'user-setup',
    'employee-registration',
    'customer-setup',
    'stock-control',
    'incident-report',
    'mystery-shopper',
    'site-visit',
    'holiday-requests',
    'bank-holiday',
    'customer-satisfaction',
    'patrol-log',
    'safe-duress-words',
    'officer-support',
    'officer-expenses',
    'uniform-equipment',
    'disciplinary',
    'diary',
    'customer-reporting',
    'manager-support',
    'incidents-report',
    'officer-performance',
    'contract-renewal',
    'password-register',
    'asset-register',
    'vetting',
    'cbt',
    'take-test',
    'test-session',
    'customer-views-config',
    // CRM pages
    'crm-dashboard',
    'crm-contacts',
    'crm-leads',
    'crm-deals',
    'crm-pipeline',
    'crm-tasks'
  ],
  'CustomerSiteManager': [
    'dashboard', 
    'action-calendar',
    'profile',
    // Customer pages
    'customer-reporting',
    'daily-activity-report',
    'incident-graph',
    'customer-incident-report',
    'satisfaction-reports',
    'be-safe-be-secure-graph',
    'customer-officer-support'
  ],
  'CustomerHOManager': [
    'dashboard',
    'profile',
    // Customer pages
    'customer-reporting',
    'daily-activity-report',
    'incident-graph',
    'customer-incident-report',
    'satisfaction-reports',
    'be-safe-be-secure-graph',
    'customer-officer-support',
    'customer-views-config'
  ]
}

export { defaultPageAccess }

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
  { id: 'safe-duress-words', title: 'Safe & Duress Words', path: '/operations/safe-duress-words' },
  { id: 'officer-support', title: 'Officer Support', path: '/operations/officer-support' },
  { id: 'officer-expenses', title: 'Officer Expenses', path: '/operations/officer-expenses' },

  // Management
  { id: 'customer-reporting', title: 'Customer Reporting', path: '/management/customer-reporting' },
  { id: 'manager-support', title: 'Manager Support', path: '/management/manager-support' },
  { id: 'incidents-report', title: 'Incidents Report', path: '/management/incidents-report' },
  { id: 'officer-performance', title: 'Officer Performance', path: '/management/officer-performance' },

  // Customer
  { id: 'customer-reporting', title: 'Customer Reporting', path: '/customer/reporting' },
  { id: 'daily-activity-report', title: 'Daily Activity Report', path: '/customer/daily-activity-report' },
  { id: 'incident-graph', title: 'Incident Graph', path: '/customer/incident-graph' },
  { id: 'customer-incident-report', title: 'Incident Report', path: '/customer/incident-report' },
  { id: 'satisfaction-reports', title: 'Satisfaction Reports', path: '/customer/satisfaction-report' },
  { id: 'be-safe-be-secure-graph', title: 'Be Safe Be Secure Graph', path: '/customer/be-safe-be-secure' },
  { id: 'customer-officer-support', title: 'Officer Support', path: '/customer/officer-support' },
  { id: 'customer-views-config', title: 'Views Configuration', path: '/customer/views-config' },
  { id: 'mystery-shopper', title: 'Mystery Shopper', path: '/operations/mystery-shopper' },
  { id: 'site-visit', title: 'Site Visit', path: '/operations/site-visit' },
  { id: 'holiday-requests', title: 'Holiday Requests', path: '/operations/holiday-requests' },
  { id: 'bank-holiday', title: 'Bank Holiday', path: '/operations/bank-holiday' },
  { id: 'customer-satisfaction', title: 'Customer Satisfaction', path: '/operations/customer-satisfaction' },
  { id: 'patrol-log', title: 'Patrol Log', path: '/operations/patrol-log' },
  { id: 'safe-duress-words', title: 'Safe/Duress Words', path: '/operations/safe-duress-words' },
  { id: 'officer-support', title: 'Officer Support', path: '/operations/officer-support' },
  { id: 'officer-expenses', title: 'Officer Expenses', path: '/operations/officer-expenses' },
  
  // Employee
  { id: 'uniform-equipment', title: 'Uniform & Equipment', path: '/employee/uniform-equipment' },
  { id: 'disciplinary', title: 'Disciplinary', path: '/employee/disciplinary' },
  { id: 'diary', title: 'Diary', path: '/employee/diary' },
  
  // CRM
  { id: 'crm-dashboard', title: 'CRM Dashboard', path: '/crm/dashboard' },
  { id: 'crm-contacts', title: 'Contacts', path: '/crm/contacts' },
  { id: 'crm-leads', title: 'Leads', path: '/crm/leads' },
  { id: 'crm-deals', title: 'Deals', path: '/crm/deals' },
  { id: 'crm-pipeline', title: 'Pipeline', path: '/crm/pipeline' },
  { id: 'crm-tasks', title: 'Tasks', path: '/crm/tasks' },
  
  // Customer
  { id: 'customer-reporting', title: 'Customer Reporting', path: '/customer/reporting' },
  { id: 'daily-activity-report', title: 'Daily Activity Report', path: '/customer/dar' },
  { id: 'incident-graph', title: 'Incident Graph', path: '/customer/incident-graph' },
  { id: 'customer-incident-report', title: 'Customer Incident Report', path: '/customer/incident-report' },
  { id: 'satisfaction-reports', title: 'Satisfaction Reports', path: '/customer/satisfaction-reports' },
  { id: 'be-safe-be-secure-graph', title: 'Be Safe Be Secure Graph', path: '/customer/be-safe-be-secure-graph' },
  { id: 'customer-officer-support', title: 'Customer Officer Support', path: '/customer/officer-support' },
  { id: 'customer-views-config', title: 'Customer Views Config', path: '/customer/views-config' },
  
  // Compliance
  { id: 'contract-renewal', title: 'Contract Renewal', path: '/compliance/contract-renewal' },
  { id: 'password-register', title: 'Password Register', path: '/compliance/password-register' },
  { id: 'asset-register', title: 'Asset Register', path: '/compliance/asset-register' },
  
  // Recruitment
  { id: 'vetting', title: 'Vetting', path: '/recruitment/vetting' },
  { id: 'cbt', title: 'CBT', path: '/recruitment/cbt' },
  { id: 'take-test', title: 'Take Test', path: '/recruitment/take-test' },
  { id: 'test-session', title: 'Test Session', path: '/recruitment/test-session' }
]

export async function getPageAccess(): Promise<PageAccessResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    pageAccessByRole: defaultPageAccess,
    availablePages
  }
} 