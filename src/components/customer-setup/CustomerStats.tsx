import { Card, CardContent } from "@/components/ui/card"
import { DUMMY_CUSTOMERS } from "@/data/customers"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import { DUMMY_SITES } from "@/data/mockSites"

interface CustomerStatsProps {
  selectedCustomerId: string | null
}

export function CustomerStats({ selectedCustomerId }: CustomerStatsProps) {
  // Get filtered data based on selected customer
  const customers = selectedCustomerId 
    ? DUMMY_CUSTOMERS.filter(customer => customer.id === selectedCustomerId)
    : DUMMY_CUSTOMERS

  const regions = selectedCustomerId 
    ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
    : DUMMY_REGIONS

  const sites = selectedCustomerId
    ? DUMMY_SITES.filter(site => site.customerId === selectedCustomerId)
    : DUMMY_SITES

  const stats = [
    {
      title: "Total Customers",
      value: customers.length,
      description: "Active customers in the system"
    },
    {
      title: "Total Regions",
      value: regions.length,
      description: "Regions across all customers"
    },
    {
      title: "Total Sites",
      value: sites.length,
      description: "Sites across all regions"
    },
    {
      title: "Core Sites",
      value: sites.filter(site => site.isCoreSite).length,
      description: "High priority sites"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
