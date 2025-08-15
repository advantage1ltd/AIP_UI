import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, CreateUserInput, UpdateUserInput, UserRole } from '@/types/user'
import { userService } from '@/services/userService'

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null
}

// Normalize backend user detail (handles camelCase/PascalCase)
const mapUserDetailToUser = (detail: any): User => {
  const role = (detail.role ?? detail.Role) as UserRole
  const pageAccessRole = (detail.pageAccessRole ?? detail.PageAccessRole ?? role) as UserRole

  const assignedCustomerIds = detail.assignedCustomerIds ?? detail.AssignedCustomerIds
  const customerId = detail.customerId ?? detail.CustomerId

  return {
    id: detail.id ?? detail.Id,
    username: detail.username ?? detail.Username,
    firstName: detail.firstName ?? detail.FirstName,
    lastName: detail.lastName ?? detail.LastName,
    email: detail.email ?? detail.Email,
    role,
    pageAccessRole,
    signature: detail.signature ?? detail.Signature,
    signatureCode: detail.signatureCode ?? detail.SignatureCode,
    jobTitle: detail.jobTitle ?? detail.JobTitle,
    userCompany: detail.userCompany ?? detail.UserCompany,
    recordIsDeleted: detail.recordIsDeleted ?? detail.RecordIsDeleted ?? false,
    createdAt: detail.createdAt ?? detail.CreatedAt ?? new Date().toISOString(),
    updatedAt: detail.updatedAt ?? detail.UpdatedAt ?? new Date().toISOString(),
    ...(assignedCustomerIds ? { assignedCustomerIds } : {}),
    ...(customerId ? { customerId } : {}),
  }
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: { page?: number; pageSize?: number; searchTerm?: string }) => {
    const response = await userService.getUsers(params)
    return response.items // Return just the users array for backward compatibility
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
    const response = await userService.updateUser(userData)
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
        // Convert UserDetailResponse[] to User[] format
        state.users = action.payload.map((userDetail: any) => mapUserDetailToUser(userDetail))
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
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          // Convert UserDetailResponse to User format
          const user: User = mapUserDetailToUser(action.payload as any)
          state.users[index] = user
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
