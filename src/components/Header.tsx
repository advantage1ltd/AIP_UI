import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react"
import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuItem, 
	DropdownMenuLabel, 
	DropdownMenuSeparator, 
	DropdownMenuTrigger
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
	ShieldCheck,
	Boxes,
	GraduationCap,
	BookOpen,
	LayoutGrid,
	BarChart2,
	LayoutDashboard,
	UserPlus,
	DollarSign,
	GitBranch,
	CheckSquare
} from "lucide-react"
import { usePageAccess, PageAccessContext } from "@/contexts/PageAccessContext"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { USER_DATA, BUTTON_STYLES, COMMON_CLASSES } from "@/constants/header";
import { NotificationBell } from "./header/NotificationBell";
import { Logo } from "./header/Logo";
import { SearchInput } from "./header/SearchInput";
import { UserAvatar } from "./common/UserAvatar";
import { logout, getUser } from "@/services/auth"

// Define navigation items structure
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[]; // Which roles can access this item
}

// Header props interface
interface HeaderProps {
  onMobileMenuClick?: () => void;
}

// UserProfileDropdown component
const UserProfileDropdown = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

// NavigationMenu component
const NavigationMenu = ({ 
  navigationItems, 
  hasAccess, 
  handleNavigate 
}: {
  navigationItems: Array<{
    section: string;
    items: NavItem[];
  }>;
  hasAccess: (item: NavItem) => boolean;
  handleNavigate: () => void;
}) => (
  <Accordion type="multiple" defaultValue={navigationItems.map(section => section.section)} className="w-full">
    {navigationItems.map((section) => {
      const accessibleItems = section.items.filter(hasAccess);
      if (accessibleItems.length === 0) return null;
      
      return (
        <AccordionItem key={section.section} value={section.section} className="border-blue-900">
          <AccordionTrigger className="text-white hover:text-blue-200 hover:no-underline py-3">
            {section.section}
          </AccordionTrigger>
          <AccordionContent className="space-y-1 pt-2">
            {accessibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavigate}
                className="flex items-center gap-3 px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors"
              >
                {item.icon}
                <span className="text-sm">{item.title}</span>
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    })}
  </Accordion>
);

export function Header({ onMobileMenuClick }: HeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Try to get context, but handle gracefully if not available
  let pageAccessContext;
  try {
    pageAccessContext = React.useContext(PageAccessContext);
  } catch (error) {
    // Context not available
    pageAccessContext = undefined;
  }
  
  // If context is not available, return minimal header
  if (!pageAccessContext) {
    return (
      <header className="h-[var(--header-height)] border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between h-full px-4">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </header>
    );
  }
  
	const { currentRole } = pageAccessContext;
  
  const { theme } = useTheme();

  // Get authenticated user info
  const authenticatedUser = getUser();
  const isAuthenticated = !!authenticatedUser;

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
      section: "CRM",
      items: [
        {
          title: "Dashboard",
          href: "/crm/dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Leads",
          href: "/crm/leads",
          icon: <UserPlus className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Contacts",
          href: "/crm/contacts",
          icon: <Users className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Deals",
          href: "/crm/deals",
          icon: <DollarSign className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Pipeline",
          href: "/crm/pipeline",
          icon: <GitBranch className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'advantage-officer', 'customer-ho', 'customer-site'],
        },
        {
          title: "Tasks",
          href: "/crm/tasks",
          icon: <CheckSquare className="h-4 w-4" />,
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
          icon: <Building2 className="h-4 w-4" />,
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
          title: "Daily Activity Graphs",
          href: "/customer/be-safe-be-secure-graph",
          icon: <ShieldCheck className="h-4 w-4" />,
          roles: ['administrator', 'advantage-ho', 'customer-ho'],
        }
      ]
    }
  ];

	const getEffectiveRoleId = () => {
		if (isAuthenticated && authenticatedUser?.pageAccessRole) {
			return authenticatedUser.pageAccessRole.toLowerCase();
		}
		return currentRole?.toLowerCase() || null;
	};

  // Toggle mobile search
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };
  
  // Check if user has access to a navigation item
  const hasAccess = (item: NavItem) => {
		const roleId = getEffectiveRoleId();
		return roleId ? item.roles.includes(roleId) : false;
  };

  // Handle navigation and close sheet
  const handleNavigate = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-header-bg border-b border-header-border shadow-sm text-header-text">
      {/* Mobile Header */}
      <div className="w-full h-[80px] bg-header-bg flex lg:hidden justify-between items-center px-5 py-4">
        {/* Left: Hamburger Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-0 text-header-text hover:bg-white/10"
              aria-label="Menu"
            >
              <Menu className="h-10 w-10" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className={COMMON_CLASSES.sheetContent}>
            <SheetHeader className="p-6 border-b border-blue-900 shrink-0">
              <SheetTitle className="text-left flex items-center justify-center text-white">
                <img 
                  src="/AdvantageOne.svg" 
                  alt="Advantage One"
                  className="h-17 w-auto" 
                />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigation menu for accessing different sections of the Security Management application
              </SheetDescription>
            </SheetHeader>
            
						<div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4">
                <NavigationMenu 
                  navigationItems={navigationItems}
                  hasAccess={hasAccess}
                  handleNavigate={handleNavigate}
                />
              </div>
            </div>
            
            {/* User profile section at bottom of menu */}
            <div className="p-6 border-t border-blue-900 shrink-0">
              <div className="flex items-center gap-3">
                <UserAvatar size="md" showBorder={true} />
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {isAuthenticated ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'David Ibanga'}
                  </p>
                  <p className="text-xs text-blue-200">
                    {isAuthenticated ? authenticatedUser.role : 'IT manager'}
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo and Search Toggle */}
        <div className="flex items-center gap-4">
          {!isSearchExpanded && (
            <img 
              src="/AdvantageOne.svg" 
              alt="Advantage One"
              className="h-12 w-auto" 
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            className="text-header-text hover:bg-white/10"
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>

        {/* Right: Notifications and User Profile */}
        <div className="flex items-center gap-3 text-header-text">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar size="sm" showBorder={true} />
                <ChevronDown className="h-4 w-4 text-white/70" />
              </div>
            </DropdownMenuTrigger>
            <UserProfileDropdown />
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={COMMON_CLASSES.desktopHeader}>
        {/* Left: Logo */}
        <div className="flex items-center text-header-text">
          <Logo variant="desktop" />
        </div>
        
        {/* Center: Search */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative max-w-md w-full">
            <SearchInput />
          </div>
        </div>
        
		{/* Right: Notifications and User Profile */}
				<div className="flex items-center gap-4 text-header-text">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar size="md" showBorder={true} />
                <div className="text-sm">
                  <p className="font-medium text-header-text">
                    {isAuthenticated ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'David Ibanga'}
                  </p>
                  <p className="text-xs text-header-text/70">
                    {isAuthenticated ? authenticatedUser.role : 'IT manager'}
                  </p>
                </div>
								<ChevronDown className="h-4 w-4 text-header-text/70" />
              </div>
            </DropdownMenuTrigger>
            <UserProfileDropdown />
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-header-bg border-b border-header-border p-4 z-40">
          <SearchInput />
        </div>
      )}
    </header>
  )
} 