import { http, HttpResponse } from 'msw';
import { PageAccessSettings, defaultPageAccess } from '@/api/pageAccess';
import { BASE_API_URL } from '@/config/api';
import { CUSTOMER_PAGES } from '@/config/customerPages';

// Get available pages from CUSTOMER_PAGES
const customerPages = Object.values(CUSTOMER_PAGES).map(page => ({
  id: page.id,
  title: page.title,
  path: page.path
}));

// Default available pages
const availablePages = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard' },
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
  
  // Customer pages
  ...customerPages
];

// Helper function to save to db.json
const saveToDb = async (settings: PageAccessSettings): Promise<void> => {
  try {
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    
    // Ensure we don't override Administrator's full access
    const adminAccess = settings.pageAccessByRole.Administrator;
    if (!adminAccess || !adminAccess.includes('*')) {
      settings.pageAccessByRole.Administrator = ['*'];
    }
    
    db.pageAccess = settings;
    
    await fetch('/db.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    });
  } catch (error) {
    console.error('Failed to save to db.json:', error);
  }
};

// Helper function to load from db.json
const loadFromDb = async (): Promise<PageAccessSettings> => {
  try {
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    
    if (!db.pageAccess) {
      throw new Error('No page access settings found in db.json');
    }
    
    return db.pageAccess;
  } catch (error) {
    console.error('Failed to load from db.json:', error);
    throw error;
  }
};

// Load database data dynamically
const loadDb = async () => {
  try {
    const response = await fetch('/db.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load database:', error);
    return { settings: {} };
  }
};

// Settings handlers
export const settingsHandlers = [
  // GET /api/settings/page-access
  http.get(`${BASE_API_URL}/settings/page-access`, async () => {
    try {
      // Get user role from localStorage (try both methods)
      const userRole = localStorage.getItem('userRole') || 
                      JSON.parse(localStorage.getItem('user') || '{}').role;
      console.log('🔑 [Settings] User role:', userRole);
      
      if (!userRole) {
        console.warn('⚠️ [Settings] No user role found in localStorage');
        
        // Return default configuration with all roles and pages for fallback
        return HttpResponse.json({
          pageAccessByRole: defaultPageAccess,
          availablePages: availablePages
        });
      }
      
      // Get page access for the user's role
      const roleAccess = defaultPageAccess[userRole];
      console.log('📝 [Settings] Role access:', roleAccess);
      
      if (!roleAccess) {
        console.warn(`⚠️ [Settings] No access defined for role: ${userRole}`);
        return HttpResponse.json({
          pageAccessByRole: {},
          availablePages: []
        });
      }
      
      // Return only the pages that the user has access to
      const accessiblePages = availablePages.filter(page => {
        // Administrator has access to all pages
        if (userRole === 'Administrator' || roleAccess.includes('*')) return true;
        
        // Check if the page ID is in the role's access list
        return roleAccess.includes(page.id);
      });
      
      console.log('📋 [Settings] Accessible pages:', accessiblePages);
      
      return HttpResponse.json({
        pageAccessByRole: defaultPageAccess, // Return all roles for proper role matching
        availablePages: availablePages // Return all pages, filtering will be done in the frontend
      });
    } catch (error) {
      console.error('❌ [Settings] Error getting page access:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/settings/page-access
  http.put(`${BASE_API_URL}/settings/page-access`, async ({ request }) => {
    try {
      const settings = await request.json() as PageAccessSettings;
      console.log('📝 [Settings] Updating page access:', settings);
      
      return HttpResponse.json({
        success: true,
        message: 'Page access settings updated successfully'
      });
    } catch (error) {
      console.error('❌ [Settings] Error updating page access:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 