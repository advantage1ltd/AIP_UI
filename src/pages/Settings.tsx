import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { UserCog, Search, Check, X, Save, AlertCircle, Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePageAccess } from '@/contexts/PageAccessContext'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { settingsService } from '@/services/settingsService'
import { PageAccess } from '@/api/pageAccess'
import { LoadingSpinner } from "@/components/ui/loading-state"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Define types for our page access configuration
type Page = PageAccess;

interface UserRole {
  id: string
  name: string
  description: string
}

const Settings = () => {
  const queryClient = useQueryClient();
  
  // State for officer customer reporting setting
  const [officerCustomerReportingEnabled, setOfficerCustomerReportingEnabled] = useState(() => {
    return localStorage.getItem('officer_customer_reporting_enabled') === 'true';
  });

  // Define user roles
  const userRoles: UserRole[] = [
    { 
      id: 'AdvantageOneOfficer', 
      name: 'Advantage One Officer', 
      description: 'Security officers working on site' 
    },
    { 
      id: 'AdvantageOneHOOfficer', 
      name: 'Advantage One HO Officer', 
      description: 'Head office staff managing operations' 
    },
    { 
      id: 'Administrator', 
      name: 'Administrator', 
      description: 'System administrators with full access' 
    },
    { 
      id: 'CustomerSiteManager', 
      name: 'Customer Site Manager', 
      description: 'Client managers at specific locations' 
    },
    { 
      id: 'CustomerHOManager', 
      name: 'Customer Head Office Manager', 
      description: 'Client executives overseeing all sites' 
    }
  ];

  const { 
    availablePages, 
    pageAccessByRole, 
    setPageAccessByRole, 
    currentRole,
    isTestMode,
    testRole,
    setIsTestMode: setTestMode,
    setTestRole,
    refreshSettings
  } = usePageAccess();
  
  // State for search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // State to track if admin access has been modified
  const [adminAccessModified, setAdminAccessModified] = useState(false);

  // State for the selected role in the mobile view
  const [selectedRoleForMobile, setSelectedRoleForMobile] = useState<string>(userRoles[0]?.id || ''); // Default to first role

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize admin access with all pages
  useEffect(() => {
    if (availablePages.length > 0 && (!pageAccessByRole.Administrator || pageAccessByRole.Administrator.length === 0)) {
      const allPageIds = availablePages.map(page => page.id);
      setPageAccessByRole({
        ...pageAccessByRole,
        Administrator: allPageIds
      });
    }
  }, [availablePages, pageAccessByRole]);

  // Query for fetching settings
  const { data: settings, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ['pageAccess'],
    queryFn: settingsService.getPageAccessSettings,
  });

  // Effect to handle settings data and ensure admin access
  useEffect(() => {
    if (settings && availablePages.length > 0) {
      const allPageIds = availablePages.map(page => page.id);
      const adminPages = settings.pageAccessByRole.Administrator || [];
      
      // If admin doesn't have all pages, update their access
      if (!allPageIds.every(id => adminPages.includes(id))) {
        const updatedSettings = {
          ...settings,
          pageAccessByRole: {
            ...settings.pageAccessByRole,
            Administrator: allPageIds
          }
        };
        setPageAccessByRole(updatedSettings.pageAccessByRole);
        // Save the updated settings
        saveSettings(updatedSettings);
      } else {
        setPageAccessByRole(settings.pageAccessByRole);
      }
    }
  }, [settings, availablePages]);

  // Effect to check if admin access has been modified
  useEffect(() => {
    if (availablePages.length > 0 && pageAccessByRole.Administrator) {
      const allPageIds = availablePages.map(page => page.id);
      setAdminAccessModified(
        !allPageIds.every(id => pageAccessByRole.Administrator.includes(id))
      );
    }
  }, [pageAccessByRole, availablePages]);

  // Mutation for saving settings
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: settingsService.savePageAccessSettings,
    onSuccess: async () => {
      // Refresh the page access context to use the new saved settings
      await refreshSettings();
      
      toast({
        title: adminAccessModified ? "Warning: Admin Access Modified" : "Settings Saved",
        description: adminAccessModified 
          ? "You have modified administrator access. This may affect system functionality."
          : "Page access settings have been saved successfully.",
        variant: adminAccessModified ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ['pageAccess'] });
    },
    onError: () => {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for resetting admin access
  const { mutate: resetAdmin, isPending: isResetting } = useMutation({
    mutationFn: () => settingsService.resetAdminAccess(availablePages),
    onSuccess: async (data) => {
      setPageAccessByRole(data.pageAccessByRole);
      
      // Refresh the page access context
      await refreshSettings();
      
      toast({
        title: "Admin Access Reset",
        description: "Administrator access has been restored to full access.",
      });
      queryClient.invalidateQueries({ queryKey: ['pageAccess'] });
    },
    onError: () => {
      toast({
        title: "Error Resetting Admin Access",
        description: "Failed to reset administrator access. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (queryLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-primary/80" />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="w-full px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load page access settings. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter pages based on search query
  const filteredPages = availablePages?.filter(page => {
    const searchLower = searchQuery?.toLowerCase() || '';
    return (
      page?.title?.toLowerCase().includes(searchLower) ||
      page?.path?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Group pages by category for better organization
  const pagesByCategory = filteredPages.reduce((acc, page) => {
    const category = page.path.split('/')[1] || 'dashboard';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  // Define category display names and order
  const categoryDisplayNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'management': 'Management',
    'reports': 'Operations',
    'customer': 'Customer',
    'settings': 'Settings',
    'recruitment': 'Recruitment'
  };

  // Define subcategory display names
  const subcategoryMap: Record<string, string> = {
    'action-calendar': 'Action Calendar',
    'user-setup': 'Administration',
    'employee-registration': 'Administration',
    'customer-setup': 'Administration',
    'stock-control': 'Administration',
    'uniform-equipment': 'Employee',
    'disciplinary': 'Employee',
    'diary': 'Employee',
    'customer-reporting': 'Reports',
    'manager-support': 'Management',
    'incidents-report': 'Management',
    'officer-performance': 'Management',
    'incident-report': 'Operations',
    'mystery-shopper': 'Operations',
    'site-visit': 'Operations',
    'holiday-requests': 'Operations',
    'bank-holiday': 'Operations',
    'customer-satisfaction': 'Operations',
    'patrol-log': 'Operations',
    'safe-duress-words': 'Operations',
    'officer-support': 'Operations',
    'officer-expenses': 'Operations',
    'daily-activity-report': 'Customer',
    'incident-graph': 'Customer',
    'customer-incident-report': 'Customer',
    'satisfaction-reports': 'Customer',
    'be-safe-be-secure-graph': 'Customer',
    'customer-officer-support': 'Customer',
    'customer-reports': 'Reports',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'take-test': 'Recruitment',
    'crm-dashboard': 'CRM',
    'crm-deals': 'CRM',
    'crm-leads': 'CRM',
    'crm-pipeline': 'CRM',
    'crm-tasks': 'CRM',
    'recruitment-cbt': 'Recruitment',
    'recruitment-vetting': 'Recruitment',
    'compliance-asset-register': 'Compliance',
    'compliance-contract-renewal': 'Compliance',
    'compliance-password-register': 'Compliance'
  };

  const categoryOrder = ['dashboard', 'management', 'reports', 'customer', 'settings', 'recruitment'];

  // Group pages by subcategory for better organization
  const pagesBySubcategory = filteredPages.reduce((acc, page) => {
    const subcategory = subcategoryMap[page.id] || categoryDisplayNames[page.path.split('/')[1] || 'dashboard'];
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  // Define subcategory order
  const subcategoryOrder = [
    'Dashboard',
    'Action Calendar',
    'Administration',
    'CRM',
    'Recruitment',
    'Compliance',
    'Operations',
    'Employee',
    'Management',
    'Reports',
    'Customer',
    'Settings'
  ];

  // Split roles into two groups for the mobile/small tablet view
  const rolesPerRowMobile = 3; // Show 3 roles per row on mobile
  const mobileRoleGroup1 = userRoles.slice(0, rolesPerRowMobile);
  const mobileRoleGroup2 = userRoles.slice(rolesPerRowMobile);

  // Handle toggle change
  const handleToggle = (pageId: string, roleId: string) => {
    // Prevent toggling Administrator access unless explicitly modifying
    if (roleId === 'Administrator' && !adminAccessModified) {
      toast({
        title: "Administrator Access Protected",
        description: "Administrator must have access to all pages by default. Use 'Reset Admin Access' to restore full access.",
        variant: "default",
      });
      return;
    }

    const newAccess = { ...pageAccessByRole };
    const roleAccess = [...(newAccess[roleId] || [])];
    
    if (roleAccess.includes(pageId)) {
      // Remove access
      newAccess[roleId] = roleAccess.filter(id => id !== pageId);
    } else {
      // Add access
      newAccess[roleId] = [...roleAccess, pageId];
    }
    
    setPageAccessByRole(newAccess);
    localStorage.setItem('pageAccessSettings', JSON.stringify(newAccess));
  };

  // Handle save changes
  // Handler for officer customer reporting toggle
  const handleOfficerReportingToggle = (enabled: boolean) => {
    setOfficerCustomerReportingEnabled(enabled);
    localStorage.setItem('officer_customer_reporting_enabled', enabled.toString());
    toast({
      title: "Setting Updated",
      description: `Officer Customer Reporting access has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSave = () => {
    saveSettings({ pageAccessByRole });
  };

  // Handle reset admin access
  const handleResetAdminAccess = () => {
    const allPageIds = availablePages.map(page => page.id);
    const updatedSettings = {
      ...pageAccessByRole,
      Administrator: allPageIds
    };
    setPageAccessByRole(updatedSettings);
    saveSettings({ pageAccessByRole: updatedSettings });
    setAdminAccessModified(false);
    toast({
      title: "Admin Access Reset",
      description: "Administrator access has been restored to full access.",
    });
  };

  // Find the full object for the selected mobile role
  const selectedMobileRoleObject = userRoles.find(role => role.id === selectedRoleForMobile);

  return (
    <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 2xl:px-8 py-2 sm:py-3 md:py-4 lg:py-6 space-y-2 sm:space-y-3 md:space-y-4">
      {/* Test Mode Banner */}
      {isTestMode && currentRole === 'administrator' && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-2 sm:mb-3 md:mb-4">
          <Eye className="h-4 w-4" />
          <AlertTitle className="flex flex-wrap items-center gap-2">
            Admin Test Mode
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
              {userRoles.find(r => r.id === testRole)?.name || testRole}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            You are in test mode viewing the application as {userRoles.find(r => r.id === testRole)?.name || testRole}.
            You still have access to this settings page as an administrator.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-border/40">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-2 sm:p-3 md:p-4 border-b">
          <div className="mb-2 md:mb-0">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2">
              <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Configure User Role Access
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Manage which pages each user role can access in the application
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {adminAccessModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAdminAccess}
                disabled={isResetting}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs w-full sm:w-auto"
              >
                {isResetting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                Reset Admin
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3 md:p-4">
          {adminAccessModified && (
            <Alert variant="destructive" className="mb-2 sm:mb-3 md:mb-4">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <AlertTitle className="text-xs sm:text-sm">Warning: Administrator Access Modified</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                You have restricted administrator access to certain pages. This may affect system functionality.
                Click "Reset Admin Access" to restore full access.
              </AlertDescription>
            </Alert>
          )}

          {/* Officer Customer Reporting Setting */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCog className="h-4 w-4 text-primary" />
                Officer Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure additional access permissions for officers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Customer Reporting Access</p>
                  <p className="text-xs text-muted-foreground">
                    Allow AdvantageOne officers to access the Customer Reporting page
                  </p>
                </div>
                <Switch
                  checked={officerCustomerReportingEnabled}
                  onCheckedChange={handleOfficerReportingToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 sm:pl-9 w-full text-xs sm:text-sm h-8 sm:h-9"
              />
            </div>
            
            {/* Mobile Role Selector Dropdown */}
            <div className="block md:hidden w-full">
              <Select value={selectedRoleForMobile} onValueChange={setSelectedRoleForMobile}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Select a role to configure" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-xs sm:text-sm">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page Count */}
            <div className="text-xs text-muted-foreground text-right md:text-left flex-shrink-0">
              {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'} found
            </div>
          </div>

          {/* Table Container */}
          <div className="border rounded-md shadow-sm">
            {/* Table for Larger Screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] 2xl:min-w-[1200px] 3xl:min-w-[1600px]">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-2.5 px-3 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm w-1/4">Page</th>
                    {userRoles.map((role) => (
                      <th key={role.id} className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium text-xs whitespace-nowrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block px-2 py-1 rounded-full bg-secondary/50">
                                {role.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{role.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{subcategoryOrder.map(subcategory => {
                  const pagesInSubcategory = pagesBySubcategory[subcategory] || [];
                  if (pagesInSubcategory.length === 0) return null;
                  return (<React.Fragment key={subcategory + '-lg'}>
                    <tr className="bg-muted/30 border-t">
                      <td colSpan={userRoles.length + 1} className="py-2 px-4 font-semibold text-sm">
                        {subcategory}
                      </td>
                    </tr>
                    {pagesInSubcategory.map(page => (
                      <tr key={page.id + '-lg'} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 border-l-2 border-l-transparent hover:border-l-primary">
                          <div>
                            <div className="font-medium text-sm">{page.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{page.path}</div>
                          </div>
                        </td>
                        {userRoles.map(role => (
                          <td key={`${page.id}-${role.id}-lg`} className="text-center py-3 px-2">
                            <div className="flex justify-center">
                              <Switch
                                checked={(pageAccessByRole[role.id] || []).includes(page.id)}
                                onCheckedChange={() => handleToggle(page.id, role.id)}
                                disabled={role.id === 'administrator' && !adminAccessModified}
                                className="data-[state=checked]:bg-primary h-5 w-9"
                              />
                            </div>
                          </td>))}
                      </tr>))}
                  </React.Fragment>);
                })}</tbody>
              </table>
            </div>

            {/* Table for Small Screens */}
            <div className="block md:hidden">
              <table className="w-full min-w-[280px]">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-2.5 px-3 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm w-3/5">Page</th>
                    <th className="text-center py-2.5 px-2 sm:py-3 sm:px-3 font-medium text-xs whitespace-nowrap w-2/5">
                      {selectedMobileRoleObject ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block px-2 py-1 rounded-full bg-secondary/50 text-xs sm:text-sm">
                                {selectedMobileRoleObject.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{selectedMobileRoleObject.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : 'Select Role'}
                    </th>
                  </tr>
                </thead>
                <tbody>{subcategoryOrder.map(subcategory => {
                  const pagesInSubcategory = pagesBySubcategory[subcategory] || [];
                  if (pagesInSubcategory.length === 0) return null;
                  return (<React.Fragment key={subcategory + '-sm'}>
                    <tr className="bg-muted/30 border-t">
                      <td colSpan={2} className="py-2 px-4 font-semibold text-sm">{subcategory}</td>
                    </tr>
                    {pagesInSubcategory.map(page => (
                      <tr key={page.id + '-sm'} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 border-l-2 border-l-transparent hover:border-l-primary">
                          <div>
                            <div className="font-medium text-sm">{page.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{page.path}</div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          <div className="flex justify-center">
                            <Switch
                              checked={(pageAccessByRole[selectedRoleForMobile] || []).includes(page.id)}
                              onCheckedChange={() => handleToggle(page.id, selectedRoleForMobile)}
                              disabled={selectedRoleForMobile === 'administrator' && !adminAccessModified}
                              className="data-[state=checked]:bg-primary h-5 w-9"
                            />
                          </div>
                        </td>
                      </tr>))}
                  </React.Fragment>);
                })}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;