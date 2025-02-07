import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RegionDialog } from "./RegionDialog"
import { DUMMY_REGIONS } from "@/data/regions"
import { TableActions } from "./table-components/TableActions"

interface RegionsTableProps {
  selectedCustomerId: string | null
}

export function RegionsTable({ selectedCustomerId }: RegionsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<any | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  const handleNewRegion = () => {
    setSelectedRegion(undefined)
    setIsDialogOpen(true)
  }

  const handleEditRegion = (region: any) => {
    setSelectedRegion(region)
    setIsDialogOpen(true)
  }

  // First filter by customer ID
  const customerRegions = selectedCustomerId 
    ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
    : DUMMY_REGIONS

  // Then filter by search query
  const filteredRegions = customerRegions.filter(region => {
    const searchLower = searchQuery.toLowerCase()
    return (
      region.name.toLowerCase().includes(searchLower) ||
      region.manager.toLowerCase().includes(searchLower) ||
      region.status.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      <TableActions 
        title="Regions"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNew={handleNewRegion}
        searchPlaceholder="Search regions..."
        newButtonText="New Region"
      />

      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegions.map((region) => (
              <TableRow key={region.id}>
                <TableCell>{region.name}</TableCell>
                <TableCell>{region.manager}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    region.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {region.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleEditRegion(region)}
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

      <RegionDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        region={selectedRegion}
        customerId={selectedCustomerId}
      />
    </div>
  )
}