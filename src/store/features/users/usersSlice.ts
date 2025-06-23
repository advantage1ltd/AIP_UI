import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
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

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    return await userService.getUsers()
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserInput) => {
    return await userService.createUser(userData)
  }
)

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (userData: UpdateUserInput) => {
    return await userService.updateUser(userData)
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
        state.users = action.payload
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
        state.users.push(action.payload)
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
          state.users[index] = action.payload
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
