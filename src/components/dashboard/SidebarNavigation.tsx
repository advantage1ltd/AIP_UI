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

// Helper function to check if officer has customer reporting access
const getOfficerCustomerReportingAccess = (): boolean => {
  // Check localStorage for officer customer reporting setting
  // This can be configured in the Settings page
  const officerReportingEnabled = localStorage.getItem('officer_customer_reporting_enabled');
  return officerReportingEnabled === 'true';
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onNavigate, onMobileClose }) => {
  const { hasAccess, currentRole, isLoading } = usePageAccess();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="space-y-4">
          <div className="pl-5">
            <div className="w-[180px] h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-[20px]" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="px-3 py-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Please log in to view navigation
        </div>
      </div>
    );
  }
  
  const hasSectionAccess = (paths: string[]) => {
    return paths.some(path => hasAccess(path));
  };
  
  const adminPaths = [
    '/administration/user-setup',
    '/administration/employee-registration',
    '/administration/customer-setup',
    '/administration/stock-control',
    '/customer/views-config'
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
    '/management/manager-support',
    '/management/incidents-report',
    '/management/officer-performance'
  ];
  
  const customerPaths = [
    '/customer/daily-activity-report',
    '/customer/incident-graph',
    '/customer/incident-report',
    '/customer/satisfaction-report',
    '/customer/be-safe-be-secure',
    '/customer/daily-occurrence-book',
    '/customer/officer-support',
    '/customer/views-config'
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
  
  const isCustomerRole = currentRole === 'CustomerSiteManager' || currentRole === 'CustomerHOManager';
  const isAdministrator = currentRole === 'Administrator';
  const isOfficerRole = currentRole === 'AdvantageOneOfficer' || currentRole === 'AdvantageOneHOOfficer';
  
  const showAdminSection = !isCustomerRole && hasSectionAccess(adminPaths);
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

        {/* Customer Reporting as top-level navigation */}
        {(hasAccess('/management/customer-reporting') || (isOfficerRole && getOfficerCustomerReportingAccess())) && (
          <NavItem
            to="/management/customer-reporting"
            icon={<BarChart3 className="h-4 w-4" />}
            label="Customer Reporting"
            onClick={onNavigate}
          />
        )}

        <Accordion type="multiple" className="space-y-2">
          {showAdminSection && (
            <AccordionItem value="admin">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  <span>Administration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
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
                    icon={<Building className="h-4 w-4" />}
                    label="Customer Setup"
                    onClick={onNavigate}
                  />
                )}
                {hasAccess('/administration/stock-control') && (
                  <NavItem
                    to="/administration/stock-control"
                    icon={<Boxes className="h-4 w-4" />}
                    label="Stock Control"
                    onClick={onNavigate}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {showCrmSection && (
            <AccordionItem value="crm">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  <span>CRM</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
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
                    icon={<Users2 className="h-4 w-4" />}
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showOperationsSection && (
            <AccordionItem value="operations">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                  <span>Operations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                  {hasAccess('/operations/incident-report') && (
                    <NavItem
                      to="/operations/incident-report"
                    icon={<AlertTriangle className="h-4 w-4" />}
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showEmployeeSection && (
            <AccordionItem value="employee">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                  <span>Employee</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showManagementSection && (
            <AccordionItem value="management">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                  <span>Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                  {hasAccess('/management/manager-support') && (
                    <NavItem
                      to="/management/manager-support"
                    icon={<Building className="h-4 w-4" />}
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showComplianceSection && (
            <AccordionItem value="compliance">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                  <span>Compliance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showRecruitmentSection && (
            <AccordionItem value="recruitment">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                  <span>Recruitment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
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
              </AccordionContent>
            </AccordionItem>
          )}

          {showCustomerSection && (
            <AccordionItem value="customer">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                  <span>Customer</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pt-1">
                  {hasAccess('/customer/daily-activity-report') && (
                    <NavItem
                      to="/customer/daily-activity-report"
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
                {hasAccess('/customer/satisfaction-report') && (
                    <NavItem
                    to="/customer/satisfaction-report"
                      icon={<FileText className="h-4 w-4" />}
                      label="Satisfaction Reports"
                      onClick={onNavigate}
                    />
                  )}
                {hasAccess('/customer/be-safe-be-secure') && (
                    <NavItem
                    to="/customer/be-safe-be-secure"
                      icon={<ShieldCheck className="h-4 w-4" />}
                    label="Daily Activity Graphs"
                      onClick={onNavigate}
                    />
                  )}
                  {hasAccess('/customer/daily-occurrence-book') && (
                    <NavItem
                      to="/customer/daily-occurrence-book"
                      icon={<BookOpen className="h-4 w-4" />}
                      label="Daily Occurrence Book (DOB)"
                      onClick={onNavigate}
                    />
                  )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {isAdministrator && hasAccess('/settings') && (
          <NavItem
            to="/settings"
            icon={<SettingsIcon className="h-4 w-4" />}
            label="Settings"
            onClick={onNavigate}
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};