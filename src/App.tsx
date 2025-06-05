import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Suspense, lazy, Component, ReactNode, ErrorInfo } from 'react'
import Layout from './components/layout/Layout'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { PageAccessProvider } from './contexts/PageAccessContext'
import Profile from "./pages/Profile"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
)

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
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
  return (
    <ErrorBoundaryComponent>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="aip-theme">
        <BrowserRouter>
          <PageAccessProvider>
              <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<Index />} />
                  <Route path="/action-calendar" element={<ActionCalendar />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/configure-views" element={<ConfigureViews />} />
                  <Route path="/reports-dashboard" element={<ReportsDashboard />} />

                  {/* Administration Routes */}
                  <Route path="administration">
                    <Route path="user-setup" element={<UserSetup />} />
                    <Route path="employee-registration" element={<EmployeeRegistration />} />
                    <Route path="customer-setup" element={<CustomerSetup />} />
                    <Route path="stock-control" element={<StockControl />} />
                  </Route>

                  {/* CRM Routes */}
                  <Route path="crm">
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="deals" element={<Deals />} />
                    <Route path="pipeline" element={<Pipeline />} />
                    <Route path="tasks" element={<Tasks />} />
                  </Route>

                  {/* Recruitment Routes */}
                  <Route path="recruitment">
                    <Route path="vetting" element={<Vetting />} />
                    <Route path="cbt" element={<CBT />} />
                    <Route path="take-test" element={<TakeTest />} />
                    <Route path="test-session" element={<TestSession />} />
                  </Route>

                  {/* Operations Routes */}
                  <Route path="operations">
                    <Route path="incident-report" element={<IncidentReportPage />} />
                    <Route path="mystery-shopper" element={<MysteryShopperPage />} />
                    <Route path="site-visit" element={<SiteVisitPage />} />
                    <Route path="holiday-requests" element={<HolidayRequestPage />} />
                    <Route path="bank-holiday" element={<BankHolidayPage />} />
                    <Route path="customer-satisfaction" element={<CustomerSatisfactionPage />} />
                    <Route path="safe-duress-words" element={<SafeDuressWordsPage />} />
                    <Route path="officer-support" element={<OfficerSupportPage />} />
                    <Route path="officer-expenses" element={<OfficerExpensesPage />} />
                  </Route>

                  {/* Employee Routes */}
                  <Route path="employee">
                    <Route path="uniform-equipment" element={<UniformEquipmentPage />} />
                    <Route path="disciplinary" element={<DisciplinaryPage />} />
                    <Route path="diary" element={<EmployeeDiaryPage />} />
                  </Route>

                  {/* Management Routes */}
                  <Route path="management">
                    <Route path="customer-reporting" element={<CustomerReportingPage />} />
                    <Route path="manager-support" element={<ManagerSupportPage />} />
                    <Route path="incidents-report" element={<IncidentsReportPage />} />
                    <Route path="officer-performance" element={<OfficerPerformancePage />} />
                  </Route>

                  {/* Compliance Routes */}
                  <Route path="compliance">
                    <Route path="contract-renewal" element={<ContractRenewalPage />} />
                    <Route path="password-register" element={<PasswordRegisterPage />} />
                    <Route path="asset-register" element={<AssetRegisterPage />} />
                  </Route>

                  {/* Customer Routes */}
                  <Route path="customer">
                    <Route path="dar" element={<DailyActivityReportPage />} />
                    <Route path="incident-graph" element={<IncidentGraphPage />} />
                    <Route path="incident-report" element={<CustomerIncidentReportPage />} />
                    <Route path="satisfaction-reports" element={<SatisfactionReportsPage />} />
                    <Route path="be-safe-be-secure-graph" element={<BeSafeBeSecureGraphPage />} />
                    <Route path="officer-support" element={<CustomerOfficerSupportPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </PageAccessProvider>
        </BrowserRouter>
          <Toaster />
      </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundaryComponent>
  )
}

export default App