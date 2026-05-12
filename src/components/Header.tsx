/**
 * Top header with navigation, search, and user menu.
 * Flow: auth-aware actions → global search entry → profile and sign-out menu.
 */
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import React, { useState, useCallback } from "react"
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
	CheckSquare,
	Cog,
	FileQuestion,
	TrendingUp
} from "lucide-react"
import { usePageAccess, PageAccessContext } from "@/contexts/PageAccessContext"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { BUTTON_STYLES, COMMON_CLASSES } from "@/constants/header";
import { NotificationBell } from "./header/NotificationBell";
import { Logo } from "./header/Logo";
import { SearchInput } from "./header/SearchInput";
import { UserAvatar } from "./common/UserAvatar";
import { logout, getUser } from "@/services/auth"
import { harmonizeRole, roleDisplayName } from '@/utils/roles'

// Define navigation items structure
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}


// Header props interface
interface HeaderProps {
  onMobileMenuClick?: () => void;
}

// UserProfileDropdown component
const UserProfileDropdown = ({ canAccessSettings }: { canAccessSettings: boolean }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/profile" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>
      </DropdownMenuItem>
      {canAccessSettings && (
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
      )}
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
  handleNavigate,
	currentPath
}: {
  navigationItems: Array<{
    section: string;
    items: NavItem[];
  }>;
  hasAccess: (item: NavItem) => boolean;
  handleNavigate: () => void;
	currentPath: string;
}) => (
	(() => {
		const mainSection = navigationItems.find(section => section.section === 'Quick Access')
		const moduleSections = navigationItems.filter(section => section.section !== 'Quick Access')

		const iconSvgProps = (
			isActive: boolean
		): Partial<React.SVGProps<SVGSVGElement>> => ({
			className: cn('h-5 w-5', isActive ? 'text-red-100 fill-current' : 'text-slate-300'),
			strokeWidth: isActive ? 1.5 : 2,
			fill: isActive ? 'currentColor' : 'none',
		})

		const renderIcon = (icon: React.ReactNode, isActive: boolean) => {
			if (!React.isValidElement<React.SVGProps<SVGSVGElement>>(icon)) return icon
			return React.cloneElement(icon, iconSvgProps(isActive))
		}

		const renderLink = (item: NavItem) => {
			const normalizedPath = item.href.split('?')[0]
			const isActive = currentPath === normalizedPath

			return (
				<Link
					key={item.href}
					to={item.href}
					onClick={handleNavigate}
					aria-current={isActive ? 'page' : undefined}
					className={cn(
						'flex items-center gap-3 rounded-md border-l-4 px-3 py-2 text-sm transition-colors',
						isActive
							? 'border-red-500 bg-slate-700 text-white font-semibold'
							: 'border-transparent text-slate-300 hover:bg-slate-700 hover:text-white'
					)}
				>
					{renderIcon(item.icon, isActive)}
					<span>{item.title}</span>
				</Link>
			)
		}

		return (
			<div className="space-y-5">
				{mainSection && mainSection.items.filter(hasAccess).length > 0 && (
					<div className="space-y-2">
						<div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Main</div>
						<div className="space-y-1">
							{mainSection.items.filter(hasAccess).map(renderLink)}
						</div>
					</div>
				)}

				<Accordion
					type="multiple"
					defaultValue={moduleSections.map(section => section.section)}
					className="w-full"
				>
					{moduleSections.map((section) => {
						const accessibleItems = section.items.filter(hasAccess)
						if (accessibleItems.length === 0) return null

						return (
							<AccordionItem key={section.section} value={section.section} className="border-slate-700">
								<AccordionTrigger className="text-slate-100 hover:text-white hover:no-underline py-3">
									{section.section}
								</AccordionTrigger>
								<AccordionContent className="space-y-1 pt-2">
									{accessibleItems.map(renderLink)}
								</AccordionContent>
							</AccordionItem>
						)
					})}
				</Accordion>
			</div>
		)
	})()
);

export function Header({ onMobileMenuClick }: HeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate()
	const pageAccessContext = React.useContext(PageAccessContext);
	const authenticatedUser = getUser();
	const isAuthenticated = !!authenticatedUser;
	const effectiveRoleForUi =
		authenticatedUser?.pageAccessRole ?? authenticatedUser?.role ?? null;
	const profileRoleLabel =
		isAuthenticated && effectiveRoleForUi
			? roleDisplayName(effectiveRoleForUi)
			: 'IT manager';
	const canAccessSettings = harmonizeRole(effectiveRoleForUi) === 'administrator';
	const currentRole = pageAccessContext?.currentRole ?? null;
	const pageHasAccess = pageAccessContext?.hasAccess ?? (() => false);

	const mobileNavItemVisible = useCallback(
		(item: NavItem) => {
			const raw =
				isAuthenticated && authenticatedUser?.pageAccessRole
					? authenticatedUser.pageAccessRole
					: (authenticatedUser?.role ?? currentRole ?? null)
			const canonicalRole = raw ? harmonizeRole(raw) : null
			if (!canonicalRole) return false
			if (canonicalRole === 'administrator') return true
			const path = item.href.split('?')[0]
			return pageHasAccess(path)
		},
		[
			isAuthenticated,
			authenticatedUser?.pageAccessRole,
			authenticatedUser?.role,
			currentRole,
			pageHasAccess,
		],
	)

  // If context is not available, return minimal header
  if (!pageAccessContext) {
    return (
      <header className="h-[var(--header-height)] border-b border-border bg-[hsl(var(--header-bg))]/95 text-[hsl(var(--header-text))] backdrop-blur">
        <div className="flex items-center justify-between h-full px-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </header>
    );
  }

  // Define navigation sections to match SidebarNavigation
  const navigationItems = [
    {
      section: "Quick Access",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
          title: "Action Calendar",
          href: "/action-calendar",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Customer Reporting",
          href: "/management/customer-reporting",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          title: "Data Analytics Hub",
          href: "/analytics/data-analytics-hub",
          icon: <BarChart4 className="h-4 w-4" />,
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
        },
        {
          title: "CRM Contacts",
          href: "/crm/contacts",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          title: "Sales Pipeline",
          href: "/crm/pipeline",
          icon: <GitBranch className="h-4 w-4" />,
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
        },
        {
          title: "Employee Registration",
          href: "/administration/employee-registration",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Customer Setup",
          href: "/administration/customer-setup",
          icon: <Building2 className="h-4 w-4" />,
        },
        {
          title: "Customer Page Settings",
          href: "/administration/customer-page-settings",
          icon: <Cog className="h-4 w-4" />,
        },
        {
          title: "Stock Control",
          href: "/administration/stock-control",
          icon: <Store className="h-4 w-4" />,
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
        },
        {
          title: "Site Visit",
          href: "/operations/site-visit",
          icon: <Building className="h-4 w-4" />,
        },
        {
          title: "Holiday Requests",
          href: "/operations/holiday-requests",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Bank Holiday",
          href: "/operations/bank-holiday",
          icon: <CalendarRange className="h-4 w-4" />,
        },
        {
          title: "Customer Satisfaction",
          href: "/operations/customer-satisfaction",
          icon: <BadgeCheck className="h-4 w-4" />,
        },
        {
          title: "Safe/Duress Words",
          href: "/operations/safe-duress-words",
          icon: <Key className="h-4 w-4" />,
        },
        {
          title: "Officer Support",
          href: "/operations/officer-support",
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          title: "Officer Expenses",
          href: "/operations/officer-expenses",
          icon: <Wallet className="h-4 w-4" />,
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
        },
        {
          title: "Disciplinary",
          href: "/employee/disciplinary",
          icon: <AlertTriangle className="h-4 w-4" />,
        },
        {
          title: "Diary",
          href: "/employee/diary",
          icon: <FileText className="h-4 w-4" />,
        }
      ]
    },
    {
      section: "Management",
      items: [
        {
          title: "Officer Performance",
          href: "/management/officer-performance",
          icon: <CheckSquare className="h-4 w-4" />,
        },
        {
          title: "Manager Support",
          href: "/management/manager-support",
          icon: <Building2 className="h-4 w-4" />,
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
        },
        {
          title: "Password Register",
          href: "/compliance/password-register",
          icon: <Key className="h-4 w-4" />,
        },
        {
          title: "Asset Register",
          href: "/compliance/asset-register",
          icon: <Boxes className="h-4 w-4" />,
        }
      ]
    },
    {
      section: "Recruitment",
      items: [
        {
          title: "CBT",
          href: "/recruitment/cbt",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          title: "Take Test",
          href: "/recruitment/take-test",
          icon: <FileQuestion className="h-4 w-4" />,
        }
      ]
    },
    {
      section: "Customer",
      items: [
        {
          title: "Daily Activity Report",
          href: "/customer/daily-activity-report",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Daily Occurrence Book",
          href: "/customer/daily-occurrence-book",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          title: "Daily Activity Report Graph",
          href: "/customer/be-safe-be-secure",
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          title: "Incident Graph",
          href: "/customer/incident-graph",
          icon: <BarChart2 className="h-4 w-4" />,
        },
        {
          title: "Incident Report",
          href: "/customer/incident-report",
          icon: <FileWarning className="h-4 w-4" />,
        },
        {
          title: "Satisfaction Reports",
          href: "/customer/satisfaction-report",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Crime Intelligence",
          href: "/customer/crime-intelligence",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: "Officer Support",
          href: "/customer/officer-support",
          icon: <HelpCircle className="h-4 w-4" />,
        }
      ]
    }
  ];

  // Handle navigation and close sheet
  const handleNavigate = () => {
    setIsSheetOpen(false);
  };

	const handleMobileLogout = () => {
		logout();
		setIsSheetOpen(false);
		navigate('/login');
	};

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--header-border))] bg-[hsl(var(--header-bg))]/95 text-[hsl(var(--header-text))] backdrop-blur-md shadow-[0_8px_26px_-18px_rgba(15,23,42,0.45)]">
      {/* Mobile & Tablet Header */}
      <div className="w-full min-h-[72px] sm:min-h-[80px] bg-gradient-to-r from-transparent via-slate-100/70 to-transparent dark:via-slate-800/40 flex lg:hidden items-center px-3 sm:px-4">
        {/* Left: Hamburger Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-0 text-foreground hover:bg-accent"
              aria-label="Menu"
            >
              <Menu className="h-9 w-9 sm:h-10 sm:w-10" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className={COMMON_CLASSES.sheetContent}>
            <SheetHeader className="p-4 border-b border-slate-700 shrink-0">
              <SheetTitle className="text-left flex items-center justify-center text-white">
                <img 
                  src="/AdvantageOne.svg" 
                  alt="Advantage One"
                  className="h-12 w-auto bg-transparent object-contain" 
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
                  hasAccess={mobileNavItemVisible}
                  handleNavigate={handleNavigate}
									currentPath={location.pathname}
                />
              </div>
            </div>

						<div className="border-t border-slate-700 px-5 py-4">
							<div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</div>
							<div className="mt-3 space-y-1">
								{canAccessSettings && (
									<Link
										to="/settings"
										onClick={handleNavigate}
										className="flex items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
									>
										<Settings className="h-5 w-5 text-slate-300" />
										<span>Settings</span>
									</Link>
								)}
								<button
									type="button"
									onClick={handleMobileLogout}
									className="flex w-full items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
								>
									<LogOut className="h-5 w-5 text-slate-300" />
									<span>Logout</span>
								</button>
							</div>
						</div>

            {/* User profile section at bottom of menu */}
            <div className="p-6 border-t border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <UserAvatar size="md" showBorder={true} />
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {isAuthenticated ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'David Ibanga'}
                  </p>
                  <p className="text-xs text-slate-300">
                    {profileRoleLabel}
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <div className="flex items-center justify-center flex-1">
          <img 
            src="/AdvantageOne.svg" 
            alt="Advantage One"
            className="h-12 sm:h-14 w-auto max-w-[190px] sm:max-w-[240px] object-contain"
          />
        </div>

        {/* Right: Notifications and User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-foreground">
          <NotificationBell />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar size="sm" showBorder={true} />
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </div>
            </DropdownMenuTrigger>
            <UserProfileDropdown canAccessSettings={canAccessSettings} />
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden h-[88px] items-center bg-gradient-to-r from-transparent via-slate-100/60 to-transparent dark:via-slate-800/35 px-6 lg:flex">
        {/* Left: Logo */}
        <div className="flex items-center text-foreground">
          <Logo variant="desktop" />
        </div>
        
        {/* Center: Search */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative max-w-md w-full">
            <SearchInput />
          </div>
        </div>
        
		{/* Right: Notifications and User Profile */}
				<div className="flex items-center gap-4 text-foreground">
          <NotificationBell />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar size="md" showBorder={true} />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {isAuthenticated ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` : 'David Ibanga'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profileRoleLabel}
                  </p>
                </div>
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <UserProfileDropdown canAccessSettings={canAccessSettings} />
          </DropdownMenu>
        </div>
      </div>

    </header>
  )
} 