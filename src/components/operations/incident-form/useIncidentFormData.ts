/**
 * Loads customer, site, and county options for IncidentForm cascading selects.
 * Customer change clears and reloads sites; edit mode prefills site by id or name when options arrive.
 */
import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { customerService } from '@/services/customerService'
import { siteService } from '@/services/siteService'
import { lookupTableService, type LookupTableItem } from '@/services/lookupTableService'
import { incidentService } from '@/services/incidentService'
import type { Customer, Site } from '@/types/customer'
import { IncidentType, type Incident } from '@/types/incidents'
import { logger } from '@/utils/logger'
import type { IncidentFormValues } from './incidentFormSchema'
import { INCIDENT_OFFICER_ROLE_OPTIONS } from './incidentFormConstants'

type UseIncidentFormDataArgs = {
	form: UseFormReturn<IncidentFormValues>
	customerId: string
	initialData?: Incident | null
	propCustomerId?: string
	propSiteId?: string | null
}

const INCIDENT_TYPE_CATEGORY_CANDIDATES = [
	'Incident_Types',
	'IncidentTypes',
	'Incident_Type',
	'IncidentType',
	'Incident Type',
]

const INCIDENT_CATEGORY_CANDIDATES = [
	'Incident_Categories',
	'IncidentCategories',
	'Incident_Category',
	'IncidentCategory',
	'Incident_Involved',
	'IncidentInvolved',
	'Incident Involved',
]

const OFFICER_ROLE_CATEGORY_CANDIDATES = [
	'Officer_Roles',
	'OfficerRoles',
	'Officer_Role',
	'OfficerRole',
	'Officer Roles',
]

const DEFAULT_INCIDENT_CATEGORIES = [
	'Shoplifting / Theft',
	'Threats and Intimidation',
	'Self-Scan / Scan & Go Misuse',
	'Injury / Medical Emergency',
	'Fraud (Refund / Price Switching / Barcode Abuse)',
	'Violent Behaviour',
	'Police Related (Attended / Failed to Attend)',
	'Others',
	'Abusive Behaviour',
	'Ban from Store / Trespassing',
	'Internal Theft',
]

const DEFAULT_INCIDENT_TYPES = Object.values(IncidentType)

const normalizeDistinctValues = (values: Array<string | undefined | null>): string[] => {
	const deduped = new Map<string, string>()
	for (const raw of values) {
		if (!raw) continue
		const trimmed = raw.trim()
		if (!trimmed) continue
		const key = trimmed.toLowerCase()
		if (!deduped.has(key)) {
			deduped.set(key, trimmed)
		}
	}
	return Array.from(deduped.values())
}

const loadFirstAvailableLookupCategory = async (candidates: string[]): Promise<LookupTableItem[]> => {
	for (const category of candidates) {
		try {
			const result = await lookupTableService.getByCategory(category)
			if (result.length > 0) {
				return result
			}
		} catch {
			// Keep trying candidate categories until one resolves with values.
		}
	}
	return []
}

export const useIncidentFormData = ({
	form,
	customerId,
	initialData,
	propCustomerId,
	propSiteId,
}: UseIncidentFormDataArgs) => {
	const [customers, setCustomers] = useState<Customer[]>([])
	const [sites, setSites] = useState<Site[]>([])
	const [counties, setCounties] = useState<LookupTableItem[]>([])
	const [incidentTypes, setIncidentTypes] = useState<string[]>([])
	const [incidentCategories, setIncidentCategories] = useState<string[]>(DEFAULT_INCIDENT_CATEGORIES)
	const [officerRoles, setOfficerRoles] = useState<string[]>([...INCIDENT_OFFICER_ROLE_OPTIONS])
	const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
	const [isLoadingSites, setIsLoadingSites] = useState(false)
	const [isLoadingCounties, setIsLoadingCounties] = useState(false)
	const [isLoadingIncidentLookups, setIsLoadingIncidentLookups] = useState(false)
	const didPrefillSiteRef = useRef(false)
	const previousCustomerIdRef = useRef<string | null>(null)

	// === Reference data (customers) ===
	useEffect(() => {
		const fetchCustomers = async () => {
			setIsLoadingCustomers(true)
			try {
				const fixedCustomerId = propCustomerId || initialData?.customerId?.toString()
				const fetchedCustomers = fixedCustomerId
					? (() => {
						const customerPromise = customerService.getCustomer(fixedCustomerId)
						return customerPromise.then(customer => (customer ? [customer] : []))
					})()
					: customerService.getAllCustomers()
				const resolvedCustomers = await fetchedCustomers
				setCustomers(resolvedCustomers)
				logger.debug('[IncidentForm] Loaded customers:', resolvedCustomers.length)
			} catch (error) {
				logger.error('[IncidentForm] Failed to load customers:', error)
			} finally {
				setIsLoadingCustomers(false)
			}
		}

		void fetchCustomers()
	}, [initialData?.customerId, propCustomerId])

	// === Reference data (counties) ===
	useEffect(() => {
		const fetchCounties = async () => {
			setIsLoadingCounties(true)
			try {
				const fetchedCounties = await lookupTableService.getByCategory('UK_Counties')
				setCounties(fetchedCounties)
				logger.debug('[IncidentForm] Loaded counties:', fetchedCounties.length)
			} catch (error) {
				logger.error('[IncidentForm] Failed to load counties:', error)
				setCounties([])
			} finally {
				setIsLoadingCounties(false)
			}
		}

		void fetchCounties()
	}, [])

	// === Incident lookup options (types + categories) ===
	useEffect(() => {
		const fetchIncidentLookups = async () => {
			setIsLoadingIncidentLookups(true)
			try {
				const [incidentTypeLookup, incidentCategoryLookup, officerRoleLookup] = await Promise.all([
					loadFirstAvailableLookupCategory(INCIDENT_TYPE_CATEGORY_CANDIDATES),
					loadFirstAvailableLookupCategory(INCIDENT_CATEGORY_CANDIDATES),
					loadFirstAvailableLookupCategory(OFFICER_ROLE_CATEGORY_CANDIDATES),
				])

				const incidentTypeValues = normalizeDistinctValues(
					incidentTypeLookup.map(item => item.value)
				)

				const incidentCategoryValues = normalizeDistinctValues(
					incidentCategoryLookup.map(item => item.value)
				)
				const officerRoleValues = normalizeDistinctValues(
					officerRoleLookup.map(item => item.value)
				)

				if (incidentTypeValues.length > 0) {
					setIncidentTypes(incidentTypeValues)
				} else {
					// Fallback 1: derive live values from existing incident records.
					// Fallback 2: stable shared enum values to keep form operable.
					const incidents = await incidentService.getIncidents({ page: 1, pageSize: 200 })
					const backendDerivedIncidentTypes = normalizeDistinctValues(
						incidents.map(incident => incident.incidentType)
					)
					setIncidentTypes(
						backendDerivedIncidentTypes.length > 0
							? backendDerivedIncidentTypes
							: DEFAULT_INCIDENT_TYPES
					)
				}

				if (incidentCategoryValues.length > 0) {
					setIncidentCategories(incidentCategoryValues)
				} else {
					setIncidentCategories(DEFAULT_INCIDENT_CATEGORIES)
				}

				setOfficerRoles(
					officerRoleValues.length > 0 ? officerRoleValues : [...INCIDENT_OFFICER_ROLE_OPTIONS]
				)

				logger.debug('[IncidentForm] Loaded incident lookup options', {
					typeCount: incidentTypeValues.length,
					categoryCount: incidentCategoryValues.length,
					officerRoleCount: officerRoleValues.length,
				})
			} catch (error) {
				logger.error('[IncidentForm] Failed to load incident lookup options:', error)
				setIncidentTypes(DEFAULT_INCIDENT_TYPES)
				setIncidentCategories(DEFAULT_INCIDENT_CATEGORIES)
				setOfficerRoles([...INCIDENT_OFFICER_ROLE_OPTIONS])
			} finally {
				setIsLoadingIncidentLookups(false)
			}
		}

		void fetchIncidentLookups()
	}, [])

	// === Sites for selected customer ===
	useEffect(() => {
		const fetchSites = async () => {
			if (!customerId) {
				setSites([])
				form.setValue('siteId', '')
				form.setValue('siteName', '')
				return
			}

			if (previousCustomerIdRef.current && previousCustomerIdRef.current !== customerId) {
				didPrefillSiteRef.current = false
			}

			setIsLoadingSites(true)
			try {
				const customerIdNum = parseInt(customerId, 10)
				const response = await siteService.getSitesByCustomer(customerIdNum)
				if (response.success) {
					setSites(response.data)
					logger.debug('[IncidentForm] Loaded sites for customer:', response.data.length)
					if (initialData?.siteId && !didPrefillSiteRef.current) {
						const matchById = response.data.find(site => site.siteID?.toString() === initialData.siteId)
						const matchByName = response.data.find(site =>
							site.locationName?.toLowerCase().trim() === (initialData.siteName || '').toLowerCase().trim()
						)
						const matchedSite = matchById || matchByName

						form.setValue('siteId', matchedSite?.siteID?.toString() || initialData.siteId)
						form.setValue('siteName', matchedSite?.locationName || initialData.siteName || '')
						didPrefillSiteRef.current = true
					} else if (!initialData) {
						form.setValue('siteId', '')
						form.setValue('siteName', '')
					}
				}
			} catch (error) {
				logger.error('[IncidentForm] Failed to load sites:', error)
				setSites([])
			} finally {
				previousCustomerIdRef.current = customerId
				setIsLoadingSites(false)
			}
		}

		void fetchSites()
	}, [customerId, form, initialData])

	// Keep customerName in sync so submit payload matches the selected customer label.
	const handleCustomerChange = (customerIdValue: string) => {
		const customer = customers.find(c => c.id.toString() === customerIdValue)
		if (customer) {
			form.setValue('customerId', customerIdValue)
			form.setValue('customerName', customer.companyName)
		}
	}

	const handleSiteChange = (siteIdValue: string) => {
		const site = sites.find(s => s.siteID?.toString() === siteIdValue)
		if (site) {
			form.setValue('siteId', siteIdValue)
			form.setValue('siteName', site.locationName || '')
		}
	}

	return {
		customers,
		sites,
		counties,
		incidentTypes,
		incidentCategories,
		officerRoles,
		isLoadingCustomers,
		isLoadingSites,
		isLoadingCounties,
		isLoadingIncidentLookups,
		handleCustomerChange,
		handleSiteChange,
		propCustomerId,
		propSiteId,
	}
}
