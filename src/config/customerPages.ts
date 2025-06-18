import type { CustomerPage } from "@/types/customer"

export const CUSTOMER_PAGES: Record<string, CustomerPage> = {
  'daily-activity': {
    id: 'daily-activity',
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
    id: 'incident-graph',
    title: 'Incident Graph',
    description: 'Visual representation of incident trends and patterns',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/incident-graph',
    readOnly: true,
    sourceOperationPath: '/operations/incident-report',
    category: 'reporting',
    icon: 'BarChart3'
  },
  'incident-report': {
    id: 'incident-report',
    title: 'Incident Report',
    description: 'View and manage incident reports for this customer',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'mobile-patrol', 'keyholding-alarm-response', 'gatehouse'],
    path: '/customer/incident-report',
    readOnly: false,
    category: 'reporting',
    icon: 'AlertTriangle'
  },
  'customer-satisfaction': {
    id: 'customer-satisfaction',
    title: 'Satisfaction Reports',
    description: 'View customer satisfaction survey results and feedback',
    enabled: true,
    requiredForTypes: ['event', 'static', 'retail', 'gatehouse'],
    path: '/customer/satisfaction-report',
    readOnly: true,
    sourceOperationPath: '/operations/customer-satisfaction',
    category: 'reporting',
    icon: 'MessageSquare'
  },
  'be-safe-be-secure': {
    id: 'be-safe-be-secure',
    title: 'Be Safe Be Secure Graph',
    description: 'Security metrics and performance indicators',
    enabled: true,
    requiredForTypes: ['static', 'retail', 'gatehouse'],
    path: '/customer/be-safe-be-secure',
    readOnly: true,
    category: 'security',
    icon: 'Shield'
  },
  'officer-support': {
    id: 'officer-support',
    title: 'Officer Support',
    description: 'View and manage officer support requests',
    enabled: true,
    requiredForTypes: ['static', 'retail', 'gatehouse', 'mobile-patrol'],
    path: '/customer/officer-support',
    readOnly: false,
    category: 'support',
    icon: 'UserCheck'
  },
  'patrol-log': {
    id: 'patrol-log',
    title: 'Patrol Log Reports',
    description: 'View patrol log entries and route tracking',
    enabled: true,
    requiredForTypes: ['mobile-patrol', 'keyholding-alarm-response'],
    path: '/customer/patrol-log',
    readOnly: true,
    sourceOperationPath: '/operations/patrol-log',
    category: 'activity',
    icon: 'Footprints'
  },
  'site-visit-reports': {
    id: 'site-visit-reports',
    title: 'Site Visit Reports',
    description: 'Detailed site visit reports and assessments',
    enabled: true,
    requiredForTypes: ['static', 'retail', 'gatehouse'],
    path: '/customer/site-visit-reports',
    readOnly: true,
    sourceOperationPath: '/operations/site-visit',
    category: 'reporting',
    icon: 'Building'
  },
  'keyholding-logs': {
    id: 'keyholding-logs',
    title: 'Keyholding & Alarm Response',
    description: 'Keyholding services and alarm response logs',
    enabled: true,
    requiredForTypes: ['keyholding-alarm-response'],
    path: '/customer/keyholding-logs',
    readOnly: true,
    category: 'security',
    icon: 'Key'
  },
  'event-briefings': {
    id: 'event-briefings',
    title: 'Event Briefings & Reports',
    description: 'Event security briefings and post-event reports',
    enabled: true,
    requiredForTypes: ['event'],
    path: '/customer/event-briefings',
    readOnly: false,
    category: 'activity',
    icon: 'Users'
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