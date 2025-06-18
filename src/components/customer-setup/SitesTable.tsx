import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { DUMMY_SITES } from "@/data/mockSites"
import type { Site } from "@/types/customer"

interface SitesTableProps {
  selectedCustomerId: string | null
}

export function SitesTable({ selectedCustomerId }: SitesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | undefined>()

  const currentSites = selectedCustomerId
    ? DUMMY_SITES.filter(site => site.customerId === selectedCustomerId)
    : []

  const handleEdit = (site: Site) => {
    setSelectedSite(site)
    setDialogOpen(true)
  }

  const getResponsiveClasses = (field: string) => {
    switch (field) {
      case 'address':
        return 'hidden md:table-cell'
      case 'telephone':
        return 'hidden lg:table-cell'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Sites</h2>
        <Button onClick={() => setDialogOpen(true)}>Add Site</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location Name</TableHead>
              <TableHead className={getResponsiveClasses('address')}>Address</TableHead>
              <TableHead>SIN Number</TableHead>
              <TableHead className={getResponsiveClasses('telephone')}>Telephone</TableHead>
              <TableHead>Core Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSites.length > 0 ? (
              currentSites.map((site) => (
                <TableRow key={site.id} className="text-xs md:text-sm hover:bg-gray-50/80 transition-colors">
                  <TableCell className="py-2 md:py-3 font-medium">{site.locationName}</TableCell>
                  <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('address')}`}>
                    {site.buildingName}, {site.street}, {site.town}, {site.postcode}
                  </TableCell>
                  <TableCell className="py-2 md:py-3">{site.sinNumber}</TableCell>
                  <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('telephone')}`}>
                    {site.telephone}
                  </TableCell>
                  <TableCell className="py-2 md:py-3">
                    <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                      site.isCoreSite
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {site.isCoreSite ? 'Core' : 'Standard'}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 md:py-3">
                    <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                      site.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {site.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 md:py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(site)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No sites found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}