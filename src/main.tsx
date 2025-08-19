import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store'

async function startApp() {
  // Backend is ready - MSW disabled in favor of real API calls
  console.log('🚀 Starting application with real backend API...')

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

startApp()
