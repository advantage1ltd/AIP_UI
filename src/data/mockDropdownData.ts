// Types
export interface Customer {
  id: string;
  name: string;
  type: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  region: string;
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  badge: string;
}

export interface OfficerRole {
  id: string;
  name: string;
  level: number;
}

// Mock Data
export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Tesco Express', type: 'Retail' },
  { id: '2', name: 'Sainsbury\'s Local', type: 'Retail' },
  { id: '3', name: 'ASDA', type: 'Retail' },
  { id: '4', name: 'Waitrose', type: 'Retail' },
  { id: '5', name: 'Co-op', type: 'Retail' },
];

export const MOCK_STORES: Store[] = [
  { id: '1', name: 'London Bridge Store', address: '123 London Bridge St, London', region: 'South' },
  { id: '2', name: 'Manchester Central', address: '456 Market St, Manchester', region: 'North' },
  { id: '3', name: 'Birmingham South', address: '789 High St, Birmingham', region: 'Midlands' },
  { id: '4', name: 'Edinburgh Central', address: '321 Princes St, Edinburgh', region: 'Scotland' },
  { id: '5', name: 'Glasgow North', address: '654 Buchanan St, Glasgow', region: 'Scotland' },
];

export const MOCK_OFFICERS: Officer[] = [
  { id: '1', name: 'John Smith', role: 'Security Officer', badge: 'SO001' },
  { id: '2', name: 'Emma Brown', role: 'Senior Security Officer', badge: 'SO002' },
  { id: '3', name: 'David Clark', role: 'Security Officer', badge: 'SO003' },
  { id: '4', name: 'Alice Thompson', role: 'Security Supervisor', badge: 'SO004' },
  { id: '5', name: 'Mark Wilson', role: 'Security Officer', badge: 'SO005' },
];

export const MOCK_OFFICER_ROLES: OfficerRole[] = [
  { id: '1', name: 'Security Officer', level: 1 },
  { id: '2', name: 'Senior Security Officer', level: 2 },
  { id: '3', name: 'Security Supervisor', level: 3 },
  { id: '4', name: 'Site Manager', level: 4 },
  { id: '5', name: 'Regional Manager', level: 5 },
]; 