/** Auth user model, admin user CRUD inputs, and customer assignment shapes. */
export type { UserRole } from '@/utils/roles'

import type { UserRole } from '@/utils/roles'

export interface Customer {
	id: string;
	companyName: string;
	companyNumber: string;
	vatNumber: string;
	status: 'active' | 'inactive';
	customerType: CustomerType[];
	regions: Region[];
	sites: Site[];
	createdAt: string;
	updatedAt: string;
}

export interface Region {
	id: string;
	name: string;
	customerId: string;
	manager: string;
	status: 'active' | 'inactive';
	createdAt: string;
	updatedAt: string;
}

export interface Site {
	id: string;
	name: string;
	regionId: string;
	customerId: string;
	address: {
		buildingName: string;
		street: string;
		town: string;
		county: string;
		postcode: string;
	};
	isCoreSite: boolean;
	sinNumber: string;
	telephone: string;
	status: 'active' | 'inactive';
	createdAt: string;
	updatedAt: string;
}

export type CustomerType =
	| 'Event'
	| 'Static'
	| 'Gatehouse'
	| 'Retail'
	| 'Mobile Patrol'
	| 'Keyholding & Alarm Response'
	| 'Other';

export interface BaseUser {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRole;
	pageAccessRole: UserRole;
	signature?: string;
	signatureCode?: string;
	jobTitle?: string;
	twoFactorEnabled?: boolean;
	/** When true, the API sends an email after each successful sign-in. */
	notifySignInEmail?: boolean;
	profilePhotoFile?: string;
	recordIsDeleted?: boolean;
	createdAt: string;
	updatedAt: string;
	employeeId?: number;
	employeeName?: string;
	/** Present for customer logins; may appear on normalized API payloads for other roles. */
	customerId?: number;
	/** Staff multi-tenant assignments; optional on customer accounts in legacy UI. */
	assignedCustomerIds?: number[];
	lastLogin?: string;
	phoneNumber?: string;
	/** Legacy API casing retained for dashboard and auth normalization. */
	CustomerId?: number;
	Role?: UserRole | string;
	companyId?: number;
}

/** Tenant-scoped customer login (maps legacy site/HO customer managers). */
export interface CustomerUser extends BaseUser {
	role: 'customer';
	customerId: number;
	customerName?: string;
}

/** Internal staff roles with optional multi-customer assignments (officers). */
export interface StaffUser extends BaseUser {
	role: Exclude<UserRole, 'customer'>;
	assignedCustomerIds?: number[];
	assignedCustomerNames?: string[];
}

export type User = CustomerUser | StaffUser;

export interface Employee {
	id: string;
	userId: string;
	name: string;
	jobRole: string;
	department: string;
	startDate: string;
	status: 'active' | 'inactive';
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	success: boolean;
	data?: {
		user: User;
		accessToken: string;
	};
	message?: string;
}

export interface UserResponse {
	success: boolean;
	data: User;
	message?: string;
}

export interface UsersResponse {
	success: boolean;
	data: User[];
	pagination: {
		currentPage: number;
		totalPages: number;
		pageSize: number;
		totalCount: number;
	};
	message?: string;
}

export const AVAILABLE_CUSTOMERS = [
	{ id: 1, name: 'Central England COOP' },
	{ id: 22, name: 'Heart of England' },
	{ id: 23, name: 'Midcounties COOP' },
	{ id: 24, name: 'Eastbrook Worcester' },
	{ id: 25, name: 'Eastbrook Tewksbury' },
] as const;

export const USER_COMPANIES = [
	'Central England COOP',
	'Midcounties COOP',
	'Eastbrook Worcester',
	'Eastbrook Tewksbury',
	'Heart of England',
] as const;

export interface CreateUserInput extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
	confirmPassword?: string;
}
export interface UpdateUserInput extends Partial<Omit<User, 'createdAt' | 'updatedAt'>> {
	id: string;
}
