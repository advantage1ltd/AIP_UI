import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteDialog } from "./SiteDialog"
import { DUMMY_SITES } from "@/data/sites"
import { TableActions } from "./table-components/TableActions"

interface SitesTableProps {
  selectedCustomerId: string | null
}

export function SitesTable({ selectedCustomerId }: SitesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<any | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  const handleNewSite = () => {
    setSelectedSite(undefined)
    setIsDialogOpen(true)
  }

  const handleEditSite = (site: any) => {
    setSelectedSite(site)
    setIsDialogOpen(true)
  }

  // First filter by customer ID
  const customerSites = selectedCustomerId 
    ? DUMMY_SITES.filter(site => site.customerId === selectedCustomerId)
    : DUMMY_SITES

  // Then filter by search query
  const filteredSites = customerSites.filter(site => {
    const searchLower = searchQuery.toLowerCase()
    return (
      site.locationName.toLowerCase().includes(searchLower) ||
      site.buildingName.toLowerCase().includes(searchLower) ||
      site.town.toLowerCase().includes(searchLower) ||
      site.postcode.toLowerCase().includes(searchLower) ||
      site.telephone.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      <TableActions 
        title="Sites"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNew={handleNewSite}
        searchPlaceholder="Search sites..."
        newButtonText="New Site"
      />

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Core Site</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.locationName}</TableCell>
                <TableCell>
                  {site.buildingName}, {site.street}, {site.town}, {site.postcode}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    site.isCoreSite
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {site.isCoreSite ? 'Core' : 'Standard'}
                  </span>
                </TableCell>
                <TableCell>{site.telephone}</TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleEditSite(site)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SiteDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        site={selectedSite}
        customerId={selectedCustomerId}
      />
    </div>
  )
}