import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store'

async function startApp() {
  if (import.meta.env.DEV) {
    try {
      const { restartMockServiceWorker } = await import('./mocks/browser')
      await restartMockServiceWorker()
      console.log('Mock Service Worker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Mock Service Worker:', error)
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

startApp()
