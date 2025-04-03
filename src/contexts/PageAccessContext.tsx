import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define types
export interface Page {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'reports' | 'management' | 'customer' | 'settings' | 'recruitment';
  path: string;
}

interface PageAccessContextType {
  hasAccess: (path: string) => boolean;
  currentRole: string | null;
  setCurrentRole: (role: string) => void;
  pageAccessByRole: Record<string, string[]>;
  setPageAccessByRole: Dispatch<SetStateAction<Record<string, string[]>>>;
  availablePages: Page[];
  isTestMode: boolean;
  setIsTestMode: (isTestMode: boolean) => void;
  testRole: string | null;
  setTestRole: (role: string | null) => void;
}

// Create context
const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

// Custom hook to use the context
export const usePageAccess = () => {
  const context = useContext(PageAccessContext);
  if (!context) {
    throw new Error('usePageAccess must be used within a PageAccessProvider');
  }
  return context;
};

// Provider component
export const PageAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState<string | null>('administrator');
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [testRole, setTestRole] = useState<string | null>(null);

  // Define available pages - Comprehensive list of all application pages
  const availablePages: Page[] = [];
  
  try {
    // Dashboard pages
    availablePages.push(
      { 
        id: 'dashboard', 
        name: 'Dashboard', 
        description: 'Main overview dashboard',
        category: 'dashboard',
        path: '/dashboard'
      },
      { 
        id: 'action-calendar', 
        name: 'Action Calendar', 
        description: 'Task and action management calendar',
        category: 'management',
        path: '/action-calendar'
      },
      
      // Administration pages
      { 
        id: 'user-setup', 
        name: 'User Setup', 
        description: 'Configure user accounts and permissions',
        category: 'management',
        path: '/administration/user-setup'
      },
      { 
        id: 'employee-registration', 
        name: 'Employee Registration', 
        description: 'Register and manage employee information',
        category: 'management',
        path: '/administration/employee-registration'
      },
      { 
        id: 'customer-setup', 
        name: 'Customer Setup', 
        description: 'Configure customer accounts and sites',
        category: 'management',
        path: '/administration/customer-setup'
      },
      { 
        id: 'stock-control', 
        name: 'Stock Control', 
        description: 'Manage inventory and equipment stock',
        category: 'management',
        path: '/administration/stock-control'
      },
      
      // Operations pages
      {
        id: 'incident-report',
        name: 'Incident Report',
        description: 'Report and manage security incidents',
        category: 'reports',
        path: '/operations/incident-report'
      },
      {
        id: 'mystery-shopper',
        name: 'Mystery Shopper',
        description: 'Mystery shopper evaluations and reports',
        category: 'reports',
        path: '/operations/mystery-shopper'
      },
      {
        id: 'site-visit',
        name: 'Site Visit',
        description: 'Site inspection and visit reports',
        category: 'reports',
        path: '/operations/site-visit'
      },
      {
        id: 'holiday-requests',
        name: 'Holiday Requests',
        description: 'Manage officer holiday and time-off requests',
        category: 'management',
        path: '/operations/holiday-requests'
      },
      {
        id: 'bank-holiday',
        name: 'Bank Holiday',
        description: 'Bank holiday scheduling and management',
        category: 'management',
        path: '/operations/bank-holiday'
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        description: 'Customer satisfaction surveys and feedback',
        category: 'customer',
        path: '/operations/customer-satisfaction'
      },
      {
        id: 'patrol-log',
        name: 'Patrol Log',
        description: 'Officer patrol records and activity logs',
        category: 'reports',
        path: '/operations/patrol-log'
      },
      {
        id: 'safe-duress-words',
        name: 'Safe/Duress Words',
        description: 'Manage security code words and duress signals',
        category: 'management',
        path: '/operations/safe-duress-words'
      },
      {
        id: 'officer-support',
        name: 'Officer Support',
        description: 'Support resources and assistance for officers',
        category: 'customer',
        path: '/operations/officer-support'
      },
      {
        id: 'officer-expenses',
        name: 'Officer Expenses',
        description: 'Track and manage officer expense claims',
        category: 'management',
        path: '/operations/officer-expenses'
      },
      
      // Employee pages
      {
        id: 'uniform-equipment',
        name: 'Uniform & Equipment',
        description: 'Manage officer uniforms and equipment',
        category: 'management',
        path: '/employee/uniform-equipment'
      },
      {
        id: 'disciplinary',
        name: 'Disciplinary',
        description: 'Handle employee disciplinary matters',
        category: 'management',
        path: '/employee/disciplinary'
      },
      {
        id: 'diary',
        name: 'Diary',
        description: 'Employee diary and notes management',
        category: 'management',
        path: '/employee/diary'
      },
      
      // Management pages
      {
        id: 'customer-reporting',
        name: 'Customer Reporting',
        description: 'Generate and manage customer reports',
        category: 'reports',
        path: '/management/customer-reporting'
      },
      {
        id: 'manager-support',
        name: 'Manager Support',
        description: 'Support resources for managers',
        category: 'management',
        path: '/management/manager-support'
      },
      {
        id: 'incidents-report',
        name: 'Incidents Report',
        description: 'Comprehensive incident reporting and analysis',
        category: 'reports',
        path: '/management/incidents-report'
      },
      {
        id: 'officer-performance',
        name: 'Officer Performance',
        description: 'Monitor and evaluate officer performance metrics',
        category: 'management',
        path: '/management/officer-performance'
      },
      
      // Customer pages
      {
        id: 'daily-activity-report',
        name: 'Daily Activity Report',
        description: 'Daily security activity reports',
        category: 'reports',
        path: '/customer/dar'
      },
      {
        id: 'incident-graph',
        name: 'Incident Graph',
        description: 'Visual analytics of security incidents',
        category: 'reports',
        path: '/customer/incident-graph'
      },
      {
        id: 'customer-incident-report',
        name: 'Incident Report',
        description: 'Customer-facing incident reports',
        category: 'reports',
        path: '/customer/incident-report'
      },
      { 
        id: 'satisfaction-reports', 
        name: 'Satisfaction Reports', 
        description: 'Customer satisfaction surveys and feedback',
        category: 'reports',
        path: '/customer/satisfaction-reports'
      },
      {
        id: 'be-safe-be-secure-graph',
        name: 'Be Safe Be Secure Graph',
        description: 'Security awareness and compliance metrics',
        category: 'reports',
        path: '/customer/be-safe-be-secure-graph'
      },
      {
        id: 'customer-officer-support',
        name: 'Officer Support',
        description: 'Customer access to officer support resources',
        category: 'customer',
        path: '/customer/officer-support'
      },
      
      // Profile page
      { 
        id: 'profile', 
        name: 'Profile', 
        description: 'User profile settings',
        category: 'settings',
        path: '/profile'
      },
      
      // Settings page
      { 
        id: 'settings', 
        name: 'Settings', 
        description: 'Application settings and configuration',
        category: 'settings',
        path: '/settings'
      },
      
      // Take Test page
      { 
        id: 'take-test', 
        name: 'Take Test', 
        description: 'Test the application by viewing it as different user roles',
        category: 'recruitment',
        path: '/recruitment/take-test'
      },
      
      // Test Session page
      { 
        id: 'test-session', 
        name: 'Test Session', 
        description: 'Active test taking session',
        category: 'recruitment',
        path: '/recruitment/test-session'
      },

      // CRM pages
      { 
        id: 'crm-dashboard', 
        name: 'CRM Dashboard', 
        description: 'Overview of customer relationship management',
        category: 'dashboard',
        path: '/crm/dashboard'
      },
      { 
        id: 'crm-deals', 
        name: 'Deals', 
        description: 'Manage and track business deals',
        category: 'management',
        path: '/crm/deals'
      },
      { 
        id: 'crm-leads', 
        name: 'Leads', 
        description: 'Track and manage potential leads',
        category: 'management',
        path: '/crm/leads'
      },
      { 
        id: 'crm-pipeline', 
        name: 'Pipeline', 
        description: 'Sales pipeline management',
        category: 'management',
        path: '/crm/pipeline'
      },
      { 
        id: 'crm-tasks', 
        name: 'Tasks', 
        description: 'CRM related tasks and activities',
        category: 'management',
        path: '/crm/tasks'
      },

      // Recruitment pages
      { 
        id: 'recruitment-cbt', 
        name: 'CBT', 
        description: 'Computer Based Training management',
        category: 'management',
        path: '/recruitment/cbt'
      },
      { 
        id: 'recruitment-vetting', 
        name: 'Vetting', 
        description: 'Candidate vetting and background checks',
        category: 'management',
        path: '/recruitment/vetting'
      },

      // Compliance pages
      { 
        id: 'compliance-asset-register', 
        name: 'Asset Register', 
        description: 'Track and manage company assets',
        category: 'management',
        path: '/compliance/asset-register'
      },
      { 
        id: 'compliance-contract-renewal', 
        name: 'Contract Renewal', 
        description: 'Manage contract renewals and deadlines',
        category: 'management',
        path: '/compliance/contract-renewal'
      },
      { 
        id: 'compliance-password-register', 
        name: 'Password Register', 
        description: 'Secure password management system',
        category: 'management',
        path: '/compliance/password-register'
      }
    );
  } catch (error) {
    console.error('Error initializing available pages:', error);
  }

  // Default page access configuration
  const defaultPageAccess: Record<string, string[]> = {
    'advantage-officer': [
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
    'advantage-ho': [
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
      'officer-performance'
    ],
    'administrator': availablePages.map(page => page.id),
    'customer-site': [
      'dashboard', 
      'action-calendar',
      'profile',
      // Customer pages
      'daily-activity-report',
      'incident-graph',
      'customer-incident-report',
      'satisfaction-reports',
      'be-safe-be-secure-graph',
      'customer-officer-support'
    ],
    'customer-ho': [
      'dashboard',
      'profile',
      // Customer pages
      'daily-activity-report',
      'incident-graph',
      'customer-incident-report',
      'satisfaction-reports',
      'be-safe-be-secure-graph',
      'customer-officer-support',
      // Management pages
      'customer-reporting'
    ]
  };

  const [pageAccessByRole, setPageAccessByRole] = useState<Record<string, string[]>>(defaultPageAccess);

  const hasAccess = (path: string): boolean => {
    try {
      // If in test mode, check access based on test role
      const roleToCheck = isTestMode && testRole ? testRole : currentRole;
      
      if (!roleToCheck) return false;
      
      // Always allow access to settings for administrators, even in test mode
      if (roleToCheck === 'administrator' || (currentRole === 'administrator' && path === '/settings')) {
        return true;
      }
      
      // Fix for take-test path - ensure it's properly matched
      const requestedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      
      const allowedPageIds = pageAccessByRole[roleToCheck];
      if (!allowedPageIds) return false;

      // Look for matching page, handle special cases for dynamic routes
      const page = availablePages.find(p => {
        // Handle 'take-test' path aliases
        if (p.id === 'take-test') {
          return requestedPath === '/take-test' || requestedPath === '/recruitment/take-test';
        }
        
        // Handle test-session dynamic routes
        if (p.id === 'test-session' && requestedPath.startsWith('/recruitment/test-session/')) {
          return true;
        }
        
        return p.path === requestedPath;
      });
      
      if (!page) return false;
      
      return allowedPageIds.includes(page.id);
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  // Effect to redirect if user doesn't have access to current page
  useEffect(() => {
    try {
      if (currentRole) {
        const currentPath = window.location.pathname;
        
        // Skip redirect for administrators viewing settings page
        if (currentRole === 'administrator' && currentPath === '/settings') {
          return;
        }
        
        // Always allow access to the home page (index)
        if (currentPath === '/') {
          return;
        }
        
        if (!hasAccess(currentPath)) {
          // Redirect all users to the home page if they don't have access to the current page
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error in redirect effect:', error);
    }
  }, [currentRole, pageAccessByRole, testRole, isTestMode, navigate]);

  // Toggle test mode when URL has ?test=true
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      setIsTestMode(searchParams.get('test') === 'true');
      
      // If test parameter is present, set test role
      const testRoleParam = searchParams.get('role');
      if (testRoleParam && Object.keys(pageAccessByRole).includes(testRoleParam)) {
        setTestRole(testRoleParam);
      }
    } catch (error) {
      console.error('Error setting test mode:', error);
    }
  }, [location, pageAccessByRole]);

  return (
    <PageAccessContext.Provider value={{
      hasAccess,
      currentRole,
      setCurrentRole,
      pageAccessByRole,
      setPageAccessByRole,
      availablePages,
      isTestMode,
      setIsTestMode,
      testRole,
      setTestRole
    }}>
      {children}
    </PageAccessContext.Provider>
  );
}; 