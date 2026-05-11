/**
 * Role-based landing redirect after authentication.
 * Flow: read PageAccess role → lazy-load the matching dashboard route.
 */
import React, { Suspense } from 'react'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { normalizeRoleId } from '@/utils/roles'

const IncidentDashboard = React.lazy(() => import('@/pages/Dashboard/AdminIncidentDashboard'))

const Index = () => {
	const { currentRole, isTestMode, testRole, isLoading } = usePageAccess()
	const effectiveRole = isTestMode && testRole ? testRole : currentRole
	const normalizedRole = normalizeRoleId(effectiveRole)

	React.useEffect(() => {
		console.log('🏠 [Index] Component state:', {
			currentRole,
			isTestMode,
			testRole,
			effectiveRole,
			isLoading,
		})
	}, [currentRole, isTestMode, testRole, effectiveRole, isLoading])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="space-y-4 text-center">
					<div className="text-lg font-medium">Loading dashboard...</div>
					<div className="text-sm text-gray-500">Please wait...</div>
				</div>
			</div>
		)
	}

	if (
		normalizedRole === 'administrator' ||
		normalizedRole === 'manager' ||
		normalizedRole === 'securityofficer' ||
		normalizedRole === 'customer'
	) {
		return (
			<Suspense
				fallback={
					<div className="flex min-h-screen items-center justify-center">
						<div className="space-y-4 text-center">
							<div className="text-lg font-medium">Loading dashboard...</div>
							<div className="text-sm text-gray-500">Please wait...</div>
						</div>
					</div>
				}
			>
				<IncidentDashboard />
			</Suspense>
		)
	}

	console.warn('🏠 [Index] No matching role found, showing fallback. Role:', effectiveRole)
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="space-y-4 text-center">
				<div className="text-lg font-medium">Loading dashboard...</div>
				<div className="text-sm text-gray-500">Please wait while we prepare your view.</div>
				<div className="mt-2 text-xs text-gray-400">Current role: {effectiveRole || 'Not set'}</div>
			</div>
		</div>
	)
}

export default Index
