import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Suspense, lazy, Component, ReactNode, ErrorInfo } from 'react'
import Layout from './components/layout/Layout'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { PageAccessProvider } from './contexts/PageAccessContext'
import Profile from "./pages/Profile"

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4 bg-red-50 text-red-800">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">We're sorry, but there was an error loading the application.</p>
          <pre className="bg-red-100 p-4 rounded text-sm overflow-auto max-w-full">
            {this.state.error && this.state.error.toString()}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load page components
const Index = lazy(() => import("./pages/Index"))
const ActionCalendar = lazy(() => import("./pages/ActionCalendar"))
const Settings = lazy(() => import("./pages/Settings"))
const ConfigureViews = lazy(() => import("./pages/ConfigureViews"))
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'))
const UserSetup = lazy(() => import("./pages/administration/UserSetup"))
const EmployeeRegistration = lazy(() => import("./pages/administration/EmployeeRegistration"))
const CustomerSetup = lazy(() => import("./pages/administration/CustomerSetup"))
const StockControl = lazy(() => import("./pages/administration/StockControl"))
const IncidentReportPage = lazy(() => import('@/pages/operations/IncidentReportPage'))
const MysteryShopperPage = lazy(() => import('@/pages/operations/MysteryShopperPage'))
const SiteVisitPage = lazy(() => import('@/pages/operations/SiteVisitPage'))
const UniformEquipmentPage = lazy(() => import('@/pages/employee/UniformEquipmentPage'))
const DisciplinaryPage = lazy(() => import('@/pages/employee/DisciplinaryPage'))
const EmployeeDiaryPage = lazy(() => import('@/pages/employee/EmployeeDiaryPage'))
const CustomerReportingPage = lazy(() => import('@/pages/management/CustomerReportingPage'))
const ManagerSupportPage = lazy(() => import('@/pages/management/ManagerSupportPage'))
const IncidentsReportPage = lazy(() => import('@/pages/management/IncidentsReportPage'))
const ContractRenewalPage = lazy(() => import('@/pages/compliance/ContractRenewalPage'))
const PasswordRegisterPage = lazy(() => import('@/pages/compliance/PasswordRegisterPage'))
const AssetRegisterPage = lazy(() => import('@/pages/compliance/AssetRegisterPage'))
const BankHolidayPage = lazy(() => import('@/pages/operations/BankHolidayPage'))
const CustomerSatisfactionPage = lazy(() => import('@/pages/operations/CustomerSatisfactionPage'))
const PatrolLogPage = lazy(() => import('@/pages/operations/PatrolLogPage'))
const SafeDuressWordsPage = lazy(() => import('@/pages/operations/SafeDuressWordsPage'))
const OfficerSupportPage = lazy(() => import('@/pages/operations/OfficerSupportPage'))
const OfficerExpensesPage = lazy(() => import('@/pages/operations/OfficerExpensesPage'))
const Leads = lazy(() => import('@/pages/crm/Leads'))
const Contacts = lazy(() => import('@/pages/crm/Contacts'))
const Tasks = lazy(() => import('@/pages/crm/Tasks'))
const CRMDashboard = lazy(() => import('@/pages/crm/CRMDashboard'))
const Deals = lazy(() => import('@/pages/crm/Deals'))
const Pipeline = lazy(() => import('@/pages/crm/Pipeline'))
const Vetting = lazy(() => import("./pages/recruitment/Vetting"))
const CBT = lazy(() => import("./pages/recruitment/CBT"))
const TakeTest = lazy(() => import("./pages/recruitment/TakeTest"))
const TestSession = lazy(() => import("./pages/recruitment/TestSession"))
const HolidayRequestPage = lazy(() => import('@/pages/operations/HolidayRequestPage'))
const CustomerDAR = lazy(() => import('./pages/customer/CustomerDAR'))
const IncidentGraph = lazy(() => import('./pages/customer/IncidentGraph'))
const IncidentReport = lazy(() => import('./pages/customer/IncidentReport'))
const SatisfactionReports = lazy(() => import('./pages/customer/SatisfactionReports'))
const OfficerSupport = lazy(() => import('./pages/customer/OfficerSupport'))
const OfficerPerformancePage = lazy(() => import('./pages/management/OfficerPerformance'))
const BeSafeBeSecureGraph = lazy(() => import('./pages/customer/BeSafeBeSecureGraph'))

const App: React.FC = () => {
  return (
    <ErrorBoundaryComponent>
      <ThemeProvider defaultTheme="system" storageKey="aip-theme">
        <BrowserRouter>
          <PageAccessProvider>
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<Index />} />
                  <Route path="/action-calendar" element={<ActionCalendar />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/configure-views" element={<ConfigureViews />} />
                  <Route path="/reports-dashboard" element={<ReportsDashboard />} />

                  {/* Administration Routes */}
                  <Route path="/administration">
                    <Route path="user-setup" element={<UserSetup />} />
                    <Route path="employee-registration" element={<EmployeeRegistration />} />
                    <Route path="customer-setup" element={<CustomerSetup />} />
                    <Route path="stock-control" element={<StockControl />} />
                  </Route>

                  {/* CRM Routes */}
                  <Route path="/crm">
                    <Route path="dashboard" element={<CRMDashboard />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="contacts" element={<Contacts />} />
                    <Route path="deals" element={<Deals />} />
                    <Route path="pipeline" element={<Pipeline />} />
                    <Route path="tasks" element={<Tasks />} />
                  </Route>

                  {/* Recruitment Routes */}
                  <Route path="/recruitment">
                    <Route path="vetting" element={<Vetting />} />
                    <Route path="cbt" element={<CBT />} />
                    <Route path="take-test" element={<TakeTest />} />
                    <Route path="test-session/:testId" element={<TestSession />} />
                  </Route>

                  {/* Operations Routes */}
                  <Route path="/operations">
                    <Route path="incident-report" element={<IncidentReportPage />} />
                    <Route path="mystery-shopper" element={<MysteryShopperPage />} />
                    <Route path="site-visit" element={<SiteVisitPage />} />
                    <Route path="holiday-requests" element={<HolidayRequestPage />} />
                    <Route path="bank-holiday" element={<BankHolidayPage />} />
                    <Route path="customer-satisfaction" element={<CustomerSatisfactionPage />} />
                    <Route path="patrol-log" element={<PatrolLogPage />} />
                    <Route path="safe-duress-words" element={<SafeDuressWordsPage />} />
                    <Route path="officer-support" element={<OfficerSupportPage />} />
                    <Route path="officer-expenses" element={<OfficerExpensesPage />} />
                  </Route>

                  {/* Employee Routes */}
                  <Route path="/employee">
                    <Route path="uniform-equipment" element={<UniformEquipmentPage />} />
                    <Route path="disciplinary" element={<DisciplinaryPage />} />
                    <Route path="diary" element={<EmployeeDiaryPage />} />
                  </Route>

                  {/* Management Routes */}
                  <Route path="/management">
                    <Route path="customer-reporting" element={<CustomerReportingPage />} />
                    <Route path="manager-support" element={<ManagerSupportPage />} />
                    <Route path="incidents-report" element={<IncidentsReportPage />} />
                    <Route path="officer-performance" element={<OfficerPerformancePage />} />
                  </Route>

                  {/* Compliance Routes */}
                  <Route path="/compliance">
                    <Route path="contract-renewal" element={<ContractRenewalPage />} />
                    <Route path="password-register" element={<PasswordRegisterPage />} />
                    <Route path="asset-register" element={<AssetRegisterPage />} />
                  </Route>

                  {/* Customer Routes */}
                  <Route path="/customer">
                    <Route path="dar" element={<CustomerDAR />} />
                    <Route path="incident-graph" element={<IncidentGraph />} />
                    <Route path="incident-report" element={<IncidentReport />} />
                    <Route path="satisfaction-reports" element={<SatisfactionReports />} />
                    <Route path="be-safe-be-secure-graph" element={<BeSafeBeSecureGraph />} />
                    <Route path="officer-support" element={<OfficerSupport />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
            <Toaster />
          </PageAccessProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundaryComponent>
  )
}

export default App