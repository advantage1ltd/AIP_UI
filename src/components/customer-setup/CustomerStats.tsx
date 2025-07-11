import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Users, Star, TrendingUp, Shield } from "lucide-react"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import { DUMMY_SITES } from "@/data/mockSites"
import { useMemo, useState, useEffect } from "react"
import type { Customer } from "@/types/customer"

interface CustomerStatsProps {
  selectedCustomerId: string | null
  updateTrigger?: number // Add this to force re-renders
}

export function CustomerStats({ selectedCustomerId, updateTrigger }: CustomerStatsProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/customers')
        const result = await response.json()
        
        if (result.success) {
          setCustomers(result.data || [])
        } else {
          console.error('Failed to fetch customers:', result.message)
          setCustomers([])
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()

    // Listen for customer events to refresh data
    const handleCustomerEvent = () => {
      fetchCustomers()
    }

    window.addEventListener('customer-created', handleCustomerEvent)
    window.addEventListener('customer-updated', handleCustomerEvent)
    window.addEventListener('customer-deleted', handleCustomerEvent)
    
    return () => {
      window.removeEventListener('customer-created', handleCustomerEvent)
      window.removeEventListener('customer-updated', handleCustomerEvent)
      window.removeEventListener('customer-deleted', handleCustomerEvent)
    }
  }, [updateTrigger])

  // Get dynamic data from API and recalculate when data changes
  const statsData = useMemo(() => {
    // Get filtered data based on selected customer
    const filteredCustomers = selectedCustomerId 
      ? customers.filter(customer => String(customer.id) === selectedCustomerId)
      : customers

    const customerIdNum = selectedCustomerId ? parseInt(selectedCustomerId) : null
    const regions = customerIdNum 
      ? DUMMY_REGIONS.filter(region => region.customerId === customerIdNum)
      : DUMMY_REGIONS

    const sites = customerIdNum
      ? DUMMY_SITES.filter(site => site.customerId === customerIdNum)
      : DUMMY_SITES

    const activeCustomers = filteredCustomers.filter(customer => customer.status === 'active')
    const coreSites = sites.filter(site => site.isCoreSite)
    const customerTypes = [...new Set(filteredCustomers.map(c => c.customerType))].length

    return {
      customers: filteredCustomers,
      activeCustomers,
      regions,
      sites,
      coreSites,
      customerTypes
    }
  }, [customers, selectedCustomerId])

  const stats = [
    {
      title: "Total Customers",
      value: statsData.customers.length,
      description: `${statsData.activeCustomers.length} active customers`,
      icon: Users,
      gradient: "from-blue-600 to-blue-800",
      iconColor: "text-blue-100"
    },
    {
      title: "Customer Types",
      value: statsData.customerTypes,
      description: "Different service types",
      icon: TrendingUp,
      gradient: "from-purple-600 to-purple-800",
      iconColor: "text-purple-100"
    },
    {
      title: "Total Regions",
      value: statsData.regions.length,
      description: "Coverage areas managed",
      icon: MapPin,
      gradient: "from-green-600 to-green-800",
      iconColor: "text-green-100"
    },
    {
      title: "Core Sites",
      value: statsData.coreSites.length,
      description: `${statsData.sites.length} total sites`,
      icon: Shield,
      gradient: "from-orange-600 to-orange-800",
      iconColor: "text-orange-100"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-3 bg-white/20 rounded animate-pulse"></div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="border-0 shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.gradient} text-white`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-white/80">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/70">
                      {stat.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
