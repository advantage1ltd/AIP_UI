import React, { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import LoginPage from '@/pages/LoginPage';
import Index from '@/pages/Index';
import CustomerReportingPage from '@/pages/management/CustomerReportingPage';
import CustomerDetailPage from '@/pages/customer/CustomerDetailPage';
import ActionCalendar from '@/pages/ActionCalendar';
import { UserRole } from '@/types/user';
import { PageAccessProvider } from '@/contexts/PageAccessContext';

// Import all the necessary pages
import UserSetup from '@/pages/administration/UserSetup';
import EmployeeRegistration from '@/pages/administration/EmployeeRegistration';
import CustomerSetup from '@/pages/administration/CustomerSetup';
import StockControl from '@/pages/administration/StockControl';
import IncidentReportPage from '@/pages/operations/IncidentReportPage';
import MysteryShopperPage from '@/pages/operations/MysteryShopperPage';
import SiteVisitPage from '@/pages/operations/SiteVisitPage';
import HolidayRequestPage from '@/pages/operations/HolidayRequestPage';
import BankHolidayPage from '@/pages/operations/BankHolidayPage';
import CustomerSatisfactionPage from '@/pages/operations/CustomerSatisfactionPage';
import PatrolLogPage from '@/pages/operations/PatrolLogPage';
import SafeDuressWordsPage from '@/pages/operations/SafeDuressWordsPage';
import OfficerSupportPage from '@/pages/operations/OfficerSupportPage';
import OfficerExpensesPage from '@/pages/operations/OfficerExpensesPage';
import UniformEquipmentPage from '@/pages/employee/UniformEquipmentPage';
import DisciplinaryPage from '@/pages/employee/DisciplinaryPage';
import EmployeeDiaryPage from '@/pages/employee/EmployeeDiaryPage';
import ManagerSupportPage from '@/pages/management/ManagerSupportPage';
import IncidentsReportPage from '@/pages/management/IncidentsReportPage';
import OfficerPerformance from '@/pages/management/OfficerPerformance';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';

// Import CRM pages
import CRMDashboard from '@/pages/crm/CRMDashboard';
import Contacts from '@/pages/crm/Contacts';
import Leads from '@/pages/crm/Leads';
import Deals from '@/pages/crm/Deals';
import Pipeline from '@/pages/crm/Pipeline';
import Tasks from '@/pages/crm/Tasks';

// Import compliance pages
import ContractRenewalPage from '@/pages/compliance/ContractRenewalPage';
import PasswordRegisterPage from '@/pages/compliance/PasswordRegisterPage';
import AssetRegisterPage from '@/pages/compliance/AssetRegisterPage';

// Import recruitment pages
import Vetting from '@/pages/recruitment/Vetting';
import CBT from '@/pages/recruitment/CBT';
import TakeTest from '@/pages/recruitment/TakeTest';

// Import customer pages with lazy loading
const DailyActivityReportPage = lazy(() => import('./pages/customer/CustomerDailyActivityReport'));
const IncidentGraphPage = lazy(() => import('./pages/customer/IncidentGraph').then(module => ({ default: module.default })));
const CustomerIncidentReportPage = lazy(() => import('./pages/customer/CustomerIncidentReport'));
const CustomerSatisfactionReport = lazy(() => import('./pages/customer/CustomerSatisfactionReport'));
const DailyActivityReportGraphs = lazy(() => import('./pages/customer/DailyActivityReportGraphs'));
const CustomerMysteryShopperReport = lazy(() => import('./pages/customer/CustomerMysteryShopperReport'));
const CustomerSiteVisitReport = lazy(() => import('./pages/customer/CustomerSiteVisitReport'));
const CustomerDailyOccurrenceBook = lazy(() => import('./pages/customer/CustomerDailyOccurrenceBook'));
const CustomerOfficerSupportPage = lazy(() => import('./pages/customer/CustomerOfficerSupportPage'));

const CustomerViewsConfig = lazy(() => import('./pages/customer/CustomerViewsConfig'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageAccessProvider>
        <Outlet />
      </PageAccessProvider>
    ),
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            path: '/',
            element: (
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            ),
          },
          {
            path: 'action-calendar',
            element: (
              <ProtectedRoute>
                <ActionCalendar />
              </ProtectedRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute allowedRoles={['Administrator'] as UserRole[]}>
                <Settings />
              </ProtectedRoute>
            ),
          },
          // Administration routes
          {
            path: 'administration/user-setup',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <UserSetup />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/employee-registration',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <EmployeeRegistration />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/customer-setup',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <CustomerSetup />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/stock-control',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <StockControl />
              </ProtectedRoute>
            ),
          },
          // Operations routes
          {
            path: 'operations/incident-report',
            element: (
              <ProtectedRoute>
                <IncidentReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/mystery-shopper',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <MysteryShopperPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/site-visit',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <SiteVisitPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/holiday-requests',
            element: (
              <ProtectedRoute>
                <HolidayRequestPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/bank-holiday',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <BankHolidayPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/customer-satisfaction',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <CustomerSatisfactionPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/patrol-log',
            element: (
              <ProtectedRoute>
                <PatrolLogPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/safe-duress-words',
            element: (
              <ProtectedRoute>
                <SafeDuressWordsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/officer-support',
            element: (
              <ProtectedRoute>
                <OfficerSupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/officer-expenses',
            element: (
              <ProtectedRoute>
                <OfficerExpensesPage />
              </ProtectedRoute>
            ),
          },
          // Employee routes
          {
            path: 'employee/uniform-equipment',
            element: (
              <ProtectedRoute>
                <UniformEquipmentPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'employee/disciplinary',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <DisciplinaryPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'employee/diary',
            element: (
              <ProtectedRoute>
                <EmployeeDiaryPage />
              </ProtectedRoute>
            ),
          },
          // Management routes
          {
            path: 'management/customer-reporting',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer', 'AdvantageOneOfficer', 'CustomerHOManager'] as UserRole[]}>
                <CustomerReportingPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'management/manager-support',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer', 'CustomerHOManager'] as UserRole[]}>
                <ManagerSupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'management/incidents-report',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer', 'CustomerHOManager'] as UserRole[]}>
                <IncidentsReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'management/officer-performance',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer', 'CustomerHOManager'] as UserRole[]}>
                <OfficerPerformance />
              </ProtectedRoute>
            ),
          },
          // Customer routes
          {
            path: 'customer/satisfaction-report',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <CustomerSatisfactionReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/be-safe-be-secure',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <DailyActivityReportGraphs />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/daily-activity-report',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <DailyActivityReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/incident-graph',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <IncidentGraphPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/incident-report',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <CustomerIncidentReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/mystery-shopper-report',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <CustomerMysteryShopperReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/site-visit-reports',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <CustomerSiteVisitReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/daily-occurrence-book',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <CustomerDailyOccurrenceBook />
              </ProtectedRoute>
            ),
          },

          {
            path: 'customer/views-config',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <CustomerViewsConfig />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/officer-support',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneOfficer', 'CustomerHOManager', 'CustomerSiteManager'] as UserRole[]}>
                <CustomerOfficerSupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/:customerId/*',
            element: (
              <ProtectedRoute>
                <CustomerDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/dashboard',
            element: (
              <ProtectedRoute>
                <CRMDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/leads',
            element: (
              <ProtectedRoute>
                <Leads />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/contacts',
            element: (
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/deals',
            element: (
              <ProtectedRoute>
                <Deals />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/pipeline',
            element: (
              <ProtectedRoute>
                <Pipeline />
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/tasks',
            element: (
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            ),
          },
          // Compliance routes
          {
            path: 'compliance/contract-renewal',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <ContractRenewalPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'compliance/password-register',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <PasswordRegisterPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'compliance/asset-register',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <AssetRegisterPage />
              </ProtectedRoute>
            ),
          },
          // Recruitment routes
          {
            path: 'recruitment/vetting',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <Vetting />
              </ProtectedRoute>
            ),
          },
          {
            path: 'recruitment/cbt',
            element: (
              <ProtectedRoute allowedRoles={['Administrator', 'AdvantageOneHOOfficer'] as UserRole[]}>
                <CBT />
              </ProtectedRoute>
            ),
          },
          {
            path: 'recruitment/take-test',
            element: (
              <ProtectedRoute>
                <TakeTest />
              </ProtectedRoute>
            ),
          },
        ]
      }
    ]
  }
]);

export default router;
