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
      // Bypass unhandled requests (let real backend handle them)
      onUnhandledRequest: 'bypass',

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