import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { AnimatePresence, motion } from 'framer-motion'

// Loading component
const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </motion.div>
)

// Wrap component with motion for smooth transitions
const withMotion = (Component: React.ComponentType) => {
  return () => {
    const location = useLocation();
    
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="h-full w-full"
      >
        <Suspense fallback={<PageLoader />}>
          <Component />
        </Suspense>
      </motion.div>
    )
  }
}

// Lazy load page components with error handling and motion
const Index = withMotion(lazy(() => import('@/pages/Index').catch(err => {
  console.error('Error loading Index page:', err)
  return { default: () => <div>Error loading page</div> }
})))

const ActionCalendar = withMotion(lazy(() => import('./pages/ActionCalendar')))
const Profile = withMotion(lazy(() => import('./pages/Profile')))
const Settings = withMotion(lazy(() => import('./pages/Settings')))
const ConfigureViews = withMotion(lazy(() => import('./pages/ConfigureViews')))
const ReportsDashboard = withMotion(lazy(() => import('./pages/ReportsDashboard')))

// Administration
const UserSetup = withMotion(lazy(() => import('./pages/administration/UserSetup')))
const EmployeeRegistration = withMotion(lazy(() => import('./pages/administration/EmployeeRegistration')))
const CustomerSetup = withMotion(lazy(() => import('./pages/administration/CustomerSetup')))
const StockControl = withMotion(lazy(() => import('./pages/administration/StockControl')))

// CRM
const Contacts = withMotion(lazy(() => import('./pages/crm/Contacts')))
const Deals = withMotion(lazy(() => import('./pages/crm/Deals')))
const Pipeline = withMotion(lazy(() => import('./pages/crm/Pipeline')))
const Tasks = withMotion(lazy(() => import('./pages/crm/Tasks')))

// Recruitment
const Vetting = withMotion(lazy(() => import('./pages/recruitment/Vetting')))
const CBT = withMotion(lazy(() => import('./pages/recruitment/CBT')))
const TakeTest = withMotion(lazy(() => import('./pages/recruitment/TakeTest')))
const TestSession = withMotion(lazy(() => import('./pages/recruitment/TestSession')))

// Operations
const IncidentReportPage = withMotion(lazy(() => import('./pages/operations/IncidentReportPage')))
const MysteryShopperPage = withMotion(lazy(() => import('./pages/operations/MysteryShopperPage')))
const SiteVisitPage = withMotion(lazy(() => import('./pages/operations/SiteVisitPage')))
const HolidayRequestPage = withMotion(lazy(() => import('./pages/operations/HolidayRequestPage')))
const BankHolidayPage = withMotion(lazy(() => import('./pages/operations/BankHolidayPage')))
const CustomerSatisfactionPage = withMotion(lazy(() => import('./pages/operations/CustomerSatisfactionPage')))
const PatrolLogPage = withMotion(lazy(() => import('./pages/operations/PatrolLogPage')))
const SafeDuressWordsPage = withMotion(lazy(() => import('./pages/operations/SafeDuressWordsPage')))
const OfficerSupportPage = withMotion(lazy(() => import('./pages/operations/OfficerSupportPage')))
const OfficerExpensesPage = withMotion(lazy(() => import('./pages/operations/OfficerExpensesPage')))

// Employee
const UniformEquipmentPage = withMotion(lazy(() => import('./pages/employee/UniformEquipmentPage')))
const DisciplinaryPage = withMotion(lazy(() => import('./pages/employee/DisciplinaryPage')))
const EmployeeDiaryPage = withMotion(lazy(() => import('./pages/employee/EmployeeDiaryPage')))

// Management
const CustomerReportingPage = withMotion(lazy(() => import('./pages/management/CustomerReportingPage')))
const ManagerSupportPage = withMotion(lazy(() => import('./pages/management/ManagerSupportPage')))
const IncidentsReportPage = withMotion(lazy(() => import('./pages/management/IncidentsReportPage')))

// Compliance
const ContractRenewalPage = withMotion(lazy(() => import('./pages/compliance/ContractRenewalPage')))
const PasswordRegisterPage = withMotion(lazy(() => import('./pages/compliance/PasswordRegisterPage')))
const AssetRegisterPage = withMotion(lazy(() => import('./pages/compliance/AssetRegisterPage')))

const AppRoutes = () => {
  const location = useLocation()

  return (
    <Layout>
      <div className="h-full">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Core Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/action-calendar" element={<ActionCalendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/configure-views" element={<ConfigureViews />} />
            <Route path="/reports-dashboard" element={<ReportsDashboard />} />

            {/* Administration Routes */}
            <Route path="/administration/user-setup" element={<UserSetup />} />
            <Route path="/administration/employee-registration" element={<EmployeeRegistration />} />
            <Route path="/administration/customer-setup" element={<CustomerSetup />} />
            <Route path="/administration/stock-control" element={<StockControl />} />

            {/* CRM Routes */}
            <Route path="/crm/contacts" element={<Contacts />} />
            <Route path="/crm/deals" element={<Deals />} />
            <Route path="/crm/pipeline" element={<Pipeline />} />
            <Route path="/crm/tasks" element={<Tasks />} />

            {/* Recruitment Routes */}
            <Route path="/recruitment/vetting" element={<Vetting />} />
            <Route path="/recruitment/cbt" element={<CBT />} />
            <Route path="/recruitment/take-test" element={<TakeTest />} />
            <Route path="/recruitment/test-session/:testId" element={<TestSession />} />

            {/* Operations Routes */}
            <Route path="/operations/incident-report" element={<IncidentReportPage />} />
            <Route path="/operations/mystery-shopper" element={<MysteryShopperPage />} />
            <Route path="/operations/site-visit" element={<SiteVisitPage />} />
            <Route path="/operations/holiday-requests" element={<HolidayRequestPage />} />
            <Route path="/operations/bank-holiday" element={<BankHolidayPage />} />
            <Route path="/operations/customer-satisfaction" element={<CustomerSatisfactionPage />} />
            <Route path="/operations/patrol-log" element={<PatrolLogPage />} />
            <Route path="/operations/safe-duress-words" element={<SafeDuressWordsPage />} />
            <Route path="/operations/officer-support" element={<OfficerSupportPage />} />
            <Route path="/operations/officer-expenses" element={<OfficerExpensesPage />} />

            {/* Employee Routes */}
            <Route path="/employee/uniform-equipment" element={<UniformEquipmentPage />} />
            <Route path="/employee/disciplinary" element={<DisciplinaryPage />} />
            <Route path="/employee/diary" element={<EmployeeDiaryPage />} />

            {/* Management Routes */}
            <Route path="/management/customer-reporting" element={<CustomerReportingPage />} />
            <Route path="/management/manager-support" element={<ManagerSupportPage />} />
            <Route path="/management/incidents-report" element={<IncidentsReportPage />} />

            {/* Compliance Routes */}
            <Route path="/compliance/contract-renewal" element={<ContractRenewalPage />} />
            <Route path="/compliance/password-register" element={<PasswordRegisterPage />} />
            <Route path="/compliance/asset-register" element={<AssetRegisterPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default AppRoutes
