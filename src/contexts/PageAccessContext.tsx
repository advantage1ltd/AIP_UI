import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageAccess, pageAccessApi } from '@/api/pageAccess';
import { useAuth } from '@/hooks/useAuth';
import { customerPageAccessCache } from '@/services/customerPageAccessCache';
import { PAGE_DEFINITIONS } from '@/config/navigation/pageDefinitions';

interface PageAccessContextType {
  hasAccess: (path: string) => boolean;
  currentRole: string | null;
  setCurrentRole: (role: string | null) => Promise<void>;
  pageAccessByRole: Record<string, string[]>;
  setPageAccessByRole: (access: Record<string, string[]>) => void;
  availablePages: PageAccess[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  clearCacheAndReload: () => Promise<void>;
  syncPages: () => Promise<void>;
  isTestMode: boolean;
  setIsTestMode: (isTestMode: boolean) => void;
  testRole: string | null;
  setTestRole: (role: string | null) => void;
}

const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

const parseNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveCustomerContextId = (role: string | null, user: any): number | null => {
  if (!role || !user) return null;
  const isCustomerRole = role === 'CustomerSiteManager' || role === 'CustomerHOManager';

  if (isCustomerRole) {
    return (
      parseNumericId(user?.customerId) ??
      parseNumericId(user?.CustomerId) ??
      parseNumericId(user?.companyId) ??
      null
    );
  }

  const assignedCustomerIds = user?.assignedCustomerIds;
  if (Array.isArray(assignedCustomerIds) && assignedCustomerIds.length > 0) {
    return parseNumericId(assignedCustomerIds[0]);
  }

  return null;
};

export const usePageAccess = () => {
  const context = useContext(PageAccessContext);
  if (context === undefined) {
    throw new Error('usePageAccess must be used within a PageAccessProvider');
  }
  return context;
};

export const PageAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [pageAccessByRole, setPageAccessByRole] = useState<Record<string, string[]>>({});
  const [availablePages, setAvailablePages] = useState<PageAccess[]>([]);
  const [customerAssignedPageIds, setCustomerAssignedPageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testRole, setTestRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const lastCustomerContextId = useRef<number | null>(null);

  const hasAccess = (path: string): boolean => {
    try {
      if (!currentRole) {
        return false;
      }
      
      // If page access data is not loaded yet, allow access to prevent redirect loops
      if (Object.keys(pageAccessByRole).length === 0) {
        return true;
      }
      
      // Get the allowed page IDs for the role
      const allowedPageIds = pageAccessByRole[currentRole];
      if (!allowedPageIds) {
        console.warn('🔒 [PageAccess] No page IDs found for role:', currentRole);
        return false;
      }
      
      // If availablePages is not loaded yet, allow access to prevent redirect loops
      if (availablePages.length === 0) {
        return true;
      }
      
      // Look for matching page
      const requestedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      const page = availablePages.find(p => p.path === requestedPath);
      
      if (!page) {
        // Only log if this is not a common path that might not be in availablePages
        if (!requestedPath.startsWith('/customer/') && requestedPath !== '/') {
          console.warn('🔒 [PageAccess] Page not found in availablePages:', requestedPath);
        }
        return false;
      }
      
      // Administrator should have access to ALL pages
      if (currentRole === 'Administrator') {
        return true;
      }
      
      // For customer roles, check customer-specific page assignments
      const isCustomerRole = currentRole === 'CustomerSiteManager' || currentRole === 'CustomerHOManager';
      const isCustomerPage = page.path?.startsWith('/customer') || page.category === 'Customer';
      
      if (isCustomerRole && isCustomerPage) {
        // Dashboard is always available
        if (page.id === 'dashboard' || requestedPath === '/dashboard') {
          return true;
        }
        // Check if this page is assigned to the customer
        const hasCustomerAccess = customerAssignedPageIds.has(page.id);
        if (!hasCustomerAccess) {
          console.warn('🔒 [PageAccess] Customer page not assigned:', page.id, 'at path:', requestedPath);
        }
        return hasCustomerAccess;
      }
      
      // Check if the role has access to this page
      const hasAccess = allowedPageIds.includes(page.id);
      if (!hasAccess) {
        console.warn('🔒 [PageAccess] Access denied for', currentRole, 'to page:', page.id, 'at path:', requestedPath);
      }
      return hasAccess;
    } catch (error) {
      console.error('🔒 [PageAccess] Error checking access:', error);
      return false;
    }
  };

  /**
   * Refresh settings from API
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const refreshSettings = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Fetch page access data from API
      const data = await pageAccessApi.getSettings();
      
      setPageAccessByRole(data.pageAccessByRole);
      setAvailablePages(data.availablePages);
      
      console.log('✅ [PageAccess] Settings refreshed successfully');
      console.log('📋 [PageAccess] Page access by role:', Object.keys(data.pageAccessByRole));
      console.log('📄 [PageAccess] Total available pages:', data.availablePages.length);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - this function doesn't depend on any state/props

  /**
   * Clear cached settings and reload fresh from API
   */
  const clearCacheAndReload = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Force reload fresh settings from API
      const data = await pageAccessApi.getSettings();
      setPageAccessByRole(data.pageAccessByRole);
      setAvailablePages(data.availablePages);
      
      console.log('🔄 [PageAccess] Reloaded fresh settings from API');
    } catch (error) {
      console.error('Error clearing cache and reloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sync pages from frontend definitions to backend
   * Only available for administrators
   */
  const syncPages = async (): Promise<void> => {
    try {
      if (currentRole !== 'Administrator') {
        console.warn('🔒 [PageAccess] Only administrators can sync pages');
        return;
      }

      console.log('🔄 [PageAccess] Syncing pages from definitions...');
      const result = await pageAccessApi.syncPages(PAGE_DEFINITIONS);
      
      console.log(`✅ [PageAccess] Pages synced: ${result.message}`);
      
      // Refresh settings after sync to get updated pages
      await refreshSettings();
    } catch (error) {
      console.error('❌ [PageAccess] Error syncing pages:', error);
      // Don't throw - allow app to continue even if sync fails
    }
  };

  const loadCustomerPageAssignments = useCallback(async (customerId: number | null) => {
    const normalizedCustomerId = parseNumericId(customerId);

    if (!normalizedCustomerId) {
      setCustomerAssignedPageIds(new Set());
      lastCustomerContextId.current = null;
      return;
    }

    try {
      const response = await customerPageAccessCache.get(normalizedCustomerId);
      setCustomerAssignedPageIds(new Set(response.assignedPageIds));
      lastCustomerContextId.current = normalizedCustomerId;
      console.log('✅ [PageAccess] Customer page assignments loaded:', response.assignedPageIds.length, 'pages');
    } catch (error) {
      console.error('Error loading customer page assignments:', error);
      setCustomerAssignedPageIds(new Set());
      lastCustomerContextId.current = null;
    }
  }, []);

  const syncCustomerAssignmentsForRole = useCallback(async (role: string | null) => {
    const customerContextId = resolveCustomerContextId(role, user);
    await loadCustomerPageAssignments(customerContextId);
  }, [user, loadCustomerPageAssignments]);

  // Enhanced setCurrentRole that ensures page access data is loaded
  const setCurrentRoleWithData = async (role: string | null) => {
    if (!role) {
      setCurrentRole(null);
      setCustomerAssignedPageIds(new Set());
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
        if (data.pageAccessByRole[role]) {
          console.log('📋 [PageAccess] Pages available for', role + ':', data.pageAccessByRole[role].length);
          console.log('📄 [PageAccess] Page IDs:', data.pageAccessByRole[role]);
        }
      } catch (error) {
        console.error('Error loading page access data for role:', error);
      } finally {
        setIsLoading(false);
      }
    }

    await syncCustomerAssignmentsForRole(role);
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
          console.log('🔄 [PageAccess] Initializing currentRole from localStorage:', storedRole);
          
          // Fetch page access data from API
          console.log('🔍 [PageAccess] Fetching page access settings from API...');
          const data = await pageAccessApi.getSettings();
          console.log('✅ [PageAccess] API data loaded:', {
            roles: Object.keys(data.pageAccessByRole),
            pages: data.availablePages.length
          });
          
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
          
          await syncCustomerAssignmentsForRole(validatedRole);
          
          // Debug log to show what was loaded
          if (validatedRole && data.pageAccessByRole[validatedRole]) {
            console.log('📋 [PageAccess] Initial load - Pages for', validatedRole + ':', data.pageAccessByRole[validatedRole].length);
            console.log('📄 [PageAccess] Page IDs:', data.pageAccessByRole[validatedRole].slice(0, 10), '...');
          }
        }
      } catch (error) {
        console.error('Error initializing access:', error);
        // Even if there's an error, we should still set the role and mark as initialized
        // to prevent the app from getting stuck
        if (storedRole) {
          setCurrentRole(storedRole);
        }
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
        
        await syncCustomerAssignmentsForRole(currentRole);
        
        console.log('✅ Page access data reloaded for new role:', currentRole);
        if (currentRole && data.pageAccessByRole[currentRole]) {
          console.log('📋 [PageAccess] Reload - Pages for', currentRole + ':', data.pageAccessByRole[currentRole].length);
          console.log('📄 [PageAccess] Page IDs:', data.pageAccessByRole[currentRole].slice(0, 10), '...');
        }
      } catch (error) {
        console.error('Error reloading page access for role change:', error);
      } finally {
        setIsLoading(false);
      }
    };

    reloadPageAccessForRole();
  }, [currentRole, hasInitialized, syncCustomerAssignmentsForRole]);

  // Optional: Auto-sync pages on startup for administrators (runs once)
  // This ensures pages from sidebar.ts are always in sync with the database
  // Use a ref to track if we've already attempted sync to prevent multiple runs
  const hasAttemptedSyncRef = useRef(false);
  const syncInProgressRef = useRef(false);
  const lastPageCountRef = useRef<number>(0);
  
  // DISABLED: Frontend-to-backend page syncing
  // 
  // Enterprise Architecture Decision: Database-First Approach
  // Pages are now managed entirely in the database and initialized on backend startup.
  // This ensures:
  // 1. Database is the single source of truth
  // 2. Pages are always available without relying on frontend sync
  // 3. No risk of sync failures breaking functionality
  // 4. Better for enterprise deployments and CI/CD pipelines
  //
  // Pages are initialized via:
  // - Backend startup initialization (Program.cs)
  // - Database seeding (DataSeedingService)
  // - Manual initialization endpoint (if needed)
  //
  // To add new pages, update the InitializeDefaultPageAccessAsync method in PageAccessService.cs
  // and deploy the backend. Pages will be automatically initialized on next startup.
  
  // useEffect(() => {
  //   // Auto-sync disabled - pages are now managed in database
  // }, []);

  useEffect(() => {
    if (!currentRole || !hasInitialized) return;
    syncCustomerAssignmentsForRole(currentRole);
  }, [currentRole, hasInitialized, syncCustomerAssignmentsForRole]);

  // Update localStorage when role changes
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('userRole', currentRole);
    }
  }, [currentRole]);

  // Effect to redirect if user doesn't have access to current page
  useEffect(() => {
    try {
      if (!currentRole || isLoading || !hasInitialized) return;

      const currentPath = window.location.pathname;
      
      // Skip redirect for these paths
      const skipPaths = [
        '/login',
        '/dashboard',
        '/',
        '/profile',
        '/test/barcode'
      ];
      
      if (skipPaths.includes(currentPath)) {
        return;
      }
      
      // Only redirect if we have page access data loaded
      if (Object.keys(pageAccessByRole).length > 0 && availablePages.length > 0) {
        if (!hasAccess(currentPath)) {
          console.warn(`User with role ${currentRole} does not have access to ${currentPath}, redirecting to dashboard`);
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error in redirect effect:', error);
    }
  }, [currentRole, pageAccessByRole, isLoading, hasInitialized, availablePages, customerAssignedPageIds.size]);

  return (
    <PageAccessContext.Provider value={{
      hasAccess,
      currentRole,
      setCurrentRole: setCurrentRoleWithData,
      pageAccessByRole,
      setPageAccessByRole,
      availablePages,
      isLoading,
      refreshSettings,
      clearCacheAndReload,
      syncPages,
      isTestMode,
      setIsTestMode,
      testRole,
      setTestRole
    }}>
      {children}
    </PageAccessContext.Provider>
  );
}; 