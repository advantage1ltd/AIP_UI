/** User administration list and customer-assignment async thunks (userService). */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { logger } from '@/utils/logger'
import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { userService, mapRawApiUserToUser } from '@/services/userService'
import { api } from '@/config/api'

interface UsersState {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
  }
  loading: boolean
  error: string | null
  userAssignments: Record<string, number[]>
  assignmentLoading: boolean
  assignmentError: string | null
}

const initialState: UsersState = {
  users: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0
  },
  loading: false,
  error: null,
  userAssignments: {},
  assignmentLoading: false,
  assignmentError: null
}

// Normalize backend user detail (handles camelCase/PascalCase)
const mapUserDetailToUser = (detail: any): User => {
  return mapRawApiUserToUser(detail)
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: { page?: number; pageSize?: number; searchTerm?: string }) => {
    const response = await userService.getUsers(params)
    return response
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserInput) => {
    const response = await userService.createUser(userData)
    return response
  }
)

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (userData: UpdateUserInput) => {
    const response = await userService.updateUser(userData as any)
    return response
  }
)

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (userId: string) => {
    await userService.deleteUser(userId)
    return userId
  }
)

// Customer assignment verification thunks
export const fetchUserCustomerAssignments = createAsyncThunk(
  'users/fetchUserCustomerAssignments',
  async (userId: string) => {
    const response = await api.get<number[]>(`/CustomerAssignment/user/${userId}`)
    if (response.status !== 200) {
      throw new Error('Failed to fetch user customer assignments')
    }
    const customerIds = response.data
    return { userId, customerIds }
  }
)

export const checkUserHasCustomer = createAsyncThunk(
  'users/checkUserHasCustomer',
  async ({ userId, customerId }: { userId: string; customerId: number }) => {
    const response = await api.get<boolean>(`/CustomerAssignment/user/${userId}/has/${customerId}`)
    if (response.status !== 200) {
      throw new Error('Failed to check user customer assignment')
    }
    const hasCustomer = response.data
    return { userId, customerId, hasCustomer }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data.map((userDetail: any) => mapUserDetailToUser(userDetail))
        state.pagination = {
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          pageSize: action.payload.pagination.pageSize,
          totalCount: action.payload.pagination.totalCount
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch users'
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        // Convert UserDetailResponse to User format
        const user: User = mapUserDetailToUser(action.payload as any)
        state.users.push(user)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create user'
      })
      // Update user
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false
        logger.debug('🔄 [usersSlice] updateUserAsync.fulfilled:', {
          userId: action.payload.id,
          customerId: action.payload.customerId,
          customerName: (action.payload as any).customerName,
          role: action.payload.role,
          fullPayload: action.payload
        })
        
        const index = state.users.findIndex(user => user.id === action.payload.id)
        logger.debug('🔄 [usersSlice] User index in store:', index)
        
        if (index !== -1) {
          // Convert UserDetailResponse to User format
          const user: User = mapUserDetailToUser(action.payload as any)
          logger.debug('🔄 [usersSlice] Mapped user:', {
            id: user.id,
            customerId: user.customerId,
            customerName: (user as any).customerName,
            role: user.role
          })
          const oldUser = state.users[index]
          state.users[index] = user
          logger.debug('✅ [usersSlice] User updated in store:', {
            oldCustomerId: oldUser.customerId,
            newCustomerId: user.customerId,
            oldCustomerName: (oldUser as any).customerName,
            newCustomerName: (user as any).customerName
          })
        } else {
          // If user not found in list, add it (shouldn't happen but handle gracefully)
          logger.debug('⚠️ [usersSlice] User not found in store, adding new user')
          const user: User = mapUserDetailToUser(action.payload as any)
          state.users.push(user)
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update user'
      })
      // Delete user
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter(user => user.id !== action.payload)
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete user'
      })
  },
})

export default usersSlice.reducer
