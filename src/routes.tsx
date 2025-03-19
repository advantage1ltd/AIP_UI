import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'


// Lazy load page components with error handling
const Index = lazy(() => import('@/pages/Index').catch(err => {
  console.error('Error loading Index page:', err)
  return { default: () => <div>Error loading page</div> }
}))
const ActionCalendar = lazy(() => import('./pages/ActionCalendar'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const ConfigureViews = lazy(() => import('./pages/ConfigureViews'))
//const DashboardPage = lazy(() => import('./pages/Dashboard'))

// Administration
const UserSetup = lazy(() => import('./pages/administration/UserSetup'))
const EmployeeRegistration = lazy(() => import('./pages/administration/EmployeeRegistration'))
const CustomerSetup = lazy(() => import('./pages/administration/CustomerSetup'))
const StockControl = lazy(() => import('./pages/administration/StockControl'))

// CRM
const Contacts = lazy(() => import('./pages/crm/Contacts'))
const Deals = lazy(() => import('./pages/crm/Deals'))
const Pipeline = lazy(() => import('./pages/crm/Pipeline'))
const Tasks = lazy(() => import('./pages/crm/Tasks'))

// Recruitment
const Vetting = lazy(() => import('./pages/recruitment/Vetting'))
const CBT = lazy(() => import('./pages/recruitment/CBT'))


// Operations
const IncidentReportPage = lazy(() => import('./pages/operations/IncidentReportPage'))
const MysteryShopperPage = lazy(() => import('./pages/operations/MysteryShopperPage'))
const SiteVisitPage = lazy(() => import('./pages/operations/SiteVisitPage'))
const HolidayRequestPage = lazy(() => import('./pages/operations/HolidayRequestPage'))
const BankHolidayPage = lazy(() => import('./pages/operations/BankHolidayPage'))
const CustomerSatisfactionPage = lazy(() => import('./pages/operations/CustomerSatisfactionPage'))
const PatrolLogPage = lazy(() => import('./pages/operations/PatrolLogPage'))
const SafeDuressWordsPage = lazy(() => import('./pages/operations/SafeDuressWordsPage'))
const OfficerSupportPage = lazy(() => import('./pages/operations/OfficerSupportPage'))
const OfficerExpensesPage = lazy(() => import('./pages/operations/OfficerExpensesPage'))

// Employee
const UniformEquipmentPage = lazy(() => import('./pages/employee/UniformEquipmentPage'))
const DisciplinaryPage = lazy(() => import('./pages/employee/DisciplinaryPage'))
const EmployeeDiaryPage = lazy(() => import('./pages/employee/EmployeeDiaryPage'))


// Management
const CustomerReportingPage = lazy(() => import('./pages/management/CustomerReportingPage'))
const ManagerSupportPage = lazy(() => import('./pages/management/ManagerSupportPage'))
const IncidentsReportPage = lazy(() => import('./pages/management/IncidentsReportPage'))

// Compliance
const ContractRenewalPage = lazy(() => import('./pages/compliance/ContractRenewalPage'))
const PasswordRegisterPage = lazy(() => import('./pages/compliance/PasswordRegisterPage'))
const AssetRegisterPage = lazy(() => import('./pages/compliance/AssetRegisterPage'))

const AppRoutes = () => {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          {/* Core Routes */}
          <Route path="/" element={
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Index />
            </Suspense>
          } />
          <Route path="/action-calendar" element={<ActionCalendar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/configure-views" element={<ConfigureViews />} />


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
      </Suspense>
    </Layout>
  )
}

export default AppRoutes
