export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive'
  department: string
  lastLogin?: string
  createdAt: string
  avatar?: string
}

export interface CreateUserInput {
  name: string
  email: string
  role: User['role']
  department: string
  status: User['status']
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id: string
}
