import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Create worker instance
export const worker = setupWorker(...handlers)

// Initialize worker with better error handling
export const initMockServiceWorker = async () => {
  try {
    // Log total number of handlers being registered
    console.log('🔧 [MSW] Starting with', handlers.length, 'handlers')

    // Start MSW with enhanced configuration
    await worker.start({
      // Improved unhandled request handling
      onUnhandledRequest: (request, print) => {
        // Parse URL to get pathname
        const url = new URL(request.url)
        
        // Ignore non-API requests and static assets
        const ignoredPatterns = [
          '/mockServiceWorker.js',
          '/db.json',
          '/_next/',
          '/assets/',
          '/static/',
          '/src/',
          '/node_modules/',
          '/@vite/',
          '/@fs/',
          '.ico',
          '.png',
          '.jpg',
          '.svg',
          '.js',
          '.ts',
          '.tsx',
          '.css',
          '.json'
        ]

        // Ignore root path and non-API requests
        if (url.pathname === '/' || 
            !url.pathname.startsWith('/api/') ||
            ignoredPatterns.some(pattern => request.url.includes(pattern))) {
          return
        }

        // Only log unhandled API requests
        console.warn('⚠️ [MSW] Unhandled API Request:', {
          method: request.method,
          url: request.url,
          pathname: url.pathname
        })

        // Show warning in console for API requests only
        print.warning()
      },

      // Configure service worker with quieter logging
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/'
        }
      },
      
      // Reduce verbose logging
      quiet: false
    })

    // Log successful startup with handler details
    console.log('✅ [MSW] Started successfully')
    console.log('📋 [MSW] Registered handlers:')
    handlers.forEach(handler => {
      console.log(`   ${handler.info.method} ${handler.info.path}`)
    })

  } catch (error) {
    // Enhanced error logging
    console.error('❌ [MSW] Failed to start:', error)
    if (error instanceof Error) {
      console.error('   Details:', error.message)
      console.error('   Stack:', error.stack)
    }
    throw error // Re-throw to allow error handling upstream
  }
}

// Function to restart the service worker with enhanced error handling
export const restartMockServiceWorker = async () => {
  try {
    console.log('🔄 [MSW] Stopping service worker...')
    await worker.stop()
    console.log('✅ [MSW] Service worker stopped')
    
    // Add delay to ensure clean shutdown
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('🔄 [MSW] Restarting service worker...')
    await initMockServiceWorker()
    console.log('✅ [MSW] Service worker restarted successfully')
  } catch (error) {
    console.error('❌ [MSW] Failed to restart:', error)
    if (error instanceof Error) {
      console.error('   Details:', error.message)
      console.error('   Stack:', error.stack)
    }
    throw error // Re-throw to allow error handling upstream
  }
} 