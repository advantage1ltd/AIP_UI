import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageAccess, pageAccessApi } from '@/api/pageAccess';

interface PageAccessContextType {
  hasAccess: (path: string) => boolean;
  currentRole: string | null;
  setCurrentRole: (role: string | null) => Promise<void>;
  pageAccessByRole: Record<string, string[]>;
  setPageAccessByRole: (access: Record<string, string[]>) => void;
  availablePages: PageAccess[];
  isTestMode: boolean;
  setIsTestMode: (mode: boolean) => void;
  testRole: string | null;
  setTestRole: (role: string | null) => void;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  clearCacheAndReload: () => Promise<void>;
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess = (path: string): boolean => {
    try {
      // If in test mode, check access based on test role
      const roleToCheck = isTestMode && testRole ? testRole : currentRole;
      
      if (!roleToCheck) return false;
      
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

  /**
   * Refresh settings from localStorage or API
   */
  const refreshSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if there are saved settings in localStorage first
      const savedSettings = localStorage.getItem('db_pageAccess_settings');
      let data;
      
      if (savedSettings) {
        console.log('📖 [PageAccess] Refreshing with saved settings from localStorage');
        const parsedSettings = JSON.parse(savedSettings);
        
        // Still need to get availablePages from the API
        const apiData = await pageAccessApi.getSettings();
        data = {
          pageAccessByRole: parsedSettings.pageAccessByRole,
          availablePages: apiData.availablePages
        };
      } else {
        // Fetch page access data from API
        data = await pageAccessApi.getSettings();
      }
      
      setPageAccessByRole(data.pageAccessByRole);
      setAvailablePages(data.availablePages);
      
      console.log('✅ [PageAccess] Settings refreshed successfully');
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear cached settings and reload fresh from db.json
   */
  const clearCacheAndReload = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear any cached settings
      localStorage.removeItem('db_pageAccess_settings');
      console.log('🗑️ [PageAccess] Cleared cached settings');
      
      // Force reload fresh settings from db.json
      const data = await pageAccessApi.getSettings();
      setPageAccessByRole(data.pageAccessByRole);
      setAvailablePages(data.availablePages);
      
      console.log('🔄 [PageAccess] Reloaded fresh settings from db.json');
    } catch (error) {
      console.error('Error clearing cache and reloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced setCurrentRole that ensures page access data is loaded
  const setCurrentRoleWithData = async (role: string | null) => {
    if (!role) {
      setCurrentRole(null);
      return;
    }

    console.log('🔑 Setting current role with data loading:', role);
    
    // Set the role immediately for UI responsiveness
    setCurrentRole(role);
    
    // If we don't have page access data for this role, load it
    const hasRoleData = pageAccessByRole[role] && availablePages.length > 0;
    if (!hasRoleData) {
      try {
        console.log('🔄 Loading page access data for role:', role);
        setIsLoading(true);
        
        const data = await pageAccessApi.getSettings();
        setPageAccessByRole(data.pageAccessByRole);
        setAvailablePages(data.availablePages);
        
        console.log('✅ Page access data loaded for role:', role);
      } catch (error) {
        console.error('Error loading page access data for role:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initialize role and fetch page access
  useEffect(() => {
    const initializeAccess = async () => {
      try {
        setIsLoading(true);
        
        // Get stored role
        const storedRole = localStorage.getItem('userRole');
        let validatedRole: string | null = null;
        
        if (storedRole) {
          console.log('🔄 Initializing currentRole from localStorage:', storedRole);
          
          // Check if there are saved settings in localStorage first
          const savedSettings = localStorage.getItem('db_pageAccess_settings');
          let data;
          
          if (savedSettings) {
            console.log('📖 [PageAccess] Using saved settings from localStorage');
            const parsedSettings = JSON.parse(savedSettings);
            
            // Still need to get availablePages from the API
            const apiData = await pageAccessApi.getSettings();
            data = {
              pageAccessByRole: parsedSettings.pageAccessByRole,
              availablePages: apiData.availablePages
            };
          } else {
            // Fetch page access data from API
            data = await pageAccessApi.getSettings();
          }
          
          const validRoles = Object.keys(data.pageAccessByRole);
          
          const matchingRole = validRoles.find(
            role => role.toLowerCase() === storedRole.toLowerCase()
          );
          
          if (matchingRole) {
            validatedRole = matchingRole;
            if (matchingRole !== storedRole) {
              localStorage.setItem('userRole', matchingRole);
            }
          } else {
            console.warn(`Invalid role found in localStorage: ${storedRole}`);
            localStorage.removeItem('userRole');
          }
          
          setPageAccessByRole(data.pageAccessByRole);
          setAvailablePages(data.availablePages);
          setCurrentRole(validatedRole);
        }
      } catch (error) {
        console.error('Error initializing access:', error);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAccess();
  }, []);

  // Re-initialize page access data when currentRole changes during session (e.g., after login)
  useEffect(() => {
    const reloadPageAccessForRole = async () => {
      // Skip if not initialized yet, no role, or if we already have data for this role
      if (!hasInitialized || !currentRole) return;
      
      // Check if we already have page access data for this role
      const hasRoleData = pageAccessByRole[currentRole] && availablePages.length > 0;
      if (hasRoleData) return;
      
      try {
        console.log('🔄 Role changed during session, reloading page access for:', currentRole);
        setIsLoading(true);
        
        // Fetch fresh page access data
        const data = await pageAccessApi.getSettings();
        setPageAccessByRole(data.pageAccessByRole);
        setAvailablePages(data.availablePages);
        
        console.log('✅ Page access data reloaded for new role:', currentRole);
      } catch (error) {
        console.error('Error reloading page access for role change:', error);
      } finally {
        setIsLoading(false);
      }
    };

    reloadPageAccessForRole();
  }, [currentRole, hasInitialized]);

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

  return (
    <PageAccessContext.Provider value={{
      hasAccess,
      currentRole,
      setCurrentRole: setCurrentRoleWithData,
      pageAccessByRole,
      setPageAccessByRole,
      availablePages,
      isTestMode,
      setIsTestMode,
      testRole,
      setTestRole,
      isLoading,
      refreshSettings,
      clearCacheAndReload
    }}>
      {children}
    </PageAccessContext.Provider>
  );
}; 