export const MOCK_CUSTOMERS = [
  'Tesco Express',
  'Sainsbury\'s Local',
  'ASDA',
  'Waitrose',
  'Co-op',
  'Marks & Spencer',
  'Lidl',
  'Aldi',
  'Morrisons'
] as const;

export const MOCK_STORES = [
  'London Bridge Store',
  'Manchester Central',
  'Birmingham South',
  'Edinburgh Central',
  'Glasgow North',
  'Leeds City Centre',
  'Liverpool One',
  'Cardiff Bay',
  'Bristol Clifton',
  'Newcastle Eldon Square'
] as const;

export const MOCK_OFFICERS = [
  'John Smith',
  'Emma Brown',
  'David Clark',
  'Alice Thompson',
  'Mark Wilson',
  'Sarah Johnson',
  'Michael Davies',
  'Rachel Roberts',
  'James Anderson',
  'Lisa Taylor'
] as const;

export const MOCK_OFFICER_ROLES = [
  'Security Officer',
  'Senior Security Officer',
  'Security Supervisor',
  'Security Team Leader',
  'Security Manager',
  'Loss Prevention Officer',
  'Store Detective',
  'Security Coordinator',
  'Security Shift Leader'
] as const;

export type Customer = typeof MOCK_CUSTOMERS[number];
export type Store = typeof MOCK_STORES[number];
export type Officer = typeof MOCK_OFFICERS[number];
export type OfficerRole = typeof MOCK_OFFICER_ROLES[number]; 