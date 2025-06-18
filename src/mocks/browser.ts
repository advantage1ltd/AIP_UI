import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Create worker instance
export const worker = setupWorker(...handlers)

// Initialize worker with better error handling
export const initMockServiceWorker = async () => {
  try {
    console.log('Starting MSW with handlers:', handlers.length)
    await worker.start({
      onUnhandledRequest: (req, print) => {
        // Ignore certain paths that we don't want to mock
        if (req.url.includes('/mockServiceWorker.js') || 
            req.url.includes('/db.json') ||
            req.url.includes('/_next/') ||
            req.url.includes('/assets/')) {
          return
        }
        console.log('Unhandled request:', req.method, req.url)
        print.warning()
      },
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
    console.log('Mock Service Worker started successfully')
    console.log('Registered handlers:', handlers.map(h => `${h.info.method} ${h.info.path}`))
  } catch (error) {
    console.error('Failed to start Mock Service Worker:', error)
  }
}

// Function to restart the service worker
export const restartMockServiceWorker = async () => {
  try {
    console.log('Stopping MSW...')
    await worker.stop()
    console.log('MSW stopped successfully')
    
    // Small delay to ensure clean shutdown
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('Restarting MSW...')
    await initMockServiceWorker()
  } catch (error) {
    console.error('Failed to restart Mock Service Worker:', error)
  }
} 