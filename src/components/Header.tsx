import { Link } from "react-router-dom"
import React, { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  ChevronDown, 
  Search, 
  Menu,
  Home,
  Calendar,
  FileText,
  AlertTriangle,
  Users,
  ClipboardCheck,
  Building,
  PieChart,
  BarChart4,
  Radio,
  UserCog,
  FileWarning,
  FileSearch,
  Building2,
  Store,
  CalendarRange,
  BadgeCheck,
  Key,
  HelpCircle,
  Wallet,
  Shirt,
  FileTextIcon,
  BarChart3,
  Handshake,
  ShieldCheck,
  Boxes,
  GraduationCap,
  BookOpen,
  LayoutGrid,
  BarChart2
} from "lucide-react"
import { usePageAccess } from "@/contexts/PageAccessContext"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { USER_DATA, BUTTON_STYLES, COMMON_CLASSES } from "@/constants/header";
import { NotificationBell } from "./header/NotificationBell";
import { Logo } from "./header/Logo";
import { SearchInput } from "./header/SearchInput";
import { UserAvatar } from "./common/UserAvatar";

// Define navigation items structure
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[]; // Which roles can access this item
}

// Reusable components
const UserProfileDropdown = () => (
  <DropdownMenuContent className="w-56" align="end" forceMount>
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium leading-none">David Ibanga</p>
        <p className="text-xs leading-none text-muted-foreground">
          David.Ibanga@advantage1.co.uk
        </p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <Link to="/profile" className="flex w-full cursor-pointer items-center">
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link to="/settings" className="flex w-full cursor-pointer items-center">
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
);

// Role selector content component
const RoleSelectorContent = ({ 
  currentRole, 
  testRole, 
  isTestMode, 
  handleRoleChange, 
  toggleTestMode, 
  userRoles 
}: {
  currentRole: string | null;
  testRole: string | null;
  isTestMode: boolean;
  handleRoleChange: (roleId: string) => void;
  toggleTestMode: () => void;
  userRoles: Array<{ id: string; name: string; }>;
}) => (
  <DropdownMenuContent align="start" className="w-[calc(340px-48px)] sm:w-[calc(400px-48px)] bg-blue-900 text-white border-blue-800">
    <DropdownMenuLabel className="text-blue-200 text-[15px]">Switch Role</DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-blue-800" />
    <DropdownMenuRadioGroup 
      value={isTestMode && testRole ? testRole : currentRole || ''} 
      onValueChange={handleRoleChange}
    >
      {userRoles.map(role => (
        <DropdownMenuRadioItem key={role.id} value={role.id} className="text-white focus:bg-blue-800 focus:text-white text-[15px]">
          {role.name}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
    <DropdownMenuSeparator className="bg-blue-800" />
    <DropdownMenuItem onClick={toggleTestMode} className="text-white focus:bg-blue-800 focus:text-white text-[15px]">
      {isTestMode ? 'Exit Test Mode' : 'Enter Test Mode'}
      {isTestMode && (
        <Badge variant="outline" className="ml-auto border-blue-700 bg-blue-950/50">Active</Badge>
      )}
    </DropdownMenuItem>
  </DropdownMenuContent>
);

// Navigation menu component
const NavigationMenu = ({ 
  navigationItems, 
  hasAccess, 
  handleNavigate 
}: {
  navigationItems: Array<any>;
  hasAccess: (item: NavItem) => boolean;
  handleNavigate: () => void;
}) => (
  <Accordion type="multiple" className="space-y-4">
    {navigationItems.map((section, idx) => {
      const accessibleItems = section.items.filter(item => hasAccess(item));
      if (accessibleItems.length === 0) return null;
      
      return (
        <AccordionItem key={idx} value={section.section.toLowerCase()} className="border-none">
          <AccordionTrigger className="flex items-center gap-3 rounded-lg px-4 py-3 hover:no-underline hover:bg-blue-900 text-white">
            <span className="text-[17px] font-medium">{section.section}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-2">
            <div className="space-y-2">
              {accessibleItems.map((item, itemIdx) => (
                <Link 
                  key={itemIdx} 
                  to={item.href}
                  className="flex items-center gap-4 rounded-md px-4 py-3 text-[16px] font-medium text-blue-200 hover:bg-blue-800 hover:text-white"
                  onClick={handleNavigate}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'h-6 w-6' })}
                  {item.title}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    })}
  </Accordion>
);

// User profile section component
const UserProfileSection = () => (
  <div className="border-t border-blue-900 p-6 mt-auto bg-blue-900/50">
    <div className="flex items-center gap-4">
      <UserAvatar size="lg" showBorder={true} />
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-medium text-white truncate">{USER_DATA.name}</p>
        <p className="text-[14px] text-blue-200 truncate">{USER_DATA.role}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        aria-label="Log out"
        className="text-blue-200 hover:text-white hover:bg-blue-800 h-12 w-12"
      >
        <LogOut className="h-6 w-6" />
      </Button>
    </div>
  </div>
);

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { 
    currentRole, 
    setCurrentRole, 
    isTestMode, 
    setIsTestMode, 
    testRole, 
    setTestRole 
  } = usePageAccess();
  
  const { theme } = useTheme();

  // Define user roles
  const userRoles = [
    { id: 'advantage-officer', name: 'Advantage One Officer' },
    { id: 'advantage-ho', name: 'Advantage One HO Officer' },
    { id: 'administrator', name: 'Administrator' },
    { id: 'customer-site', name: 'Customer Site Manager' },
    { id: 'customer-ho', name: 'Customer Head Office Manager' }
  ];
  
  // Define navigation sections to match SidebarNavigation
  const navigationItems = [
    {
      section: "Quick Access",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: <LayoutGrid className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Action Calendar",
          href: "/action-calendar",
          icon: <Calendar className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        }
      ]
    },
    {
      section: "Administration",
      items: [
        {
          title: "User Setup",
          href: "/administration/user-setup",
          icon: <User className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Employee Registration",
          href: "/administration/employee-registration",
          icon: <Users className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Customer Setup",
          href: "/administration/customer-setup",
          icon: <Building2 className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Stock Control",
          href: "/administration/stock-control",
          icon: <Store className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        }
      ]
    },
    {
      section: "Operations",
      items: [
        {
          title: "Incident Report",
          href: "/operations/incident-report",
          icon: <FileWarning className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Mystery Shopper",
          href: "/operations/mystery-shopper",
          icon: <FileSearch className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Site Visit",
          href: "/operations/site-visit",
          icon: <Building className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        },
        {
          title: "Holiday Requests",
          href: "/operations/holiday-requests",
          icon: <Calendar className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        },
        {
          title: "Bank Holiday",
          href: "/operations/bank-holiday",
          icon: <CalendarRange className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Customer Satisfaction",
          href: "/operations/customer-satisfaction",
          icon: <BadgeCheck className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Patrol Log",
          href: "/operations/patrol-log",
          icon: <ClipboardCheck className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        },
        {
          title: "Safe/Duress Words",
          href: "/operations/safe-duress-words",
          icon: <Key className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Officer Support",
          href: "/operations/officer-support",
          icon: <HelpCircle className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        },
        {
          title: "Officer Expenses",
          href: "/operations/officer-expenses",
          icon: <Wallet className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        }
      ]
    },
    {
      section: "Employee",
      items: [
        {
          title: "Uniform & Equipment",
          href: "/employee/uniform-equipment",
          icon: <Shirt className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        },
        {
          title: "Disciplinary",
          href: "/employee/disciplinary",
          icon: <AlertTriangle className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Diary",
          href: "/employee/diary",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer'],
        }
      ]
    },
    {
      section: "Management",
      items: [
        {
          title: "Customer Reporting",
          href: "/management/customer-reporting",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Manager Support",
          href: "/management/manager-support",
          icon: <Handshake className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Incidents Report",
          href: "/management/incidents-report",
          icon: <FileWarning className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        }
      ]
    },
    {
      section: "Compliance",
      items: [
        {
          title: "Contract Renewal",
          href: "/compliance/contract-renewal",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Password Register",
          href: "/compliance/password-register",
          icon: <Key className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "Asset Register",
          href: "/compliance/asset-register",
          icon: <Boxes className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        }
      ]
    },
    {
      section: "Recruitment",
      items: [
        {
          title: "Vetting",
          href: "/recruitment/vetting",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        },
        {
          title: "CBT",
          href: "/recruitment/cbt",
          icon: <BookOpen className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho'],
        }
      ]
    },
    {
      section: "Customer",
      items: [
        {
          title: "Daily Activity Report",
          href: "/customer/dar",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho', 'customer-site'],
        },
        {
          title: "Incident Graph",
          href: "/customer/incident-graph",
          icon: <BarChart2 className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho', 'customer-site'],
        },
        {
          title: "Incident Report",
          href: "/customer/incident-report",
          icon: <FileWarning className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho', 'customer-site'],
        },
        {
          title: "Satisfaction Reports",
          href: "/customer/satisfaction-reports",
          icon: <FileText className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho'],
        },
        {
          title: "Be Safe Be Secure Graph",
          href: "/customer/be-safe-be-secure-graph",
          icon: <ShieldCheck className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho'],
        }
      ]
    }
  ];

  // Handle role change
  const handleRoleChange = (roleId: string) => {
    if (isTestMode) {
      setTestRole(roleId);
    } else {
      setCurrentRole(roleId);
    }
  };

  // Toggle test mode
  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    if (!isTestMode) {
      setTestRole(currentRole);
    } else {
      setTestRole(null);
    }
  };

  // Get current role name
  const getCurrentRoleName = () => {
    const roleId = isTestMode && testRole ? testRole : currentRole;
    const role = userRoles.find(r => r.id === roleId);
    return role ? role.name : 'Select Role';
  };

  // Toggle mobile search
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };
  
  // Get the user's current role ID
  const getCurrentRoleId = () => {
    return isTestMode && testRole ? testRole : currentRole;
  };
  
  // Check if user has access to a navigation item
  const hasAccess = (item: NavItem) => {
    const roleId = getCurrentRoleId();
    return item.roles.includes(roleId || '');
  };

  // Handle navigation and close sheet
  const handleNavigate = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full md:bg-[#334155] lg:bg-white border-b md:border-slate-700 lg:border-gray-200">
      {/* Mobile Header */}
      <div className={COMMON_CLASSES.mobileHeader}>
        {/* Left: Hamburger Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={BUTTON_STYLES.ghost.mobile}
              aria-label="Menu"
            >
              <Menu className="h-10 w-10" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={COMMON_CLASSES.sheetContent}>
            <SheetHeader className="p-6 border-b border-blue-900 shrink-0">
              <SheetTitle className="text-left flex items-center justify-center text-white">
                <Logo variant="sheet" />
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto">
              {/* Role selector in mobile menu */}
              <div className="px-6 py-5 border-b border-blue-900">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full h-10 gap-1 bg-blue-900 text-white border-blue-800 justify-between hover:bg-blue-800 hover:text-white">
                      <span className="font-medium text-[15px]">Role: {getCurrentRoleName()}</span>
                      <ChevronDown className="h-5 w-5 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <RoleSelectorContent 
                    currentRole={currentRole}
                    testRole={testRole}
                    isTestMode={isTestMode}
                    handleRoleChange={handleRoleChange}
                    toggleTestMode={toggleTestMode}
                    userRoles={userRoles}
                  />
                </DropdownMenu>
              </div>
              
              <div className="px-5 py-4">
                <NavigationMenu 
                  navigationItems={navigationItems}
                  hasAccess={hasAccess}
                  handleNavigate={handleNavigate}
                />
              </div>
            </div>
            
            {/* User profile section at bottom of mobile menu */}
            <UserProfileSection />
          </SheetContent>
        </Sheet>
        
        {/* Center: Logo */}
        <Logo variant="mobile" containerClassName="w-65" />
        
        {/* Right: User Avatar */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <UserAvatar size="md" />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <UserProfileDropdown />
          </DropdownMenu>
        </div>
      </div>
      
      {/* Desktop/Tablet Header */}
      <div className={COMMON_CLASSES.desktopHeader}>
        {/* Left: Empty space to balance the layout (desktop only) */}
        <div className="w-64 hidden lg:block"></div>
        
        {/* Center: Logo for iPad (md screens) and Search for larger screens */}
        <div className="flex-1 flex justify-center items-center">
          {/* iPad/Tablet Header with hamburger menu - md screens only */}
          <div className="w-full md:flex lg:hidden justify-between items-center px-5">
            {/* Left: Hamburger Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="p-0 text-white hover:bg-slate-700"
                  aria-label="Menu"
                >
                  <Menu className="h-10 w-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 flex flex-col h-full bg-blue-950 text-white border-r-blue-900">
                <SheetHeader className="p-6 border-b border-blue-900 shrink-0">
                  <SheetTitle className="text-left flex items-center justify-center text-white">
                    <img 
                      src="/AdvantageOne.svg" 
                      alt="Advantage One"
                      className="h-17 w-auto" 
                    />
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto">
                  {/* Role selector in menu */}
                  <div className="px-6 py-5 border-b border-blue-900">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full h-10 gap-1 bg-blue-900 text-white border-blue-800 justify-between hover:bg-blue-800 hover:text-white">
                          <span className="font-medium text-[15px]">Role: {getCurrentRoleName()}</span>
                          <ChevronDown className="h-5 w-5 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <RoleSelectorContent 
                        currentRole={currentRole}
                        testRole={testRole}
                        isTestMode={isTestMode}
                        handleRoleChange={handleRoleChange}
                        toggleTestMode={toggleTestMode}
                        userRoles={userRoles}
                      />
                    </DropdownMenu>
                  </div>
                  
                  <div className="px-5 py-4">
                    <NavigationMenu 
                      navigationItems={navigationItems}
                      hasAccess={hasAccess}
                      handleNavigate={handleNavigate}
                    />
                  </div>
                </div>
                
                {/* User profile section at bottom of menu */}
                <UserProfileSection />
              </SheetContent>
            </Sheet>
            
            {/* Center: Logo */}
            <Logo variant="ipad" containerClassName="max-w-xs py-4" />
            
            {/* Right: Notifications and User */}
            <div className="flex items-center gap-4">
              <NotificationBell className="text-white hover:text-blue-200" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <UserAvatar size="md" showBorder={true} />
                    <div className="hidden md:block text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">David Ibanga</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">IT manager</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </DropdownMenuTrigger>
                <UserProfileDropdown />
              </DropdownMenu>
            </div>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden lg:block relative max-w-md w-full">
            <SearchInput />
          </div>
        </div>
        
        {/* Right Side Actions - Desktop only */}
        {/* 
          Desktop Actions Section
          - Only visible on lg screens
          - Contains: Role selector, Notifications, Theme toggle, User profile
          - Responsive spacing between items
          - Adapts styling based on theme
        */}
        <div className="hidden lg:flex items-center gap-2 md:gap-4">
          {/* Role Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 md:bg-blue-900 md:text-white md:border-blue-800 lg:bg-white lg:text-black lg:border-gray-200">
                <span className="font-medium">Role: {getCurrentRoleName()}</span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <RoleSelectorContent 
              currentRole={currentRole}
              testRole={testRole}
              isTestMode={isTestMode}
              handleRoleChange={handleRoleChange}
              toggleTestMode={toggleTestMode}
              userRoles={userRoles}
            />
          </DropdownMenu>

          {/* Notification Bell */}
          <Link 
            to="/action-calendar" 
            className="relative p-1 md:text-blue-200 md:hover:text-white lg:text-gray-600 lg:hover:text-gray-900 transition-colors"
            aria-label="Notifications - 3 unread"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[11px] font-medium text-white">
              3
            </span>
          </Link>

          {/* Theme Toggle */}
          <div className="md:text-blue-200 md:hover:text-white lg:text-gray-600 lg:hover:text-gray-900">
            <ThemeToggle />
          </div>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar size="md" showBorder={true} />
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">David Ibanga</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">IT manager</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <UserProfileDropdown />
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <>
          <div className="absolute top-16 left-0 right-0 p-2 bg-white border-b z-30 md:hidden">
            <SearchInput autoFocus />
          </div>
          <div 
            className="fixed inset-0 bg-black/20 z-20 md:hidden" 
            onClick={() => setIsSearchExpanded(false)}
          />
        </>
      )}
    </header>
  );
} 