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

// Define types for our page access configuration
interface Page {
  id: string
  name: string
  description: string
  category: 'dashboard' | 'reports' | 'management' | 'customer' | 'settings'
  path: string
}

interface UserRole {
  id: string
  name: string
  description: string
}

const Settings = () => {
  // Define user roles
  const userRoles: UserRole[] = [
    { 
      id: 'advantage-officer', 
      name: 'Advantage One Officer', 
      description: 'Security officers working on site' 
    },
    { 
      id: 'advantage-ho', 
      name: 'Advantage One HO Officer', 
      description: 'Head office staff managing operations' 
    },
    { 
      id: 'administrator', 
      name: 'Administrator', 
      description: 'System administrators with full access' 
    },
    { 
      id: 'customer-site', 
      name: 'Customer Site Manager', 
      description: 'Client managers at specific locations' 
    },
    { 
      id: 'customer-ho', 
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
    testRole
  } = usePageAccess();
  
  // State for search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // State to track if admin access has been modified
  const [adminAccessModified, setAdminAccessModified] = useState(false);

  // Effect to check if admin access has been modified
  useEffect(() => {
    const defaultAdminAccess = availablePages.map(page => page.id);
    const currentAdminAccess = pageAccessByRole['administrator'] || [];
    setAdminAccessModified(
      defaultAdminAccess.length !== currentAdminAccess.length ||
      !defaultAdminAccess.every(id => currentAdminAccess.includes(id))
    );
  }, [pageAccessByRole, availablePages]);

  // Filter pages based on search query
  const filteredPages = availablePages.filter(page => {
    const searchLower = searchQuery.toLowerCase();
    return (
      page.name.toLowerCase().includes(searchLower) ||
      page.description.toLowerCase().includes(searchLower) ||
      page.category.toLowerCase().includes(searchLower)
    );
  });

  // Group pages by category for better organization
  const pagesByCategory = filteredPages.reduce((acc, page) => {
    const category = page.category;
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
    'settings': 'Settings'
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
    'customer-reporting': 'Management',
    'manager-support': 'Management',
    'incidents-report': 'Management',
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
    'dashboard': 'Dashboard',
    'settings': 'Settings',
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

  const categoryOrder = ['dashboard', 'management', 'reports', 'customer', 'settings'];

  // Group pages by subcategory for better organization
  const pagesBySubcategory = filteredPages.reduce((acc, page) => {
    const subcategory = subcategoryMap[page.id] || categoryDisplayNames[page.category];
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
    'Customer', 
    'Settings'
  ];

  // Handle toggle change
  const handleToggle = (pageId: string, roleId: string) => {
    setPageAccessByRole((prev: Record<string, string[]>) => {
      const newAccess = { ...prev };
      const roleAccess = [...(newAccess[roleId] || [])];
      
      if (roleAccess.includes(pageId)) {
        // Remove access
        newAccess[roleId] = roleAccess.filter(id => id !== pageId);
      } else {
        // Add access
        newAccess[roleId] = [...roleAccess, pageId];
      }
      
      return newAccess;
    });
  };

  // Handle save changes
  const handleSave = () => {
    // Here you would typically save to your backend
    toast({
      title: adminAccessModified ? "Warning: Admin Access Modified" : "Settings Saved",
      description: adminAccessModified 
        ? "You have modified administrator access. This may affect system functionality."
        : "Page access settings have been saved successfully.",
      variant: adminAccessModified ? "destructive" : "default",
    });
  };

  // Handle reset admin access
  const handleResetAdminAccess = () => {
    setPageAccessByRole((prev: Record<string, string[]>) => ({
      ...prev,
      administrator: availablePages.map(page => page.id)
    }));
    toast({
      title: "Admin Access Reset",
      description: "Administrator access has been restored to full access.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Test Mode Banner */}
      {isTestMode && currentRole === 'administrator' && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Eye className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
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

      <Card className="border shadow-sm">
        <CardHeader className="bg-card border-b pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Configure User Role Access
              </CardTitle>
              <CardDescription className="mt-1">
                Manage which pages each user role can access in the application
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {adminAccessModified && (
                <Button
                  variant="outline"
                  onClick={handleResetAdminAccess}
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  Reset Admin Access
                </Button>
              )}
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {adminAccessModified && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning: Administrator Access Modified</AlertTitle>
              <AlertDescription>
                You have restricted administrator access to certain pages. This may affect system functionality.
                Click "Reset Admin Access" to restore full access.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredPages.length} {filteredPages.length === 1 ? 'page' : 'pages'} found
            </div>
          </div>

          <Card className="border overflow-hidden">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] font-semibold">Page</TableHead>
                    {userRoles.map(role => (
                      <TableHead key={role.id} className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold whitespace-nowrap px-2 py-1 rounded-full bg-secondary/50 inline-block">
                                {role.name}
                                {isTestMode && testRole === role.id && (
                                  <Badge variant="outline" className="ml-2">
                                    Testing
                                  </Badge>
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{role.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategoryOrder.map(subcategory => {
                    const pagesInSubcategory = pagesBySubcategory[subcategory] || [];
                    if (pagesInSubcategory.length === 0) return null;
                    
                    return (
                      <React.Fragment key={subcategory}>
                        {/* Category Header */}
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={userRoles.length + 1} className="py-3">
                            <div className="font-bold text-sm">{subcategory}</div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Pages in this category */}
                        {pagesInSubcategory.map(page => (
                          <TableRow key={page.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="border-l-2 border-l-transparent hover:border-l-primary transition-colors">
                              <div>
                                <div className="font-medium">{page.name}</div>
                                <div className="text-sm text-muted-foreground">{page.description}</div>
                              </div>
                            </TableCell>
                            {userRoles.map(role => (
                              <TableCell key={role.id} className="text-center">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={(pageAccessByRole[role.id] || []).includes(page.id)}
                                    onCheckedChange={() => handleToggle(page.id, role.id)}
                                    disabled={role.id === 'administrator' && !adminAccessModified}
                                    className="transition-all duration-200 hover:scale-105"
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;