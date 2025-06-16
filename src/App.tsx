import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Suspense, lazy, Component, ReactNode, ErrorInfo, useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PageAccessProvider } from './contexts/PageAccessContext'
import Profile from "./pages/Profile"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { store } from './store/store'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/Dashboard/DashboardPage'
import OfficerDashboard from './pages/Dashboard/OfficerDashboard'
import CustomerDashboard from './pages/Dashboard/CustomerDashboard'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Loading component with logging
const LoadingSpinner = () => {
  console.log('LoadingSpinner rendering...')
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  )
}

// Error Boundary State interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component with enhanced logging
class ErrorBoundaryComponent extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error details:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
          <pre className="mt-2 max-w-full overflow-auto bg-gray-100 p-4 text-sm">
            {this.state.error?.stack}
          </pre>
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

// Root component with logging
const RootComponent = () => {
  useEffect(() => {
    console.log('Root component mounted');
  }, []);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Role-based redirect function
const roleRedirect = (role?: string) => {
  if (!role) return '/login'
  if (role === 'Administrator') return '/officer-dashboard'
  if (role === 'Advantage One Officer') return '/officer-dashboard'
  if (role.startsWith('Customer')) return '/customer-dashboard'
  return '/login'
}

// Get user info helper
function getUserInfo(): { role?: string; userRole: 'customer-site' | 'customer-ho' } {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    console.log('🔍 getUserInfo - user from localStorage:', user)
    const userRole = user.role?.toLowerCase().includes('head office') ? 'customer-ho' : 'customer-site'
    console.log('🎯 Determined userRole:', userRole, 'from role:', user.role)
    return {
      ...user,
      userRole
    }
  } catch {
    return { userRole: 'customer-site' }
  }
}

// Lazy load page components with error handling
const Index = lazy(() => import('@/pages/Index').catch(err => {
  console.error('Error loading Index page:', err);
  return { default: () => <div>Error loading page</div> };
}));

const ActionCalendar = lazy(() => import('./pages/ActionCalendar'));
const Settings = lazy(() => import('./pages/Settings'));
const ConfigureViews = lazy(() => import('./pages/ConfigureViews'));
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'));

// Administration
const UserSetup = lazy(() => import('./pages/administration/UserSetup'));
const EmployeeRegistration = lazy(() => import('./pages/administration/EmployeeRegistration'));
const CustomerSetup = lazy(() => import('./pages/administration/CustomerSetup'));
const StockControl = lazy(() => import('./pages/administration/StockControl'));

// CRM
const Dashboard = lazy(() => import('./pages/crm/CRMDashboard'));
const Leads = lazy(() => import('./pages/crm/Leads'));
const Contacts = lazy(() => import('./pages/crm/Contacts'));
const Deals = lazy(() => import('./pages/crm/Deals'));
const Pipeline = lazy(() => import('./pages/crm/Pipeline'));
const Tasks = lazy(() => import('./pages/crm/Tasks'));
const RoleBasedRedirect = lazy(() => import('./components/RoleBasedRedirect'));

// Recruitment
const Vetting = lazy(() => import('./pages/recruitment/Vetting'));
const CBT = lazy(() => import('./pages/recruitment/CBT'));
const TakeTest = lazy(() => import('./pages/recruitment/TakeTest'));
const TestSession = lazy(() => import('./pages/recruitment/TestSession'));

// Operations
const IncidentReportPage = lazy(() => import('./pages/operations/IncidentReportPage'));
const MysteryShopperPage = lazy(() => import('./pages/operations/MysteryShopperPage'));
const SiteVisitPage = lazy(() => import('./pages/operations/SiteVisitPage'));
const HolidayRequestPage = lazy(() => import('./pages/operations/HolidayRequestPage'));
const BankHolidayPage = lazy(() => import('./pages/operations/BankHolidayPage'));
const CustomerSatisfactionPage = lazy(() => import('./pages/operations/CustomerSatisfactionPage'));
const SafeDuressWordsPage = lazy(() => import('./pages/operations/SafeDuressWordsPage'));
const OfficerSupportPage = lazy(() => import('./pages/operations/OfficerSupportPage'));
const OfficerExpensesPage = lazy(() => import('./pages/operations/OfficerExpensesPage'));

//Employee
const UniformEquipmentPage = lazy(() => import('./pages/employee/UniformEquipmentPage'));
const DisciplinaryPage = lazy(() => import('./pages/employee/DisciplinaryPage'));
const EmployeeDiaryPage = lazy(() => import('./pages/employee/EmployeeDiaryPage'));

// Management
const CustomerReportingPage = lazy(() => import('./pages/management/CustomerReportingPage'));
const ManagerSupportPage = lazy(() => import('./pages/management/ManagerSupportPage'));
const IncidentsReportPage = lazy(() => import('./pages/management/IncidentsReportPage'));
const OfficerPerformancePage = lazy(() => import('./pages/management/OfficerPerformance'));

// Compliance
const ContractRenewalPage = lazy(() => import('./pages/compliance/ContractRenewalPage'));
const PasswordRegisterPage = lazy(() => import('./pages/compliance/PasswordRegisterPage'));
const AssetRegisterPage = lazy(() => import('./pages/compliance/AssetRegisterPage'));

// Customer
const DailyActivityReportPage = lazy(() => import('./pages/customer/DailyActivityReportPage'));
const IncidentGraphPage = lazy(() => import('./pages/customer/IncidentGraph'));
const CustomerIncidentReportPage = lazy(() => import('./pages/customer/IncidentReport'));
const SatisfactionReportsPage = lazy(() => import('./pages/customer/SatisfactionReportsPage'));
const BeSafeBeSecureGraphPage = lazy(() => import('./pages/customer/BeSafeBeSecureGraphPage'));
const CustomerOfficerSupportPage = lazy(() => import('./pages/customer/CustomerOfficerSupportPage'));

const App: React.FC = () => {
  const user = getUserInfo()
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundaryComponent>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="aip-theme">
            <BrowserRouter>
              <PageAccessProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<RootComponent />}>
                        {/* Redirect root to appropriate dashboard based on role */}
                        <Route index element={<RoleBasedRedirect />} />

                        {/* Role-specific dashboards */}
                        <Route path="/admin-dashboard" element={<Index />} />
                        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
                        <Route path="/customer-dashboard" element={<CustomerDashboard userRole={user.userRole} />} />

                        {/* Other protected routes */}
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/action-calendar" element={<ActionCalendar />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/configure-views" element={<ConfigureViews />} />
                        <Route path="/reports-dashboard" element={<ReportsDashboard />} />

                        {/* Administration routes */}
                        <Route path="/administration">
                          <Route path="user-setup" element={<UserSetup />} />
                          <Route path="employee-registration" element={<EmployeeRegistration />} />
                          <Route path="customer-setup" element={<CustomerSetup />} />
                          <Route path="stock-control" element={<StockControl />} />
                        </Route>

                        {/* CRM routes */}
                        <Route path="/crm">
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="leads" element={<Leads />} />
                          <Route path="contacts" element={<Contacts />} />
                          <Route path="deals" element={<Deals />} />
                          <Route path="pipeline" element={<Pipeline />} />
                          <Route path="tasks" element={<Tasks />} />
                        </Route>

                        {/* Recruitment routes */}
                        <Route path="/recruitment">
                          <Route path="vetting" element={<Vetting />} />
                          <Route path="cbt" element={<CBT />} />
                          <Route path="take-test" element={<TakeTest />} />
                          <Route path="test-session" element={<TestSession />} />
                        </Route>

                        {/* Operations routes */}
                        <Route path="/operations">
                          <Route path="incident-report" element={<IncidentReportPage />} />
                          <Route path="mystery-shopper" element={<MysteryShopperPage />} />
                          <Route path="site-visit" element={<SiteVisitPage />} />
                          <Route path="holiday-request" element={<HolidayRequestPage />} />
                          <Route path="holiday-requests" element={<HolidayRequestPage />} />
                          <Route path="bank-holiday" element={<BankHolidayPage />} />
                          <Route path="customer-satisfaction" element={<CustomerSatisfactionPage />} />
                          <Route path="safe-duress-words" element={<SafeDuressWordsPage />} />
                          <Route path="officer-support" element={<OfficerSupportPage />} />
                          <Route path="officer-expenses" element={<OfficerExpensesPage />} />
                        </Route>

                        {/* Employee routes */}
                        <Route path="/employee">
                          <Route path="uniform-equipment" element={<UniformEquipmentPage />} />
                          <Route path="disciplinary" element={<DisciplinaryPage />} />
                          <Route path="diary" element={<EmployeeDiaryPage />} />
                        </Route>

                        {/* Management routes */}
                        <Route path="/management">
                          <Route path="customer-reporting" element={<CustomerReportingPage />} />
                          <Route path="manager-support" element={<ManagerSupportPage />} />
                          <Route path="incidents-report" element={<IncidentsReportPage />} />
                          <Route path="officer-performance" element={<OfficerPerformancePage />} />
                        </Route>

                        {/* Compliance routes */}
                        <Route path="/compliance">
                          <Route path="contract-renewal" element={<ContractRenewalPage />} />
                          <Route path="password-register" element={<PasswordRegisterPage />} />
                          <Route path="asset-register" element={<AssetRegisterPage />} />
                        </Route>

                        {/* Customer routes */}
                        <Route path="/customer">
                          <Route path="daily-activity-report" element={<DailyActivityReportPage />} />
                          <Route path="incident-graph" element={<IncidentGraphPage />} />
                          <Route path="incident-report" element={<CustomerIncidentReportPage />} />
                          <Route path="satisfaction-reports" element={<SatisfactionReportsPage />} />
                          <Route path="be-safe-be-secure-graph" element={<BeSafeBeSecureGraphPage />} />
                          <Route path="officer-support" element={<CustomerOfficerSupportPage />} />
                        </Route>
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </PageAccessProvider>
            </BrowserRouter>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
          <ToastContainer />
        </QueryClientProvider>
      </ErrorBoundaryComponent>
    </Provider>
  );
}

export default App;

