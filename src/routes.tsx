/**
 * Central route table: public auth routes, authenticated Layout routes, and lazy customer bundles.
 * PageAccessProvider wraps all routes; ProtectedRoute enforces auth and optional page-access paths.
 */
import React, { lazy, useEffect, useRef } from 'react';
import { createBrowserRouter, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Index from '@/pages/Index';
import CustomerReportingPage from '@/pages/management/CustomerReportingPage';
import CustomerDetailPage from '@/pages/customer/CustomerDetailPage';
import ActionCalendar from '@/pages/ActionCalendar';
import { UserRole } from '@/types/user';
import { PageAccessProvider } from '@/contexts/PageAccessContext';
import { CustomerSelectionUrlSync } from '@/components/customer/CustomerSelectionUrlSync';
import { logger } from '@/utils/logger';
import ErrorBoundary from '@/components/ErrorBoundary';

// === Route helpers (path normalize, scroll, navigation debug) ===
const PathNormalizer = () => {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const pathname = location.pathname;
		// Check if pathname has double or more slashes anywhere
		if (pathname.includes('//')) {
			// Replace multiple consecutive slashes with a single slash
			// This ensures we always have exactly one / at the start
			const normalized = pathname.replace(/\/+/g, '/');
			if (normalized !== pathname) {
				logger.debug('[PathNormalizer] Fixing double slash', { pathname, normalized });
				// Use replace: true to avoid adding to history and prevent navigation loops
				const newPath = normalized + (location.search || '') + (location.hash || '');
				navigate(newPath, { replace: true });
				return; // Exit early to prevent further processing
			}
		}
	}, [location.pathname, location.search, location.hash, navigate]);

	return null;
};

const ScrollToTop = () => {
	const location = useLocation();

	useEffect(() => {
		const scrollTarget = document.scrollingElement ?? document.documentElement;
		scrollTarget.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [location.pathname, location.search]);

	return null;
};

// Navigation tracker component for end-to-end logging
const NavigationTracker = () => {
	const location = useLocation();
	const previousLocationRef = useRef<{ pathname: string; search: string } | null>(null);
	const navigationHistoryRef = useRef<Array<{ from: string; to: string; timestamp: number }>>([]);

	useEffect(() => {
		const currentPath = location.pathname + location.search;
		const previousPath = previousLocationRef.current 
			? previousLocationRef.current.pathname + previousLocationRef.current.search 
			: null;

		if (previousPath !== currentPath) {
			const timestamp = Date.now();
			logger.debug('[Navigation]', {
				from: previousPath || '(initial load)',
				to: currentPath,
				timestamp: new Date(timestamp).toISOString(),
			});
			if (previousPath) {
				navigationHistoryRef.current.push({
					from: previousPath,
					to: currentPath,
					timestamp
				});
				if (navigationHistoryRef.current.length > 10) {
					navigationHistoryRef.current.shift();
				}
			}
			if (navigationHistoryRef.current.length >= 3) {
				const recent = navigationHistoryRef.current.slice(-3);
				const isLoop = recent.every((nav, idx) => 
					idx === 0 || nav.from === recent[idx - 1].to
				);
				if (isLoop && recent[0].from === recent[recent.length - 1].to) {
					logger.debug('[Navigation] possible redirect loop', {
						chain: recent.map(n => n.to),
					});
				}
			}
			logger.debug('[Navigation] recent', navigationHistoryRef.current.slice(-5));
			previousLocationRef.current = {
				pathname: location.pathname,
				search: location.search
			};
		}
	}, [location.pathname, location.search, location.hash]);

	return null;
};

const withRouteBoundary = (children: React.ReactNode) => (
	<ErrorBoundary>
		{children}
	</ErrorBoundary>
)

// === Page imports (eager) — administration & operations ===
import UserSetup from '@/pages/administration/UserSetup';
import EmployeeRegistration from '@/pages/administration/EmployeeRegistration';
import CustomerSetup from '@/pages/administration/CustomerSetup';
import CustomerPageSettings from '@/pages/administration/CustomerPageSettings';
import StockControl from '@/pages/administration/StockControl';
import IncidentReportPage from '@/pages/operations/IncidentReportPage';
import SiteVisitPage from '@/pages/operations/SiteVisitPage';
import HolidayRequestPage from '@/pages/operations/HolidayRequestPage';
import BankHolidayPage from '@/pages/operations/BankHolidayPage';
import CustomerSatisfactionPage from '@/pages/operations/CustomerSatisfactionPage';
import SafeDuressWordsPage from '@/pages/operations/SafeDuressWordsPage';
import OfficerSupportPage from '@/pages/operations/OfficerSupportPage';
import OfficerExpensesPage from '@/pages/operations/OfficerExpensesPage';
import UniformEquipmentPage from '@/pages/employee/UniformEquipmentPage';
import DisciplinaryPage from '@/pages/employee/DisciplinaryPage';
import EmployeeDiaryPage from '@/pages/employee/EmployeeDiaryPage';
import ManagerSupportPage from '@/pages/management/ManagerSupportPage';
import OfficerPerformance from '@/pages/management/OfficerPerformance';
import DataAnalyticsHub from '@/pages/analytics/DataAnalyticsHub';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';

// === CRM ===
import CRMDashboard from '@/pages/crm/CRMDashboard';
import CRMContacts from '@/pages/crm/CRMContacts';
import Deals from '@/pages/crm/Deals';
import Pipeline from '@/pages/crm/Pipeline';
import Tasks from '@/pages/crm/Tasks';

// === Compliance ===
import ContractRenewalPage from '@/pages/compliance/ContractRenewalPage';
import PasswordRegisterPage from '@/pages/compliance/PasswordRegisterPage';
import AssetRegisterPage from '@/pages/compliance/AssetRegisterPage';

// === Recruitment ===
import Vetting from '@/pages/recruitment/Vetting';
import CBT from '@/pages/recruitment/CBT';
import TakeTest from '@/pages/recruitment/TakeTest';
import TestSession from '@/pages/recruitment/TestSession';

// === Customer tenant pages (lazy) ===
const DailyActivityReportPage = lazy(() => import('./pages/customer/CustomerDailyActivityReport'));
const IncidentGraphPage = lazy(() => import('./pages/customer/IncidentGraph').then(module => ({ default: module.default })));
const CustomerIncidentReportPage = lazy(() => import('./pages/customer/CustomerIncidentReport'));
const CustomerSatisfactionReport = lazy(() => import('./pages/customer/CustomerSatisfactionReport'));
const DailyActivityReportGraphs = lazy(() => import('./pages/customer/DailyActivityReportGraphs'));
const CustomerSiteVisitReport = lazy(() => import('./pages/customer/CustomerSiteVisitReport'));
const CustomerDailyOccurrenceBook = lazy(() => import('./pages/customer/CustomerDailyOccurrenceBook'));
const CustomerOfficerSupportPage = lazy(() => import('./pages/customer/CustomerOfficerSupportPage'));
const CustomerCrimeIntelligencePage = lazy(() => import('./pages/customer/CustomerCrimeIntelligence'));

const CustomerViewsConfig = lazy(() => import('./pages/customer/CustomerViewsConfig'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageAccessProvider>
        <PathNormalizer />
        <ScrollToTop />
        <NavigationTracker />
        <CustomerSelectionUrlSync />
        <Outlet />
      </PageAccessProvider>
    ),
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
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
                {withRouteBoundary(<ActionCalendar />)}
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
              <ProtectedRoute allowedRoles={['administrator'] as UserRole[]}>
                <Settings />
              </ProtectedRoute>
            ),
          },
          // Administration routes
          {
            path: 'administration/user-setup',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <UserSetup />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/employee-registration',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                {withRouteBoundary(<EmployeeRegistration />)}
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/customer-setup',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <CustomerSetup />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/customer-page-settings',
            element: (
              <ProtectedRoute allowedRoles={['administrator'] as UserRole[]}>
                <CustomerPageSettings />
              </ProtectedRoute>
            ),
          },
          {
            path: 'administration/stock-control',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <StockControl />
              </ProtectedRoute>
            ),
          },
          // Operations routes
          {
            path: 'operations/incident-report',
            element: (
              <ProtectedRoute>
                {withRouteBoundary(<IncidentReportPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/site-visit',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
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
              <ProtectedRoute allowedRoles={['administrator', 'manager', 'securityofficer'] as UserRole[]}>
                <BankHolidayPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'operations/customer-satisfaction',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <CustomerSatisfactionPage />
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
              <ProtectedRoute allowedRoles={['administrator', 'manager', 'securityofficer'] as UserRole[]}>
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
              <ProtectedRoute allowedRoles={['administrator', 'manager', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerReportingPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'management/manager-support',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager', 'customer'] as UserRole[]}>
                <ManagerSupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'management/officer-performance',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager', 'customer'] as UserRole[]}>
                <OfficerPerformance />
              </ProtectedRoute>
            ),
          },
          {
            path: 'analytics/data-analytics-hub',
            element: (
              <ProtectedRoute 
                allowedRoles={['administrator', 'manager', 'customer'] as UserRole[]}
                accessPath="/analytics/data-analytics-hub"
                enforcePageAccess={false}
              >
                <DataAnalyticsHub />
              </ProtectedRoute>
            ),
          },
          // Customer routes
          {
            path: 'customer/satisfaction-report',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerSatisfactionReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/be-safe-be-secure',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <DailyActivityReportGraphs />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/daily-activity-report',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <DailyActivityReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/incident-graph',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <IncidentGraphPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/incident-report',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerIncidentReportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/crime-intelligence',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerCrimeIntelligencePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/site-visit-reports',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <CustomerSiteVisitReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/daily-occurrence-book',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerDailyOccurrenceBook />
              </ProtectedRoute>
            ),
          },

          {
            path: 'customer/views-config',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerViewsConfig />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/officer-support',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'securityofficer', 'customer'] as UserRole[]}>
                <CustomerOfficerSupportPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'customer/:customerId/*',
            element: (
              <ProtectedRoute enforcePageAccess={false}>
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
            path: 'crm/contacts',
            element: (
              <ProtectedRoute>
                {withRouteBoundary(<CRMContacts />)}
              </ProtectedRoute>
            ),
          },
          {
            path: 'crm/leads',
            element: (
              <ProtectedRoute>
                <CRMContacts />
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
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <ContractRenewalPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'compliance/password-register',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <PasswordRegisterPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'compliance/asset-register',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <AssetRegisterPage />
              </ProtectedRoute>
            ),
          },
          // Recruitment routes
          {
            path: 'recruitment/vetting',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
                <Vetting />
              </ProtectedRoute>
            ),
          },
          {
            path: 'recruitment/cbt',
            element: (
              <ProtectedRoute allowedRoles={['administrator', 'manager'] as UserRole[]}>
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
          {
            path: 'recruitment/test-session/:testId',
            element: (
              <ProtectedRoute enforcePageAccess={false} accessPath="/recruitment/test-session">
                <TestSession />
              </ProtectedRoute>
            ),
          },
        ]
      }
    ]
  }
]);

export default router;
