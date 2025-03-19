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
  },
  {
    id: "u11",
    username: "kevin.harris",
    email: "kevin.harris@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-01-29T13:15:00Z",
    createdAt: "2024-12-11T09:20:00Z",
    department: "Sales"
  },
  {
    id: "u12",
    username: "olivia.martin",
    email: "olivia.martin@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-31T14:45:00Z",
    createdAt: "2024-12-12T10:35:00Z",
    department: "Finance"
  },
  {
    id: "u13",
    username: "ryan.thompson",
    email: "ryan.thompson@example.com",
    role: "Support",
    status: "inactive",
    lastLogin: "2025-01-18T09:30:00Z",
    createdAt: "2024-12-13T08:15:00Z",
    department: "Customer Support"
  },
  {
    id: "u14",
    username: "natalie.wilson",
    email: "natalie.wilson@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-01-30T11:05:00Z",
    createdAt: "2024-12-14T13:40:00Z",
    department: "HR"
  },
  {
    id: "u15",
    username: "jacob.anderson",
    email: "jacob.anderson@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-31T15:20:00Z",
    createdAt: "2024-12-15T10:25:00Z",
    department: "Marketing"
  },
  {
    id: "u16",
    username: "sophia.lewis",
    email: "sophia.lewis@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-01-29T10:40:00Z",
    createdAt: "2024-12-16T09:10:00Z",
    department: "Operations"
  },
  {
    id: "u17",
    username: "daniel.walker",
    email: "daniel.walker@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2025-01-31T08:35:00Z",
    createdAt: "2024-12-17T14:05:00Z",
    department: "IT"
  },
  {
    id: "u18",
    username: "emily.hall",
    email: "emily.hall@example.com",
    role: "Support",
    status: "active",
    lastLogin: "2025-01-30T13:50:00Z",
    createdAt: "2024-12-18T11:20:00Z",
    department: "Customer Support"
  },
  {
    id: "u19",
    username: "andrew.young",
    email: "andrew.young@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2025-01-22T16:10:00Z",
    createdAt: "2024-12-19T09:55:00Z",
    department: "Finance"
  },
  {
    id: "u20",
    username: "grace.moore",
    email: "grace.moore@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-31T10:25:00Z",
    createdAt: "2024-12-20T12:30:00Z",
    department: "Sales"
  },
  {
    id: "u21",
    username: "james.jackson",
    email: "james.jackson@example.com",
    role: "User",
    status: "active",
    lastLogin: "2025-01-29T14:40:00Z",
    createdAt: "2024-12-21T10:15:00Z",
    department: "Marketing"
  },
  {
    id: "u22",
    username: "megan.king",
    email: "megan.king@example.com",
    role: "Support",
    status: "active",
    lastLogin: "2025-01-30T09:20:00Z",
    createdAt: "2024-12-22T13:45:00Z",
    department: "Customer Support"
  },
  {
    id: "u23",
    username: "thomas.wright",
    email: "thomas.wright@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2025-01-31T11:55:00Z",
    createdAt: "2024-12-23T08:30:00Z",
    department: "IT"
  },
  {
    id: "u24",
    username: "chloe.scott",
    email: "chloe.scott@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2025-01-30T15:10:00Z",
    createdAt: "2024-12-24T09:40:00Z",
    department: "HR"
  },
  {
    id: "u25",
    username: "steven.adams",
    email: "steven.adams@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2025-01-24T12:30:00Z",
    createdAt: "2024-12-25T11:05:00Z",
    department: "Operations"
  }
];
