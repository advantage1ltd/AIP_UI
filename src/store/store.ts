import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './features/users/usersSlice'
import contactsReducer from './features/contactsSlice'

const store = configureStore({
  reducer: {
    users: usersReducer,
    contacts: contactsReducer
  },
  preloadedState: {
    users: []
  }
})

export { store }

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
