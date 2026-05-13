/**
 * Root UI shell: global providers, error boundary, and router.
 * Listens for backend-connection-status events from config/api.ts interceptors.
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerSelectionProvider } from './contexts/CustomerSelectionContext';
import { RouterProvider } from 'react-router-dom';
import router from './routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        const isAuthFailure = message.includes('401') || message.includes('403') || message.includes('unauthorized')
        if (isAuthFailure) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// === Error boundary (uncaught render errors) ===
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

type BackendConnectionDetail = {
  status: 'degraded' | 'recovered'
  message: string
}

class ErrorBoundaryComponent extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    const isDev = import.meta.env.DEV
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-center text-muted-foreground">
            {isDev ? this.state.error?.message : 'An unexpected error occurred. Please reload the page.'}
          </p>
          {isDev && this.state.error?.stack && (
            <pre className="mt-2 max-w-full overflow-auto bg-gray-100 p-4 text-sm">
              {this.state.error.stack}
            </pre>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const showBackendConnectionToasts = import.meta.env.VITE_SHOW_BACKEND_CONNECTION_TOASTS === 'true'

  React.useEffect(() => {
    if (!showBackendConnectionToasts) {
      return
    }

    const handleConnectionStatus = (event: Event) => {
      const customEvent = event as CustomEvent<BackendConnectionDetail>
      const detail = customEvent.detail
      if (!detail) return

      if (detail.status === 'degraded') {
        toast.warn(detail.message, { toastId: 'backend-connection-status' })
        return
      }

      toast.dismiss('backend-connection-status')
      toast.success(detail.message, { toastId: 'backend-connection-recovered' })
    }

    window.addEventListener('backend-connection-status', handleConnectionStatus)
    return () => {
      window.removeEventListener('backend-connection-status', handleConnectionStatus)
    }
  }, [showBackendConnectionToasts])

  return (
    <ErrorBoundaryComponent>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="aip-theme">
          <AuthProvider>
            <CustomerSelectionProvider>
              <RouterProvider router={router} />
            </CustomerSelectionProvider>
          </AuthProvider>
          <Toaster />
          <ToastContainer />
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundaryComponent>
  );
}

export default App;

