// User data
export const USER_DATA = {
  name: "David Ibanga",
  email: "david.ibanga@example.com",
  role: "Administrator",
  avatar: "/A1logo1.png",
  initials: "DI"
} as const;

// Common button styles
export const BUTTON_STYLES = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
} as const;

// Common class names
export const COMMON_CLASSES = {
  mobileHeader: "flex h-18 items-center justify-between px-5 bg-[#334155] lg:hidden",
  desktopHeader: "hidden lg:flex h-20 items-center px-4 bg-[#334155]",
  sheetContent: "w-[340px] sm:w-[400px] p-0 flex flex-col h-full bg-blue-950 text-white border-r-blue-900",
  searchInput: "w-full pl-9 h-9 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
} as const;

// Navigation related constants
export const NOTIFICATION_COUNT = 3;
export const LOGO_SIZES = {
  mobile: "h-28",
  sheet: "h-32",
  ipad: "h-34",
  desktop: "h-20"
} as const;

export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "Home"
  },
  {
    title: "Administration",
    href: "/administration",
    icon: "Settings",
    children: [
      {
        title: "User Setup",
        href: "/administration/user-setup",
        description: "Manage user accounts and permissions"
      },
      {
        title: "Employee Registration",
        href: "/administration/employee-registration",
        description: "Register and manage employees"
      },
      {
        title: "Customer Setup",
        href: "/administration/customer-setup",
        description: "Manage customer accounts"
      },
      {
        title: "Stock Control",
        href: "/administration/stock-control",
        description: "Manage inventory and stock"
      }
    ]
  },
  {
    title: "CRM",
    href: "/crm",
    icon: "Users",
    children: [
      {
        title: "Contacts",
        href: "/crm/contacts",
        description: "Manage contacts and leads"
      },
      {
        title: "Deals",
        href: "/crm/deals",
        description: "Track deals and opportunities"
      },
      {
        title: "Pipeline",
        href: "/crm/pipeline",
        description: "View sales pipeline"
      },
      {
        title: "Tasks",
        href: "/crm/tasks",
        description: "Manage tasks and follow-ups"
      }
    ]
  },
  {
    title: "Recruitment",
    href: "/recruitment",
    icon: "UserPlus",
    children: [
      {
        title: "Vetting",
        href: "/recruitment/vetting",
        description: "Candidate vetting process"
      },
      {
        title: "CBT",
        href: "/recruitment/cbt",
        description: "Computer-based testing"
      },
      {
        title: "Take Test",
        href: "/recruitment/take-test",
        description: "Take assessment tests"
      },
      {
        title: "Test Session",
        href: "/recruitment/test-session",
        description: "Manage test sessions"
      }
    ]
  },
  {
    title: "Operations",
    href: "/operations",
    icon: "Activity",
    children: [
      {
        title: "Incident Report",
        href: "/operations/incident-report",
        description: "Report and track incidents"
      },
      {
        title: "Mystery Shopper",
        href: "/operations/mystery-shopper",
        description: "Mystery shopper program"
      },
      {
        title: "Site Visit",
        href: "/operations/site-visit",
        description: "Site inspection reports"
      }
    ]
  }
] 