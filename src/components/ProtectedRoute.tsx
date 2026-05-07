import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageAccessContext } from '@/contexts/PageAccessContext';
import { UserRole } from '@/types/user';
import { hasRoleMatch } from '@/utils/roles';
const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true';

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
	
	// Track route changes and access checks
	useEffect(() => {
		if (!debugLogsEnabled) return
		const mountTime = mountTimeRef.current
		const timestamp = Date.now();
		const elapsed = timestamp - mountTime;
		
		// Log route entry
		console.group(`🛡️ [ProtectedRoute] Route Protection Check - ${pathToCheck}`);
		console.log('📍 Route Info:', {
			path: pathToCheck,
			fullPath: location.pathname + location.search,
			accessPath: accessPath,
			enforcePageAccess,
			elapsedFromMount: `${elapsed}ms`
		});
		console.log('👤 Auth State:', {
			hasUser: !!user,
			userRole: user?.role,
			authLoading,
			userId: user?.id
		});
		console.log('🔐 Page Access State:', {
			hasContext: !!pageAccess,
			currentRole: pageAccess?.currentRole,
			status: pageAccess?.status,
			isLoading: pageAccess?.isLoading,
			availablePagesCount: pageAccess?.availablePages?.length || 0
		});
		console.log('✅ Route Config:', {
			allowedRoles: allowedRoles || 'none specified',
			enforcePageAccess
		});
		
		// Track path changes
		if (previousPathRef.current && previousPathRef.current !== pathToCheck) {
			console.log('🔄 Path Changed:', {
				from: previousPathRef.current,
				to: pathToCheck,
				reason: 'location update'
			});
		}
		previousPathRef.current = pathToCheck;
		
		console.groupEnd();
		
		return () => {
			// Cleanup logging on unmount
			const unmountTime = Date.now();
			const totalTime = unmountTime - mountTime;
			console.log(`🛡️ [ProtectedRoute] Unmounting ${pathToCheck} after ${totalTime}ms`);
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
		if (debugLogsEnabled) {
			console.group('🚫 [ProtectedRoute] REDIRECT: Not Authenticated');
			console.log('📋 Redirect Details:', {
				from: pathToCheck,
				to: '/login',
				reason: 'User not authenticated',
				timestamp: new Date().toISOString()
			});
			console.groupEnd();
		}
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Check role-based access (from user object)
	if (allowedRoles && !hasRoleMatch(user.role, allowedRoles)) {
		if (debugLogsEnabled) {
			console.group('🚫 [ProtectedRoute] REDIRECT: Role Blocked');
			console.log('📋 Redirect Details:', {
				from: pathToCheck,
				to: '/dashboard',
				reason: 'Role not in allowedRoles',
				userRole: user.role,
				requiredRoles: allowedRoles,
				timestamp: new Date().toISOString()
			});
			console.log('🔍 Role Check:', {
				userRole: user.role,
				allowedRoles,
				isIncluded: allowedRoles.includes(user.role),
				matchDetails: allowedRoles.map(role => ({
					role,
					matches: role === user.role,
					userRoleType: typeof user.role,
					allowedRoleType: typeof role
				}))
			});
			console.groupEnd();
		}
		return <Navigate to="/dashboard" replace />;
	}

	// Check page access settings (only if enforcePageAccess is true)
	if (enforcePageAccess && pageAccess) {
		if (pageAccess.status === 'loading') {
			if (debugLogsEnabled) {
				console.log('⏳ [ProtectedRoute] Waiting for page access settings:', pathToCheck);
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
				console.warn('⚠️ [ProtectedRoute] Backend offline, preserving session and showing fallback state:', pathToCheck);
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
			if (debugLogsEnabled) {
				console.group('🚫 [ProtectedRoute] REDIRECT: Access Denied by Page Access');
				console.log('📋 Redirect Details:', {
					from: pathToCheck,
					to: '/dashboard',
					reason: 'PageAccess.hasAccess() returned false',
					userRole: user.role,
					currentRole: pageAccess.currentRole,
					pageAccessStatus: pageAccess.status,
					timestamp: new Date().toISOString()
				});
				console.log('🔍 Access Check Context:', {
					enforcePageAccess,
					pageAccessContextAvailable: !!pageAccess,
					hasAccessResult: false,
					availablePagesCount: pageAccess?.availablePages?.length || 0,
					pageAccessByRoleKeys: Object.keys(pageAccess?.pageAccessByRole || {})
				});
				console.groupEnd();
			}
			return <Navigate to="/dashboard" replace />;
		} else if (debugLogsEnabled) {
			console.log('✅ [ProtectedRoute] Access granted:', {
				path: pathToCheck,
				userRole: user.role,
				currentRole: pageAccess.currentRole
			});
		}
	}

	if (debugLogsEnabled) {
		console.log('✅ [ProtectedRoute] Rendering children for:', pathToCheck);
	}
	return <>{children}</>;
};

export default ProtectedRoute;