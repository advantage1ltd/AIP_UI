import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Users, Star, TrendingUp, Shield } from "lucide-react"
import { customerService } from "@/services/customerService"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import { DUMMY_SITES } from "@/data/mockSites"
import { useMemo } from "react"

interface CustomerStatsProps {
  selectedCustomerId: string | null
  updateTrigger?: number // Add this to force re-renders
}

export function CustomerStats({ selectedCustomerId, updateTrigger }: CustomerStatsProps) {
  // Get dynamic data from customerService and recalculate when updateTrigger changes
  const statsData = useMemo(() => {
    const customers = customerService.getAllCustomers()
    
    // Get filtered data based on selected customer
    const filteredCustomers = selectedCustomerId 
      ? customers.filter(customer => customer.id === selectedCustomerId)
      : customers

    const regions = selectedCustomerId 
      ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
      : DUMMY_REGIONS

    const sites = selectedCustomerId
      ? DUMMY_SITES.filter(site => site.customerId === selectedCustomerId)
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
  }, [selectedCustomerId, updateTrigger])

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
