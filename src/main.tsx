import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/store'

async function startApp() {
  // Enable MSW for development to provide page access API
  if (import.meta.env.DEV) {
    try {
      const { initMockServiceWorker } = await import('./mocks/browser')
      await initMockServiceWorker()
      console.log('✅ Mock Service Worker initialized')
      
      // Load test utilities for development
      const { testCompleteWorkflow, createEastbrookWorcesterCustomer } = await import('./utils/customerTestUtils');
      const { customerService } = await import('./services/customerService');
      
      // Make test functions available globally
      (window as any).testCreateCustomer = testCompleteWorkflow;
      (window as any).createEastbrook = createEastbrookWorcesterCustomer;
      (window as any).customerService = customerService;
      
      console.log('🧪 [Development] Test utilities loaded:');
      console.log('   - testCreateCustomer() - Test complete workflow');
      console.log('   - createEastbrook() - Create Eastbrook Worcester customer');
      console.log('   - customerService - Full customer service API');
      
    } catch (error) {
      console.error('❌ Failed to initialize Mock Service Worker:', error)
    }
  }

  console.log('🚀 Starting application with MSW enabled for development...')

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

startApp()
