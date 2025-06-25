export interface Address {
  building: string
  street: string
  village?: string
  town: string
  county: string
  postcode: string
}

export interface Contact {
  title: string
  forename: string
  surname: string
  position: string
  email: string
  phone: string
}

export interface ViewConfig {
  id: string
  customerId: string
  customerType: CustomerType
  enabledPages: string[]
  createdAt: string
  updatedAt: string
}

export type CustomerType = 'retail' | 'static' | 'gatehouse' | 'mobile-patrol' | 'keyholding-alarm-response' | 'event'

export interface CustomerPageAssignment {
  enabled: boolean
  customized: boolean
  lastModified: string
  modifiedBy: string
}

export interface Customer {
  id: string
  companyName: string
  companyNumber: string
  vatNumber: string
  status: 'active' | 'inactive'
  customerType: CustomerType
  address: Address
  contact: Contact
  viewConfig: ViewConfig
  pageAssignments?: Record<string, CustomerPageAssignment>
  assignedOfficers?: string[]
  createdAt: string
  updatedAt: string
}

export interface Region {
  id: string
  name: string
  customerId: string
  manager: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Site {
  id: string
  locationName: string
  regionId: string
  customerId: string
  buildingName: string
  street: string
  town: string
  county: string
  postcode: string
  isCoreSite: boolean
  sinNumber: string
  telephone: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CustomerPage {
  id: string
  title: string
  description: string
  enabled: boolean
  requiredForTypes: string[]
  path: string
  readOnly: boolean
  category: 'activity' | 'incidents' | 'satisfaction' | 'safety' | 'support' | 'reports' | 'settings'
  icon: string
}

export type CustomerPageId = 
  | 'daily-activity'
  | 'incident-graph'
  | 'incident-report'
  | 'customer-satisfaction'
  | 'be-safe-be-secure'
  | 'officer-support'
  | 'patrol-log'
  | 'site-visit-reports'
  | 'keyholding-logs'
  | 'event-briefings'

export interface CustomerViewConfig {
  id: string
  customerId: string
  customerType: CustomerType
  enabledPages: string[]
  createdAt: string
  updatedAt: string
}

export interface CustomerReportingAccess {
  customerId: string
  customerName: string
  customerType: CustomerType
  assignedOfficers: string[]
  availablePages: CustomerPage[]
  lastActivity: string
  totalIncidents: number
  totalReports: number
}

export interface CustomerWithRelations extends Customer {
  regions: Region[]
  sites: Site[]
  availablePages?: CustomerPage[]
  statistics?: {
    incidents: number
    reports: number
    lastIncident?: string
    activeIssues: number
  }
}

export interface CustomerResponse {
  success: boolean
  data: Customer
  message?: string
}

export interface CustomersResponse {
  success: boolean
  data: Customer[]
  message?: string
}

export interface RegionResponse {
  success: boolean
  data: Region
  message?: string
}

export interface RegionsResponse {
  success: boolean
  data: Region[]
  message?: string
}

export interface SiteResponse {
  success: boolean
  data: Site
  message?: string
}

export interface SitesResponse {
  success: boolean
  data: Site[]
  message?: string
}

export interface CustomerReportingResponse {
  success: boolean
  data: CustomerReportingAccess[]
  message?: string
} 