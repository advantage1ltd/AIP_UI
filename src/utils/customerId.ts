import { User } from '@/types/user'
import { isCustomerRole as checkIsCustomerTenant } from '@/utils/roles'
import { logger } from '@/utils/logger'

/**
 * Extracts customerId from user object
 * Relies on API response data (CustomerId or customerId field)
 * The backend API returns CustomerId (PascalCase) which should be normalized to customerId (camelCase) during login
 */
export const extractCustomerId = (user: User | null): number | null => {
	if (!user) {
		logger.debug('[extractCustomerId] User is null');
		return null;
	}

	const userRole = (user.role || (user as any).Role || '').toLowerCase();
	if (!checkIsCustomerTenant(userRole)) {
		return null;
	}

	if (!('customerId' in user)) {
		return null;
	}

	const customerId = user.customerId ?? (user as any).CustomerId ?? null;

	if (!customerId || customerId === 0) {
		logger.debug('[extractCustomerId] Missing customerId for customer role');
		return null;
	}

	return customerId;
}

/**
 * Async version for future extensibility
 * Currently just uses the synchronous extraction
 */
export const extractCustomerIdAsync = async (user: User | null): Promise<number | null> => {
	return extractCustomerId(user)
}
