import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, Building2 } from "lucide-react"
import { Customer } from "@/data/customers"
import { Region } from "@/data/regions"
import { Site } from "@/data/sites"

interface CustomerStatsProps {
  customers: Customer[]
  regions: Region[]
  sites: Site[]
}

export function CustomerStats({ customers, regions, sites }: CustomerStatsProps) {
  // Calculate active counts
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const activeRegions = regions.filter(r => r.status === 'active').length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Customers */}
      <Card className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Total Customers</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {customers.length}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {activeCustomers} active
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Regions */}
      <Card className="bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Total Regions</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {regions.length}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {activeRegions} active
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Sites */}
      <Card className="bg-gradient-to-br from-purple-800 via-purple-700 to-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Total Sites</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {sites.length}
              </h3>
              <p className="text-sm text-white/80 mt-1">
                {sites.filter(s => s.isCoreSite).length} core sites
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
