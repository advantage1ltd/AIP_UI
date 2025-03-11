import { Link } from "react-router-dom"
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
  Handshake,
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

interface SidebarNavigationProps {
  onNavigate?: () => void;
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
}

const NavItem = ({ to, icon, label, onClick, className }: NavItemProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    ;(e.target as HTMLElement).click()
  }
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onNavigate }) => {
  return (
    <div className="px-3 py-2">
      <div className="space-y-4">
        {/* Dashboard Button */}
        <div className="pl-5">
          <Button
            asChild
            className="w-[180px] bg-white hover:bg-white/90 text-black flex items-center justify-start gap-2 h-9 px-3 rounded-[20px]"
          >
            <Link to="/" onClick={onNavigate} className="flex items-center gap-2">
              <div className="bg-red-500/10 p-1.5 rounded-lg">
                <LayoutGrid className="h-[18px] w-[18px] text-red-500" />
              </div>
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          </Button>
        </div>

        <Link
          to="/action-calendar"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          )}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <Calendar className="h-4 w-4" />
          <span>Action Calendar</span>
        </Link>

        <Accordion type="multiple" className="space-y-1">
          {/* Administration Section */}
          <AccordionItem value="administration" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <UserCog className="h-4 w-4" />
              <span className="flex-1 text-left">Administration</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/administration/user-setup"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <User className="h-4 w-4" />
                  <span>User Setup</span>
                </Link>
                <Link
                  to="/administration/employee-registration"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Employee Registration</span>
                </Link>
                <Link
                  to="/administration/customer-setup"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Customer Setup</span>
                </Link>
                <Link
                  to="/administration/stock-control"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Store className="h-4 w-4" />
                  <span>Stock Control</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Operations Section */}
          <AccordionItem value="operations" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <Radio className="h-4 w-4" />
              <span className="flex-1 text-left">Operations</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/operations/incident-report"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileWarning className="h-4 w-4" />
                  <span>Incident Report</span>
                </Link>
                <Link
                  to="/operations/mystery-shopper"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileSearch className="h-4 w-4" />
                  <span>Mystery Shopper</span>
                </Link>
                <Link
                  to="/operations/site-visit"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Building className="h-4 w-4" />
                  <span>Site Visit</span>
                </Link>
                <Link
                  to="/operations/holiday-requests"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Holiday Requests</span>
                </Link>
                <Link
                  to="/operations/bank-holiday"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <CalendarRange className="h-4 w-4" />
                  <span>Bank Holiday</span>
                </Link>
                <Link
                  to="/operations/customer-satisfaction"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Customer Satisfaction</span>
                </Link>
                <Link
                  to="/operations/patrol-log"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Footprints className="h-4 w-4" />
                  <span>Patrol Log</span>
                </Link>
                <Link
                  to="/operations/safe-duress-words"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Key className="h-4 w-4" />
                  <span>Safe/Duress Words</span>
                </Link>
                <Link
                  to="/operations/officer-support"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Officer Support</span>
                </Link>
                <Link
                  to="/operations/officer-expenses"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Officer Expenses</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* CRM Section */}
          <AccordionItem value="crm" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <Handshake className="h-4 w-4" />
              <span className="flex-1 text-left">CRM</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/crm/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/crm/leads"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Leads</span>
                </Link>
                <Link
                  to="/crm/contacts"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Users className="h-4 w-4" />
                  <span>Contacts</span>
                </Link>
                <Link
                  to="/crm/deals"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Deals</span>
                </Link>
                <Link
                  to="/crm/pipeline"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Pipeline</span>
                </Link>
                <Link
                  to="/crm/tasks"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Tasks</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Recruitment Section */}
          <AccordionItem value="recruitment" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <GraduationCap className="h-4 w-4" />
              <span className="flex-1 text-left">Recruitment</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/recruitment/vetting"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileTextIcon className="h-4 w-4" />
                  <span>Vetting</span>
                </Link>
                <Link
                  to="/recruitment/cbt"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>CBT</span>
                </Link>         
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Employee Section */}
          <AccordionItem value="employee" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <User className="h-4 w-4" />
              <span className="flex-1 text-left">Employee</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/employee/uniform-equipment"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Shirt className="h-4 w-4" />
                  <span>Uniform & Equipment</span>
                </Link>
                <Link
                  to="/employee/disciplinary"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Disciplinary</span>
                </Link>
                <Link
                  to="/employee/diary"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <ScrollText className="h-4 w-4" />
                  <span>Diary</span>
                </Link>
                <Link
                  to="/employee/training"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Award className="h-4 w-4" />
                  <span>Training Record</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Management Section */}
          <AccordionItem value="management" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <BarChart2 className="h-4 w-4" />
              <span className="flex-1 text-left">Management</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/management/customer-reporting"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Customer Reporting</span>
                </Link>
                <Link
                  to="/management/manager-customer-report"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Manager Customer Report</span>
                </Link>
                <Link
                  to="/management/manager-support"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Manager Support</span>
                </Link>
                <Link
                  to="/management/incidents-report"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileWarning className="h-4 w-4" />
                  <span>Incidents Report</span>
                </Link>
                <Link
                  to="/management/officer-performance"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Award className="h-4 w-4" />
                  <span>Officer Performance</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Compliance Section */}
          <AccordionItem value="compliance" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <ShieldCheck className="h-4 w-4" />
              <span className="flex-1 text-left">Compliance</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">           
                <Link
                  to="/compliance/contract-renewal"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileText className="h-4 w-4" />
                  <span>Contract Renewal</span>
                </Link>
                <Link
                  to="/compliance/password-register"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Key className="h-4 w-4" />
                  <span>Password Register</span>
                </Link>
                <Link
                  to="/compliance/asset-register"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <Boxes className="h-4 w-4" />
                  <span>Asset Register</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Customer Section */}
          <AccordionItem value="customer" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline">
              <Users2 className="h-4 w-4" />
              <span className="flex-1 text-left">Customer</span>
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-0">
              <div className="ml-4 space-y-1">
                <Link
                  to="/customer/dar"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileText className="h-4 w-4" />
                  <span>Daily Activity Report</span>
                </Link>
                <Link
                  to="/customer/incident-graph"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Incident Graph</span>
                </Link>
                <Link
                  to="/customer/incident-report"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <FileWarning className="h-4 w-4" />
                  <span>Incident Report</span>
                </Link>
                <Link
                  to="/customer/be-safe-be-secure-graph"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Be Safe Be Secure Graph</span>
                </Link>
                <Link
                  to="/customer/officer-support"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Officer Support</span>
                </Link>
                <Link
                  to="/customer/satisfaction-reports"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Satisfaction Reports</span>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Settings Link */}
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          )}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <Cog className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
