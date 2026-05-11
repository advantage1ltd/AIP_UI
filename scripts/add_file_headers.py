from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'src'

PAGE_HEADERS = {
	'ActionCalendar.tsx': 'Action calendar route: task list, progress, and scheduling for staff.',
	'Index.tsx': 'Role-based landing redirect after authentication.',
	'LoginPage.tsx': 'Public login and password reset entry.',
	'Profile.tsx': 'Signed-in user profile view and edits.',
	'ReportsDashboard.tsx': 'Customer reporting dashboard tabs backed by incidentService.',
	'Settings.tsx': 'Application settings including page-access toggles.',
	'administration/EmployeeRegistration.tsx': 'Employee roster administration and EmployeeForm entry.',
	'administration/StockControl.tsx': 'Stock control administration screen.',
	'administration/UserSetup.tsx': 'User administration list and UserForm dialogs.',
	'compliance/AssetRegisterPage.tsx': 'Compliance asset register list and AssetForm.',
	'compliance/GuardCertificationPage.tsx': 'Guard certification tracking for compliance.',
	'crm/CRMDashboard.tsx': 'CRM pipeline dashboard and summary widgets.',
	'crm/CRMContacts.tsx': 'CRM contacts list and contact form.',
	'crm/Deals.tsx': 'CRM deals pipeline board.',
	'crm/Leads.tsx': 'CRM leads list and conversion actions.',
	'customer/CustomerCrimeIntelligence.tsx': 'Customer crime intelligence charts and filters.',
	'customer/CustomerDailyActivityReport.tsx': 'Customer daily activity report entry and table.',
	'customer/CustomerDailyOccurrenceBook.tsx': 'Customer daily occurrence book entries.',
	'customer/CustomerReporting.tsx': 'Customer reporting hub navigation.',
	'customer/DailyActivityReportGraphs.tsx': 'Customer daily activity chart views.',
	'customer/IncidentGraph.tsx': 'Customer incident graph and type breakdown.',
	'employee/EmployeeDiaryPage.tsx': 'Employee diary activities and ActivityForm.',
	'employee/UniformEquipmentPage.tsx': 'Uniform and equipment issuance tracking.',
	'management/CustomerReportingPage.tsx': 'Management customer reporting aggregates.',
	'management/OfficerPerformance.tsx': 'Officer performance metrics for managers.',
	'operations/BankHolidayPage.tsx': 'Bank holiday authorization workflow.',
	'operations/CustomerSatisfactionPage.tsx': 'Customer satisfaction survey capture.',
	'operations/OfficerSupportPage.tsx': 'Officer support requests and follow-up.',
	'operations/SafeDuressWordsPage.tsx': 'Safe duress words reference for officers.',
	'operations/components/SurveyForm.tsx': 'Shared survey form sections for satisfaction flows.',
	'recruitment/TakeTest.tsx': 'Candidate test-taking flow for recruitment.',
	'recruitment/TestSession.tsx': 'Recruitment test session proctoring UI.',
}

COMPONENT_HEADERS = {
	'Footer.tsx': 'Application footer shell content.',
	'Header.tsx': 'Top header with navigation, search, and user menu.',
	'RoleBasedRedirect.tsx': 'Redirects authenticated users by role to their home route.',
	'theme-toggle.tsx': 'Light and dark theme toggle control.',
	'action-calendar/AddTaskForm.tsx': 'Create-task form for the action calendar.',
	'action-calendar/TaskProgressSheet.tsx': 'Task progress update sheet for assignees.',
	'administration/UserDialog.tsx': 'User create/edit dialog wrapper.',
	'compliance/AssetForm.tsx': 'Compliance asset create/edit form.',
	'customer/DailyActivityForm.tsx': 'Customer daily activity capture form.',
	'customer/DailyActivityTable.tsx': 'Customer daily activity results table.',
	'customer-setup/CustomerDialog.tsx': 'Customer setup dialog with regions and sites.',
	'customer-setup/CustomerStats.tsx': 'Customer setup summary statistics cards.',
	'customer-setup/CustomersTable.tsx': 'Customer administration data table.',
	'customer-setup/RegionsTable.tsx': 'Customer regions table and actions.',
	'customer-setup/SiteDialog.tsx': 'Site create/edit dialog for customer setup.',
	'customer-setup/SitesTable.tsx': 'Customer sites table and actions.',
	'dashboard/DashboardGreeting.tsx': 'Dashboard greeting banner for the signed-in user.',
	'dashboard/IncidentTable.tsx': 'Recent incidents table on the dashboard.',
	'dashboard/OfficerPerformance.tsx': 'Officer performance widget on the dashboard.',
	'dashboard/SidebarNavigation.tsx': 'Sidebar navigation tree from navigation config.',
	'dashboard/sidebar/OperationsSection.tsx': 'Operations section links in the sidebar.',
	'employee-registration/EmployeesTable.tsx': 'Employee roster table with actions.',
	'employee/ActivityForm.tsx': 'Employee diary activity capture form.',
	'layout/Logo.tsx': 'Brand logo used in layout header and sidebar.',
	'stock/StockTable.tsx': 'Stock items table for administration.',
}


def add_header(path: Path, description: str) -> bool:
	text = path.read_text(encoding='utf-8')
	if text.lstrip().startswith('/**'):
		return False
	header = f'/**\n * {description}\n */\n'
	path.write_text(header + text, encoding='utf-8')
	return True


def main() -> None:
	changed = 0
	for rel, desc in PAGE_HEADERS.items():
		path = ROOT / 'pages' / rel
		if path.exists() and add_header(path, desc):
			changed += 1
	for rel, desc in COMPONENT_HEADERS.items():
		path = ROOT / 'components' / rel
		if path.exists() and add_header(path, desc):
			changed += 1
	print('headers added', changed)


if __name__ == '__main__':
	main()
