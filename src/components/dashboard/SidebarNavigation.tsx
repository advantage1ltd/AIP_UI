import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Settings as SettingsIcon,
  LayoutGrid,
  Calendar,
  Users,
  Radio,
  User,
  FileText,
  Building,
  ShieldCheck,
  Key,
  Briefcase,
  GraduationCap,
  CalendarRange,
  Shirt,
  BookOpen,
  UserCog,
  Boxes,
  ScrollText,
  UserCheck,
  CircleDollarSign,
  MessageSquare,
  Footprints,
  BadgeCheck,
  FileQuestion,
  FileWarning,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Store,
  Gauge,
  Bell,
  FileSearch,
  ClipboardCheck,
  UserPlus,
  Building2,
  Clock,
  Award,
  HardHat,
  FileSpreadsheet,
  FileText as FileTextIcon,
  AlertTriangle,
  Wallet,
  HelpCircle,
  Cog,
  BarChart2,
  CheckSquare,
  LayoutDashboard,
  Users as Users2,
  DollarSign,
  GitBranch,
  Receipt,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { usePageAccess } from "@/contexts/PageAccessContext"

interface SidebarNavigationProps {
  onNavigate?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
}

const NavItem = ({ to, icon, label, onClick, className }: NavItemProps) => {
  const { hasAccess } = usePageAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (!hasAccess(to)) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(to);
      onClick?.();
    }
  }

  return (
    <a
      href={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onNavigate, onMobileClose }) => {
  const { hasAccess } = usePageAccess();
  const navigate = useNavigate();
  const location = useLocation();
  
  const hasSectionAccess = (paths: string[]) => {
    return paths.some(path => hasAccess(path));
  };
  
  const adminPaths = [
    '/administration/user-setup',
    '/administration/employee-registration',
    '/administration/customer-setup',
    '/administration/stock-control'
  ];
  
  const operationsPaths = [
    '/operations/incident-report',
    '/operations/mystery-shopper',
    '/operations/site-visit',
    '/operations/holiday-requests',
    '/operations/bank-holiday',
    '/operations/customer-satisfaction',
    '/operations/patrol-log',
    '/operations/safe-duress-words',
    '/operations/officer-support',
    '/operations/officer-expenses'
  ];
  
  const employeePaths = [
    '/employee/uniform-equipment',
    '/employee/disciplinary',
    '/employee/diary'
  ];
  
  const managementPaths = [
    '/management/customer-reporting',
    '/management/manager-support',
    '/management/incidents-report',
    '/management/officer-performance'
  ];
  
  const customerPaths = [
    '/customer/dar',
    '/customer/incident-graph',
    '/customer/incident-report',
    '/customer/satisfaction-reports',
    '/customer/be-safe-be-secure-graph'
  ];
  
  const compliancePaths = [
    '/compliance/contract-renewal',
    '/compliance/password-register',
    '/compliance/asset-register'
  ];
  
  const recruitmentPaths = [
    '/recruitment/vetting',
    '/recruitment/cbt',
    '/recruitment/take-test'
  ];
  
  const crmPaths = [
    '/crm/dashboard',
    '/crm/leads',
    '/crm/contacts',
    '/crm/deals',
    '/crm/pipeline',
    '/crm/tasks'
  ];
  
  const showAdminSection = hasSectionAccess(adminPaths);
  const showOperationsSection = hasSectionAccess(operationsPaths);
  const showEmployeeSection = hasSectionAccess(employeePaths);
  const showManagementSection = hasSectionAccess(managementPaths);
  const showCustomerSection = hasSectionAccess(customerPaths);
  const showComplianceSection = hasSectionAccess(compliancePaths);
  const showRecruitmentSection = hasSectionAccess(recruitmentPaths);
  const showCrmSection = hasSectionAccess(crmPaths);

  const handleKeyDown = (to: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(to);
      onNavigate?.();
      onMobileClose?.();
    }
  };

  const handleNavigation = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onNavigate?.();
    onMobileClose?.();
  }

  return (
    <div className="px-3 py-2">
      <div className="space-y-4">
        {hasAccess('/dashboard') && (
          <div className="pl-5">
            <Button
              asChild
              className={cn(
                "w-[180px] bg-white hover:bg-white/90 text-black flex items-center justify-start gap-2 h-9 px-3 rounded-[20px]",
                location.pathname === "/" && "bg-white/90"
              )}
            >
              <a 
                href="/" 
                onClick={handleNavigation("/")} 
                onKeyDown={handleKeyDown("/")}
                className="flex items-center gap-2"
              >
                <div className="bg-red-500/10 p-1.5 rounded-lg">
                  <LayoutGrid className="h-[18px] w-[18px] text-red-500" />
                </div>
                <span className="text-xs font-medium">Dashboard</span>
              </a>
            </Button>
          </div>
        )}

        {hasAccess('/action-calendar') && (
          <a
            href="/action-calendar"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              location.pathname === "/action-calendar" && "bg-accent text-accent-foreground"
            )}
            onClick={handleNavigation("/action-calendar")}
            onKeyDown={handleKeyDown("/action-calendar")}
            tabIndex={0}
          >
            <Calendar className="h-4 w-4" />
            <span>Action Calendar</span>
          </a>
        )}

        <Accordion type="single" defaultValue={["crm"]} className="space-y-1">
          {showCrmSection && (
            <AccordionItem value="crm" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <Building2 className="h-4 w-4" />
                <span className="flex-1 text-left">CRM</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/crm/dashboard') && (
                    <NavItem
                      to="/crm/dashboard"
                      icon={<LayoutDashboard className="h-4 w-4" />}
                      label="Dashboard"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/crm/leads') && (
                    <NavItem
                      to="/crm/leads"
                      icon={<UserPlus className="h-4 w-4" />}
                      label="Leads"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/crm/contacts') && (
                    <NavItem
                      to="/crm/contacts"
                      icon={<Users className="h-4 w-4" />}
                      label="Contacts"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/crm/deals') && (
                    <NavItem
                      to="/crm/deals"
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Deals"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/crm/pipeline') && (
                    <NavItem
                      to="/crm/pipeline"
                      icon={<GitBranch className="h-4 w-4" />}
                      label="Pipeline"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/crm/tasks') && (
                    <NavItem
                      to="/crm/tasks"
                      icon={<CheckSquare className="h-4 w-4" />}
                      label="Tasks"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showAdminSection && (
            <AccordionItem value="administration" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <UserCog className="h-4 w-4" />
                <span className="flex-1 text-left">Administration</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/administration/user-setup') && (
                    <NavItem
                      to="/administration/user-setup"
                      icon={<User className="h-4 w-4" />}
                      label="User Setup"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/administration/employee-registration') && (
                    <NavItem
                      to="/administration/employee-registration"
                      icon={<UserPlus className="h-4 w-4" />}
                      label="Employee Registration"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/administration/customer-setup') && (
                    <NavItem
                      to="/administration/customer-setup"
                      icon={<Building2 className="h-4 w-4" />}
                      label="Customer Setup"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/administration/stock-control') && (
                    <NavItem
                      to="/administration/stock-control"
                      icon={<Store className="h-4 w-4" />}
                      label="Stock Control"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showOperationsSection && (
            <AccordionItem value="operations" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <Radio className="h-4 w-4" />
                <span className="flex-1 text-left">Operations</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/operations/incident-report') && (
                    <NavItem
                      to="/operations/incident-report"
                      icon={<FileWarning className="h-4 w-4" />}
                      label="Incident Report"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/mystery-shopper') && (
                    <NavItem
                      to="/operations/mystery-shopper"
                      icon={<FileSearch className="h-4 w-4" />}
                      label="Mystery Shopper"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/site-visit') && (
                    <NavItem
                      to="/operations/site-visit"
                      icon={<Building className="h-4 w-4" />}
                      label="Site Visit"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/holiday-requests') && (
                    <NavItem
                      to="/operations/holiday-requests"
                      icon={<Calendar className="h-4 w-4" />}
                      label="Holiday Requests"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/bank-holiday') && (
                    <NavItem
                      to="/operations/bank-holiday"
                      icon={<CalendarRange className="h-4 w-4" />}
                      label="Bank Holiday"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/customer-satisfaction') && (
                    <NavItem
                      to="/operations/customer-satisfaction"
                      icon={<BadgeCheck className="h-4 w-4" />}
                      label="Customer Satisfaction"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/patrol-log') && (
                    <NavItem
                      to="/operations/patrol-log"
                      icon={<ClipboardCheck className="h-4 w-4" />}
                      label="Patrol Log"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/safe-duress-words') && (
                    <NavItem
                      to="/operations/safe-duress-words"
                      icon={<Key className="h-4 w-4" />}
                      label="Safe/Duress Words"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/officer-support') && (
                    <NavItem
                      to="/operations/officer-support"
                      icon={<HelpCircle className="h-4 w-4" />}
                      label="Officer Support"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/operations/officer-expenses') && (
                    <NavItem
                      to="/operations/officer-expenses"
                      icon={<Wallet className="h-4 w-4" />}
                      label="Officer Expenses"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showEmployeeSection && (
            <AccordionItem value="employee" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <Users2 className="h-4 w-4" />
                <span className="flex-1 text-left">Employee</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/employee/uniform-equipment') && (
                    <NavItem
                      to="/employee/uniform-equipment"
                      icon={<Shirt className="h-4 w-4" />}
                      label="Uniform & Equipment"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/employee/disciplinary') && (
                    <NavItem
                      to="/employee/disciplinary"
                      icon={<AlertTriangle className="h-4 w-4" />}
                      label="Disciplinary"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/employee/diary') && (
                    <NavItem
                      to="/employee/diary"
                      icon={<FileTextIcon className="h-4 w-4" />}
                      label="Diary"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showManagementSection && (
            <AccordionItem value="management" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <BarChart3 className="h-4 w-4" />
                <span className="flex-1 text-left">Management</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/management/customer-reporting') && (
                    <NavItem
                      to="/management/customer-reporting"
                      icon={<FileText className="h-4 w-4" />}
                      label="Customer Reporting"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/management/manager-support') && (
                    <NavItem
                      to="/management/manager-support"
                      icon={<Building2 className="h-4 w-4" />}
                      label="Manager Support"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/management/incidents-report') && (
                    <NavItem
                      to="/management/incidents-report"
                      icon={<FileWarning className="h-4 w-4" />}
                      label="Incidents Report"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/management/officer-performance') && (
                    <NavItem
                      to="/management/officer-performance"
                      icon={<UserCheck className="h-4 w-4" />}
                      label="Officer Performance"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showComplianceSection && (
            <AccordionItem value="compliance" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <ShieldCheck className="h-4 w-4" />
                <span className="flex-1 text-left">Compliance</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/compliance/contract-renewal') && (
                    <NavItem
                      to="/compliance/contract-renewal"
                      icon={<FileText className="h-4 w-4" />}
                      label="Contract Renewal"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/compliance/password-register') && (
                    <NavItem
                      to="/compliance/password-register"
                      icon={<Key className="h-4 w-4" />}
                      label="Password Register"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/compliance/asset-register') && (
                    <NavItem
                      to="/compliance/asset-register"
                      icon={<Boxes className="h-4 w-4" />}
                      label="Asset Register"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showRecruitmentSection && (
            <AccordionItem value="recruitment" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <GraduationCap className="h-4 w-4" />
                <span className="flex-1 text-left">Recruitment</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/recruitment/vetting') && (
                    <NavItem
                      to="/recruitment/vetting"
                      icon={<FileTextIcon className="h-4 w-4" />}
                      label="Vetting"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/recruitment/cbt') && (
                    <NavItem
                      to="/recruitment/cbt"
                      icon={<BookOpen className="h-4 w-4" />}
                      label="CBT"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/recruitment/take-test') && (
                    <NavItem
                      to="/recruitment/take-test"
                      icon={<FileQuestion className="h-4 w-4" />}
                      label="Take Test"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {showCustomerSection && (
            <AccordionItem value="customer" className="border-none">
              <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
                <Building className="h-4 w-4" />
                <span className="flex-1 text-left">Customer</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-0">
                <div className="ml-4 space-y-1">
                  {hasAccess('/customer/dar') && (
                    <NavItem
                      to="/customer/dar"
                      icon={<FileText className="h-4 w-4" />}
                      label="Daily Activity Report"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/customer/incident-graph') && (
                    <NavItem
                      to="/customer/incident-graph"
                      icon={<BarChart2 className="h-4 w-4" />}
                      label="Incident Graph"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/customer/incident-report') && (
                    <NavItem
                      to="/customer/incident-report"
                      icon={<FileWarning className="h-4 w-4" />}
                      label="Incident Report"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/customer/satisfaction-reports') && (
                    <NavItem
                      to="/customer/satisfaction-reports"
                      icon={<FileText className="h-4 w-4" />}
                      label="Satisfaction Reports"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/customer/be-safe-be-secure-graph') && (
                    <NavItem
                      to="/customer/be-safe-be-secure-graph"
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label="Be Safe Be Secure Graph"
                      onClick={onNavigate}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {hasAccess('/settings') && (
          <div className="px-2 pt-4">
            <a
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white",
                location.pathname === "/settings" && "bg-blue-700"
              )}
              onClick={handleNavigation("/settings")}
              onKeyDown={handleKeyDown("/settings")}
              tabIndex={0}
            >
              <Cog className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}