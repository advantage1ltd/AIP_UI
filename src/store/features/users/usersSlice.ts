import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, CreateUserInput, UpdateUserInput } from '@/types/user'

const initialState: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    username: 'johnsmith',
    email: 'john.smith@advantage.com',
    status: 'Advantage One Officer',
    signature: 'JS',
    signatureCode: 'JS001',
    jobTitle: 'Senior Security Officer',
    userCompany: 'Advantage One Security',
    officerType: 'Both',
    assignedCustomers: [
      { id: '1', name: 'Central England COOP' },
      { id: '2', name: 'Midcounties COOP' }
    ],
    createdAt: '2024-01-15T09:00:00Z',
    lastLogin: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    username: 'sarahj',
    email: 'sarah.johnson@advantage.com',
    status: 'Advantage One HO Manager',
    signature: 'SJ',
    signatureCode: 'SJ002',
    jobTitle: 'Regional Manager',
    userCompany: 'Advantage One Security',
    officerType: 'Static Officer',
    assignedCustomers: [
      { id: '3', name: 'Heart of England COOP' }
    ],
    createdAt: '2024-01-20T10:00:00Z',
    lastLogin: '2024-03-19T16:45:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    username: 'michaelb',
    email: 'michael.brown@coop.com',
    status: 'Customer - Site Manager',
    signature: 'MB',
    signatureCode: 'MB003',
    jobTitle: 'Site Manager',
    userCompany: 'Central England COOP',
    officerType: 'Retail Officer',
    assignedCustomers: [
      { id: '1', name: 'Central England COOP' }
    ],
    createdAt: '2024-02-01T11:00:00Z',
    lastLogin: '2024-03-18T09:15:00Z'
  },
  {
    id: '4',
    firstName: 'Emma',
    lastName: 'Davis',
    username: 'emmad',
    email: 'emma.davis@advantage.com',
    status: 'Advantage one HO Editor',
    signature: 'ED',
    signatureCode: 'ED004',
    jobTitle: 'Operations Editor',
    userCompany: 'Advantage One Security',
    officerType: 'Both',
    assignedCustomers: [
      { id: '2', name: 'Midcounties COOP' },
      { id: '4', name: 'Eastbrook Tewksbury' }
    ],
    createdAt: '2024-02-15T13:00:00Z',
    lastLogin: '2024-03-20T11:20:00Z'
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Wilson',
    username: 'robertw',
    email: 'robert.wilson@coop.com',
    status: 'Customer - Head Office Manager',
    signature: 'RW',
    signatureCode: 'RW005',
    jobTitle: 'Head Office Manager',
    userCompany: 'Midcounties COOP',
    officerType: 'Static Officer',
    assignedCustomers: [
      { id: '2', name: 'Midcounties COOP' }
    ],
    createdAt: '2024-03-01T14:00:00Z',
    lastLogin: '2024-03-19T13:40:00Z'
  }
]

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<CreateUserInput>) => {
      const newUser: User = {
        id: `u${state.length + 1}`,
        ...action.payload,
        createdAt: new Date().toISOString(),
      }
      state.push(newUser)
    },
    updateUser: (state, action: PayloadAction<UpdateUserInput>) => {
      const index = state.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload }
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      return state.filter(user => user.id !== action.payload)
    },
  },
})

export const { addUser, updateUser, deleteUser } = usersSlice.actions
export default usersSlice.reducer
