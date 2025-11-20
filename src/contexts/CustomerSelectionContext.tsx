import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface Customer {
	id: number
	name: string
}

interface CustomerSelectionContextType {
	selectedCustomerId: number | null
	selectedCustomer: Customer | null
	setSelectedCustomerId: (customerId: number | null) => void
	isAdmin: boolean
	needsCustomerSelection: boolean
}

const CustomerSelectionContext = createContext<CustomerSelectionContextType | undefined>(undefined)

interface CustomerSelectionProviderProps {
	children: ReactNode
}

export const CustomerSelectionProvider: React.FC<CustomerSelectionProviderProps> = ({ children }) => {
	const { user } = useAuth()
	const [selectedCustomerId, setSelectedCustomerIdState] = useState<number | null>(null)

	const isAdmin = user?.role === 'Administrator'
	const needsCustomerSelection = isAdmin

	// Load selected customer from localStorage on mount
	useEffect(() => {
		if (isAdmin) {
			const stored = localStorage.getItem('adminSelectedCustomerId')
			if (stored) {
				const customerId = parseInt(stored, 10)
				if (!isNaN(customerId)) {
					setSelectedCustomerIdState(customerId)
				}
			}
		} else {
			// For non-admin users, use their customerId
			const customerId = user && 'customerId' in user ? (user as any).customerId : null
			if (customerId) {
				setSelectedCustomerIdState(typeof customerId === 'string' ? parseInt(customerId, 10) : customerId)
			}
		}
	}, [isAdmin, user])

	// URL sync is now handled by CustomerSelectionUrlSync component inside Router context

	// Store selected customer in localStorage when it changes
	// Use useCallback to ensure stable function reference
	const setSelectedCustomerId = useCallback((customerId: number | null) => {
		setSelectedCustomerIdState(customerId)
		if (isAdmin) {
			if (customerId !== null) {
				localStorage.setItem('adminSelectedCustomerId', customerId.toString())
			} else {
				localStorage.removeItem('adminSelectedCustomerId')
			}
		}
	}, [isAdmin])

	// For now, we'll fetch customer details when needed
	// In a real scenario, you might want to cache this
	const selectedCustomer: Customer | null = selectedCustomerId
		? { id: selectedCustomerId, name: '' } // Name will be fetched when needed
		: null

	return (
		<CustomerSelectionContext.Provider
			value={{
				selectedCustomerId,
				selectedCustomer,
				setSelectedCustomerId,
				isAdmin,
				needsCustomerSelection
			}}
		>
			{children}
		</CustomerSelectionContext.Provider>
	)
}

export const useCustomerSelection = (): CustomerSelectionContextType => {
	const context = useContext(CustomerSelectionContext)
	if (context === undefined) {
		throw new Error('useCustomerSelection must be used within a CustomerSelectionProvider')
	}
	return context
}
