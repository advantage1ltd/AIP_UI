import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPageAccess } from '@/api/pageAccess';

export interface PageAccess {
  id: string;
  title: string;
  path: string;
}

interface PageAccessContextType {
  hasAccess: (path: string) => boolean;
  currentRole: string | null;
  setCurrentRole: (role: string | null) => void;
  pageAccessByRole: Record<string, string[]>;
  setPageAccessByRole: (access: Record<string, string[]>) => void;
  availablePages: PageAccess[];
  isTestMode: boolean;
  setIsTestMode: (mode: boolean) => void;
  testRole: string | null;
  setTestRole: (role: string | null) => void;
}

const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

export const usePageAccess = () => {
  const context = useContext(PageAccessContext);
  if (!context) {
    throw new Error('usePageAccess must be used within a PageAccessProvider');
  }
  return context;
};

export const PageAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [pageAccessByRole, setPageAccessByRole] = useState<Record<string, string[]>>({});
  const [availablePages, setAvailablePages] = useState<PageAccess[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testRole, setTestRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess = (path: string): boolean => {
    try {
      // If in test mode, check access based on test role
      const roleToCheck = isTestMode && testRole ? testRole : currentRole;
      
      if (!roleToCheck) return false;
      
      // Always allow access to settings for administrators, even in test mode
      if (roleToCheck === 'Administrator' || (currentRole === 'Administrator' && path === '/settings')) {
        return true;
      }
      
      // Get the allowed page IDs for the role
      const allowedPageIds = pageAccessByRole[roleToCheck];
      if (!allowedPageIds) {
        console.warn(`No page access defined for role: ${roleToCheck}`);
        return false;
      }

      // Fix for take-test path - ensure it's properly matched
      const requestedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      
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
        
        // Handle dynamic customer routes
        if (p.path.includes(':customerId') && requestedPath.match(/\/customer\/\d+/)) {
          return true;
        }
        
        return p.path === requestedPath;
      });
      
      if (!page) {
        console.warn(`No page found for path: ${requestedPath}`);
        return false;
      }
      
      const hasAccess = allowedPageIds.includes(page.id);
      console.debug(`Access check for ${roleToCheck} to ${page.id}: ${hasAccess}`);
      return hasAccess;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  // Initialize role from localStorage
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        console.log('🔄 Initializing currentRole from localStorage:', storedRole);
        // Ensure role matches one of our valid roles
        const validRoles = [
          'Administrator',
          'AdvantageOneOfficer',
          'AdvantageOneHOOfficer',
          'CustomerSiteManager',
          'CustomerHOManager'
        ];
        
        if (validRoles.includes(storedRole)) {
          setCurrentRole(storedRole);
        } else {
          console.warn(`Invalid role found in localStorage: ${storedRole}`);
          localStorage.removeItem('userRole');
        }
      }
    } catch (error) {
      console.error('Error initializing role:', error);
    }
  }, []);

  // Fetch page access data
  useEffect(() => {
    const fetchPageAccess = async () => {
      try {
        setIsLoading(true);
        const data = await getPageAccess();
        setPageAccessByRole(data.pageAccessByRole);
        setAvailablePages(data.availablePages);
      } catch (error) {
        console.error('Error fetching page access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageAccess();
  }, []);

  // Update localStorage when role changes
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('userRole', currentRole);
    }
  }, [currentRole]);

  // Effect to redirect if user doesn't have access to current page
  useEffect(() => {
    try {
      if (!currentRole || isLoading) return;

      const currentPath = window.location.pathname;
      
      // Skip redirect for these paths
      const skipPaths = [
        '/login',
        '/dashboard',
        '/',
        '/profile'
      ];
      
      if (skipPaths.includes(currentPath)) {
        return;
      }
      
      // Skip redirect for administrators viewing settings page
      if (currentRole === 'Administrator' && currentPath === '/settings') {
        return;
      }
      
      if (!hasAccess(currentPath)) {
        console.warn(`User with role ${currentRole} does not have access to ${currentPath}, redirecting to dashboard`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in redirect effect:', error);
    }
  }, [currentRole, pageAccessByRole, testRole, isTestMode, isLoading]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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