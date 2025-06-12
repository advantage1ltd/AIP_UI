export type UserStatus = 
  | 'Advantage One Officer'
  | 'Advantage one HO Editor'
  | 'Advantage One HO Manager'
  | 'Administrator'
  | 'Customer - Site Manager'
  | 'Customer - Head Office Manager';

export type OfficerType = 'Retail Officer' | 'Static Officer' | 'Both';

export interface Customer {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  status: UserStatus;
  signature: string;
  signatureCode: string;
  jobTitle: string;
  userCompany: string;
  officerType: OfficerType;
  assignedCustomers: Customer[];
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  status: UserStatus;
  signature: string;
  signatureCode: string;
  jobTitle: string;
  userCompany: string;
  officerType: OfficerType;
  assignedCustomers: Customer[];
}

export interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  status?: UserStatus;
  signature?: string;
  signatureCode?: string;
  jobTitle?: string;
  userCompany?: string;
  officerType?: OfficerType;
  assignedCustomers?: Customer[];
}

export const AVAILABLE_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Central England COOP' },
  { id: '2', name: 'Midcounties COOP' },
  { id: '3', name: 'Heart of England COOP' },
  { id: '4', name: 'Eastbrook Tewksbury' }
];
