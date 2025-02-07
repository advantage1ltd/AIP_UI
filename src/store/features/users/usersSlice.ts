import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, CreateUserInput, UpdateUserInput } from '@/types/user'
import { mockUsers } from './mockUsers'

const initialState: User[] = mockUsers

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<CreateUserInput>) => {
      const newUser: User = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...action.payload,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${action.payload.name}`
      }
      state.push(newUser)
    },
    updateUser: (state, action: PayloadAction<UpdateUserInput>) => {
      const index = state.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        // Preserve createdAt and spread the rest of the payload
        const { createdAt } = state[index]
        state[index] = { ...state[index], ...action.payload, createdAt }
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      return state.filter(user => user.id !== action.payload)
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      return action.payload
    },
  },
})

export const { addUser, updateUser, deleteUser, setUsers } = usersSlice.actions
export default usersSlice.reducer
