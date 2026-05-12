import { useState, useEffect } from 'react'
import { customerService } from '@/services/customerService'
import { logger } from '@/utils/logger'

interface AvailableCustomer {
	id: number
	name: string
}

const mapCustomers = (customers: Awaited<ReturnType<typeof customerService.getAllCustomers>>): AvailableCustomer[] =>
	customers.map((customer) => ({
		id: Number(customer.id),
		name: customer.companyName,
	}))

export const useAvailableCustomers = () => {
	const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const refreshCustomers = async () => {
		try {
			setIsLoading(true)
			const customers = await customerService.getAllCustomers()
			setAvailableCustomers(mapCustomers(customers))
		} catch (error) {
			logger.error('[useAvailableCustomers] Error fetching customers:', error)
			setAvailableCustomers([])
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void refreshCustomers()

		const handleCustomerEvent = () => {
			void refreshCustomers()
		}

		window.addEventListener('customer-created', handleCustomerEvent)
		window.addEventListener('customer-updated', handleCustomerEvent)
		window.addEventListener('customer-deleted', handleCustomerEvent)

		return () => {
			window.removeEventListener('customer-created', handleCustomerEvent)
			window.removeEventListener('customer-updated', handleCustomerEvent)
			window.removeEventListener('customer-deleted', handleCustomerEvent)
		}
	}, [])

	return {
		availableCustomers,
		isLoading,
		refreshCustomers,
	}
}

export const getAvailableCustomers = async (): Promise<AvailableCustomer[]> => {
	const customers = await customerService.getAllCustomers()
	return mapCustomers(customers)
}

export const findCustomerById = async (id: number | string): Promise<AvailableCustomer | undefined> => {
	const customers = await getAvailableCustomers()
	const searchId = typeof id === 'string' ? parseInt(id, 10) : id
	return customers.find((customer) => customer.id === searchId)
}
