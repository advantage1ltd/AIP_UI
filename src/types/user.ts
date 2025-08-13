export type UserRole = 
  | 'AdvantageOneOfficer'
  | 'AdvantageOneHOOfficer'
  | 'Administrator'
  | 'CustomerSiteManager'
  | 'CustomerHOManager';

export interface Customer {
  id: string;
  companyName: string;
  companyNumber: string;
  vatNumber: string;
  status: 'active' | 'inactive';
  customerType: CustomerType[];
  regions: Region[];
  sites: Site[];
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  customerId: string;
  manager: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  name: string;
  regionId: string;
  customerId: string;
  address: {
    buildingName: string;
    street: string;
    town: string;
    county: string;
    postcode: string;
  };
  isCoreSite: boolean;
  sinNumber: string;
  telephone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type CustomerType = 
  | 'Event'
  | 'Static'
  | 'Gatehouse'
  | 'Retail'
  | 'Mobile Patrol'
  | 'Keyholding & Alarm Response'
  | 'Other';

export interface BaseUser {
  id: string;
  username: string;
  password?: string;  // Optional since we don't want to expose it in responses
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  pageAccessRole: UserRole;
  signature?: string;
  signatureCode?: string;
  jobTitle?: string;
  userCompany?: 'Central England COOP' | 'Midcounties COOP' | 'Eastbrook Worcester' | 'Eastbrook Tewksbury' | 'Heart of England';
  recordIsDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser extends BaseUser {
  role: Extract<UserRole, 'CustomerSiteManager' | 'CustomerHOManager'>;
  customerId: number;
}

export interface AdvantageOneUser extends BaseUser {
  role: Extract<UserRole, 'AdvantageOneOfficer' | 'AdvantageOneHOOfficer' | 'Administrator'>;
  assignedCustomerIds?: number[];
}

export type User = CustomerUser | AdvantageOneUser;

export interface Employee {
  id: string;
  userId: string;
  name: string;
  jobRole: string;
  department: string;
  startDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
  };
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
  message?: string;
}

export const AVAILABLE_CUSTOMERS = [
  { id: 21, name: "Central England COOP" },
  { id: 22, name: "Heart of England" },
  { id: 23, name: "Midcounties COOP" },
  { id: 24, name: "Eastbrook Worcester" },
  { id: 25, name: "Eastbrook Tewksbury" }
];

export const USER_COMPANIES = [
  'Central England COOP',
  'Midcounties COOP',
  'Eastbrook Worcester',
  'Eastbrook Tewksbury',
  'Heart of England'
] as const;

export interface CreateUserInput extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateUserInput extends Partial<Omit<User, 'createdAt' | 'updatedAt'>> {
  id: string;
}
