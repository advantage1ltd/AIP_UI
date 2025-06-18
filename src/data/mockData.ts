import { User, Customer, Employee, Region, Site } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

// Mock Regions
export const mockRegions: Region[] = [
  {
    id: '1',
    name: 'North',
    customerId: '1',
    manager: 'John Manager',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'South',
    customerId: '1',
    manager: 'Jane Manager',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Sites
export const mockSites: Site[] = [
  {
    id: '1',
    name: 'Site A',
    regionId: '1',
    customerId: '1',
    address: {
      buildingName: 'Building A',
      street: '123 Main St',
      town: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
    },
    isCoreSite: true,
    sinNumber: 'SIN001',
    telephone: '020 1234 5678',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Site B',
    regionId: '2',
    customerId: '1',
    address: {
      buildingName: 'Building B',
      street: '456 High St',
      town: 'Manchester',
      county: 'Greater Manchester',
      postcode: 'M1 1AA',
    },
    isCoreSite: false,
    sinNumber: 'SIN002',
    telephone: '0161 234 5678',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: '1',
    companyName: 'Retail Corp Ltd',
    companyNumber: '12345678',
    vatNumber: 'GB123456789',
    status: 'active',
    customerType: ['Retail', 'Mobile Patrol'],
    regions: mockRegions,
    sites: mockSites,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    companyName: 'Event Masters',
    companyNumber: '87654321',
    vatNumber: 'GB987654321',
    status: 'active',
    customerType: ['Event', 'Static'],
    regions: [],
    sites: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
    pageAccessRole: 'Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Officer',
    lastName: 'One',
    username: 'officer1',
    email: 'officer1@example.com',
    role: 'AdvantageOneOfficer',
    pageAccessRole: 'AdvantageOneOfficer',
    assignedCustomerIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Customer',
    lastName: 'Manager',
    username: 'customer1',
    email: 'customer1@example.com',
    role: 'CustomerSiteManager',
    pageAccessRole: 'CustomerSiteManager',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    userId: '2', // Links to Officer One
    name: 'Officer One',
    jobRole: 'Security Officer',
    department: 'Operations',
    startDate: '2023-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]; 