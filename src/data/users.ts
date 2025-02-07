export interface User {
  id: string
  username: string
  email: string
  role: 'Admin' | 'Manager' | 'User' | 'Support'
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
  department: string
}

export const DUMMY_USERS: User[] = [
  {
    id: "u1",
    username: "john.doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2025-01-31T10:00:00Z",
    createdAt: "2024-12-01T08:00:00Z",
    department: "IT"
  },
  {
    id: "u2",
    username: "jane.smith",
    email: "jane.smith@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-30T15:30:00Z",
    createdAt: "2024-12-02T09:15:00Z",
    department: "Operations"
  },
  {
    id: "u3",
    username: "bob.wilson",
    email: "bob.wilson@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2025-01-15T11:20:00Z",
    createdAt: "2024-12-03T10:30:00Z",
    department: "Sales"
  },
  {
    id: "u4",
    username: "sarah.jones",
    email: "sarah.jones@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-31T09:45:00Z",
    createdAt: "2024-12-04T14:20:00Z",
    department: "HR"
  },
  {
    id: "u5",
    username: "mike.brown",
    email: "mike.brown@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-01-30T16:15:00Z",
    createdAt: "2024-12-05T11:10:00Z",
    department: "Finance"
  },
  {
    id: "u6",
    username: "emma.davis",
    email: "emma.davis@example.com",
    role: "Support",
    status: "active",
    lastLogin: "2025-01-31T08:20:00Z",
    createdAt: "2024-12-06T13:45:00Z",
    department: "Customer Support"
  },
  {
    id: "u7",
    username: "alex.miller",
    email: "alex.miller@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2025-01-20T14:30:00Z",
    createdAt: "2024-12-07T09:30:00Z",
    department: "Marketing"
  },
  {
    id: "u8",
    username: "lisa.taylor",
    email: "lisa.taylor@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-31T11:10:00Z",
    createdAt: "2024-12-08T10:15:00Z",
    department: "Operations"
  },
  {
    id: "u9",
    username: "david.clark",
    email: "david.clark@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2025-01-31T09:00:00Z",
    createdAt: "2024-12-09T08:45:00Z",
    department: "IT"
  },
  {
    id: "u10",
    username: "rachel.white",
    email: "rachel.white@example.com",
    role: "Support",
    status: "active",
    lastLogin: "2025-01-30T17:20:00Z",
    createdAt: "2024-12-10T11:30:00Z",
    department: "Customer Support"
  }
];
