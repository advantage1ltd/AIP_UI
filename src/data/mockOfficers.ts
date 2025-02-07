export interface Officer {
  id: string;
  name: string;
  role: string;
}

export const mockOfficers: Officer[] = [
  { id: '1', name: 'Mr Robert Gray', role: 'Senior Officer' },
  { id: '2', name: 'Ms Sarah Johnson', role: 'Officer' },
  { id: '3', name: 'Mr James Smith', role: 'Senior Officer' },
  { id: '4', name: 'Ms Emily Brown', role: 'Officer' },
  { id: '5', name: 'Mr Michael Wilson', role: 'Officer' },
];
