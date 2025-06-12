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