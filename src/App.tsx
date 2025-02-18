import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from 'react'
import Layout from "./components/layout/Layout"
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'

// Lazy load page components
const Index = lazy(() => import("./pages/Index"))
const ActionCalendar = lazy(() => import("./pages/ActionCalendar"))
const Profile = lazy(() => import("./pages/Profile"))
const Settings = lazy(() => import("./pages/Settings"))
const ConfigureViews = lazy(() => import("./pages/ConfigureViews"))
const UserSetup = lazy(() => import("./pages/administration/UserSetup"))
const EmployeeRegistration = lazy(() => import("./pages/administration/EmployeeRegistration"))
const CustomerSetup = lazy(() => import("./pages/administration/CustomerSetup"))
const StockControl = lazy(() => import("./pages/administration/StockControl"))
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const IncidentReportPage = lazy(() => import('@/pages/operations/IncidentReportPage'))
const MysteryShopperPage = lazy(() => import('@/pages/operations/MysteryShopperPage'))
const SiteVisitPage = lazy(() => import('@/pages/operations/SiteVisitPage'))
const UniformEquipmentPage = lazy(() => import('@/pages/employee/UniformEquipmentPage'))
const DisciplinaryPage = lazy(() => import('@/pages/employee/DisciplinaryPage'))
const EmployeeDiaryPage = lazy(() => import('@/pages/employee/EmployeeDiaryPage'))
const TrainingRecordPage = lazy(() => import('@/pages/employee/TrainingRecordPage'))
const CustomerReportingPage = lazy(() => import('@/pages/management/CustomerReportingPage'))
const ManagerCustomerReportPage = lazy(() => import('@/pages/management/ManagerCustomerReportPage'))
const ManagerSupportPage = lazy(() => import('@/pages/management/ManagerSupportPage'))
const IncidentsReportPage = lazy(() => import('@/pages/management/IncidentsReportPage'))
const GuardCertificationPage = lazy(() => import('@/pages/compliance/GuardCertificationPage'))
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
const Starters = lazy(() => import("./pages/recruitment/Starters"))
const Leavers = lazy(() => import("./pages/recruitment/Leavers"))
const HolidayRequestPage = lazy(() => import('@/pages/operations/HolidayRequestPage'))
const CustomerDAR = lazy(() => import('./pages/customer/CustomerDAR'))
const IncidentGraph = lazy(() => import('./pages/customer/IncidentGraph'))
const IncidentReport = lazy(() => import('./pages/customer/IncidentReport'))
const SafeSecureChecks = lazy(() => import('./pages/customer/SafeSecureChecks'))
const SatisfactionReports = lazy(() => import('./pages/customer/SatisfactionReports'))
const OfficerSupport = lazy(() => import('./pages/customer/OfficerSupport'))
const OfficerPerformancePage = lazy(() => import('./pages/management/OfficerPerformance'))

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aip-theme">
      <Router>
        <Layout>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              {/* Core Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/action-calendar" element={<ActionCalendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/configure-views" element={<ConfigureViews />} />
              <Route path="/dashboard" element={<DashboardPage />} />

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
                <Route path="starters" element={<Starters />} />
                <Route path="leavers" element={<Leavers />} />
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
                <Route path="training" element={<TrainingRecordPage />} />
              </Route>

              {/* Management Routes */}
              <Route path="/management">
                <Route path="customer-reporting" element={<CustomerReportingPage />} />
                <Route path="manager-customer-report" element={<ManagerCustomerReportPage />} />
                <Route path="manager-support" element={<ManagerSupportPage />} />
                <Route path="incidents-report" element={<IncidentsReportPage />} />
                <Route path="officer-performance" element={<OfficerPerformancePage />} />
              </Route>

              {/* Compliance Routes */}
              <Route path="/compliance">
                <Route path="guard-certification" element={<GuardCertificationPage />} />
                <Route path="contract-renewal" element={<ContractRenewalPage />} />
                <Route path="password-register" element={<PasswordRegisterPage />} />
                <Route path="asset-register" element={<AssetRegisterPage />} />
              </Route>

              {/* Customer Routes */}
              <Route path="/customer">
                <Route path="dar" element={<CustomerDAR />} />
                <Route path="incident-graph" element={<IncidentGraph />} />
                <Route path="incident-report" element={<IncidentReport />} />
                <Route path="safe-secure-checks" element={<SafeSecureChecks />} />
                <Route path="officer-support" element={<OfficerSupport />} />
                <Route path="satisfaction-reports" element={<SatisfactionReports />} />
              </Route>
            </Routes>
          </Suspense>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App