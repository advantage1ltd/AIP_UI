/**
 * Route guard: requires authenticated user, optional role list, and optional page-access path.
 * Flow: auth check → optional role match → PageAccess bootstrap wait → path access or redirect.
 */
import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageAccessContext } from '@/contexts/PageAccessContext';
import { UserRole } from '@/types/user';
import { hasRoleMatch } from '@/utils/roles';
import { isPageAccessBootstrapPending } from '@/utils/page-access-guards';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
	accessPath?: string;
	enforcePageAccess?: boolean;
}

const normalizePath = (path: string): string => {
	if (!path) return '/';
	const trimmed = path.trim();
	const hasLeadingSlash = trimmed.startsWith('/');
	const normalized = trimmed.replace(/\/+/g, '/');
	return hasLeadingSlash ? normalized : `/${normalized}`;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	allowedRoles,
	accessPath,
	enforcePageAccess = true,
}) => {
	const { user, isLoading: authLoading } = useAuth();
	const pageAccess = useContext(PageAccessContext);
	const location = useLocation();
	const previousPathRef = useRef<string>('');
	const mountTimeRef = useRef<number>(Date.now());
	const offlineNoticePathRef = useRef<string | null>(null);

	const pathToCheck = normalizePath(accessPath ?? location.pathname);
	
	// Lightweight trace for access debugging (silent unless VITE_DEBUG_LOGS=true in dev)
	useEffect(() => {
		const mountTime = mountTimeRef.current;
		const timestamp = Date.now();
		logger.debug('[ProtectedRoute] snapshot', {
			pathToCheck,
			fullPath: location.pathname + location.search,
			elapsedFromMountMs: timestamp - mountTime,
			hasUser: !!user,
			userRole: user?.role,
			authLoading,
			pageAccessStatus: pageAccess?.status,
			fromPath: previousPathRef.current !== pathToCheck ? previousPathRef.current : undefined,
		});
		previousPathRef.current = pathToCheck;
		return () => {
			logger.debug('[ProtectedRoute] unmount', { pathToCheck, livedMs: Date.now() - mountTime });
		};
	}, [pathToCheck, location.pathname, location.search, user, authLoading, pageAccess, allowedRoles, accessPath, enforcePageAccess]);

	useEffect(() => {
		if (pageAccess?.status !== 'offline') {
			offlineNoticePathRef.current = null;
		}
	}, [pageAccess?.status]);
	
	// Show loading only during initial auth check (not page access loading to prevent loops)
	if (authLoading) {
		return (
			<div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
				Checking permissions…
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!user) {
		logger.debug('[ProtectedRoute] redirect login', { from: pathToCheck });
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Prefer PageAccessRole (JWT / profile) over Identity primary role — matches PageAccessProvider.currentRole
	const routeRole = user.pageAccessRole ?? user.role

	// Check role-based access (from user object)
	if (allowedRoles && !hasRoleMatch(routeRole, allowedRoles)) {
		logger.debug('[ProtectedRoute] redirect role blocked', {
			pathToCheck,
			routeRole,
			allowedRoles,
		});
		return <Navigate to="/dashboard" replace />;
	}

	// Check page access settings (only if enforcePageAccess is true)
	if (enforcePageAccess && pageAccess) {
		if (isPageAccessBootstrapPending({
			status: pageAccess.status,
			pageAccessRoleCount: Object.keys(pageAccess.pageAccessByRole).length,
			availablePageCount: pageAccess.availablePages.length
		})) {
			if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
				logger.debug('[ProtectedRoute] waiting page access', {
					path: pathToCheck,
					status: pageAccess.status,
				});
			}
			return (
				<div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
					Checking page access settings…
				</div>
			);
		}

		if (pageAccess.status === 'offline') {
			if (import.meta.env.DEV && offlineNoticePathRef.current !== pathToCheck) {
				offlineNoticePathRef.current = pathToCheck;
				logger.debug('[ProtectedRoute] backend offline fallback', pathToCheck);
			}
			return (
				<div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
					<div className="text-sm font-medium text-amber-900">Backend connection is temporarily unavailable.</div>
					<div className="max-w-md text-xs text-amber-800">
						Your session is still active. Please retry in a moment without logging out.
					</div>
				</div>
			);
		}

		// Check access using page access settings
		const hasAccessResult = pageAccess.hasAccess(pathToCheck);
		
		if (!hasAccessResult) {
			logger.debug('[ProtectedRoute] access denied', {
				pathToCheck,
				currentRole: pageAccess.currentRole,
			});
			return <Navigate to="/dashboard" replace />;
		}
		logger.debug('[ProtectedRoute] access granted', {
			path: pathToCheck,
			currentRole: pageAccess.currentRole,
		});
	}

	logger.debug('[ProtectedRoute] render children', pathToCheck);
	return <>{children}</>;
};

export default ProtectedRoute;