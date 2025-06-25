import type { CustomerPage } from "@/types/customer"

export const CUSTOMER_PAGES: Record<string, CustomerPage> = {
  'daily-activity-report': {
    id: 'customer-daily-activity-report',
    title: 'Daily Activity Report',
    description: 'View and manage daily activity reports for this customer',
    enabled: true,
    requiredForTypes: ['static', 'gatehouse', 'retail'],
    path: '/customer/daily-activity-report',
    readOnly: false,
    category: 'activity',
    icon: 'Calendar'
  },
  'incident-graph': {
    id: 'customer-incident-graph',
    title: 'Incident Graph',
    description: 'Visual representation of incident trends and patterns',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/incident-graph',
    readOnly: true,
    category: 'incidents',
    icon: 'BarChart2'
  },
  'incident-report': {
    id: 'customer-incident-report',
    title: 'Incident Report',
    description: 'View and manage incident reports for this customer',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/incident-report',
    readOnly: false,
    category: 'incidents',
    icon: 'FileWarning'
  },
  'satisfaction-report': {
    id: 'customer-satisfaction-report',
    title: 'Satisfaction Reports',
    description: 'View customer satisfaction survey results and feedback',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/satisfaction-report',
    readOnly: true,
    category: 'satisfaction',
    icon: 'FileText'
  },
  'be-safe-be-secure': {
    id: 'customer-be-safe-be-secure',
    title: 'Be Safe Be Secure',
    description: 'View and manage security awareness and safety information',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/be-safe-be-secure',
    readOnly: false,
    category: 'safety',
    icon: 'ShieldCheck'
  },
  'officer-support': {
    id: 'customer-officer-support',
    title: 'Officer Support',
    description: 'Access support resources and information for security officers',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/officer-support',
    readOnly: false,
    category: 'support',
    icon: 'HelpCircle'
  },
  'reporting': {
    id: 'customer-reporting',
    title: 'Reporting',
    description: 'Access all reports and analytics for this customer',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/reporting',
    readOnly: true,
    category: 'reports',
    icon: 'FileText'
  },
  'views-config': {
    id: 'customer-views-config',
    title: 'Views Configuration',
    description: 'Configure custom views and dashboards for this customer',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/views-config',
    readOnly: false,
    category: 'settings',
    icon: 'Settings'
  }
}

export const getPagesByCustomerType = (customerType: string): CustomerPage[] => {
  return Object.values(CUSTOMER_PAGES).filter(page => 
    page.requiredForTypes.includes(customerType as any)
  )
}

export const getPagesByCategory = (category: CustomerPage['category']): CustomerPage[] => {
  return Object.values(CUSTOMER_PAGES).filter(page => page.category === category)
}

export const CUSTOMER_PAGE_CATEGORIES = {
  reporting: 'Reporting & Analytics',
  activity: 'Daily Activities',
  security: 'Security & Safety',
  support: 'Support Services'
} as const 