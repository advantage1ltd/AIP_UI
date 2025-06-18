import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { DUMMY_REGIONS } from "@/data/mockRegions"
import type { Region } from "@/types/customer"
import { RegionDialog } from "./RegionDialog"
import { TableActions } from "./table-components/TableActions"
import { Pencil, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface RegionsTableProps {
  selectedCustomerId: string | null
}

export function RegionsTable({ selectedCustomerId }: RegionsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const currentRegions = selectedCustomerId
    ? DUMMY_REGIONS.filter(region => region.customerId === selectedCustomerId)
    : []

  const handleEdit = (region: Region) => {
    setSelectedRegion(region)
    setDialogOpen(true)
  }

  const handleNewRegion = () => {
    setSelectedRegion(undefined)
    setDialogOpen(true)
  }

  // Then filter by search query
  const filteredRegions = currentRegions.filter(region => {
    const searchLower = searchQuery.toLowerCase()
    return (
      region.name.toLowerCase().includes(searchLower) ||
      region.manager.toLowerCase().includes(searchLower) ||
      region.status.toLowerCase().includes(searchLower)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRegionsTable = filteredRegions.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Regions</h2>
        <Button onClick={() => setDialogOpen(true)}>Add Region</Button>
      </div>

      <div className="rounded-md border">
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
            {currentRegionsTable.length > 0 ? (
              currentRegionsTable.map((region) => (
                <TableRow key={region.id} className="text-xs md:text-sm hover:bg-gray-50/80 transition-colors">
                  <TableCell className="py-2 md:py-3 font-medium">{region.name}</TableCell>
                  <TableCell className="py-2 md:py-3">{region.manager}</TableCell>
                  <TableCell className="py-2 md:py-3">
                    <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                      region.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {region.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 md:py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(region)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No regions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredRegions.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-gray-500">
            Showing {Math.min(filteredRegions.length, startIndex + 1)}-{Math.min(filteredRegions.length, endIndex)} of {filteredRegions.length}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-xs px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}

      <RegionDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        region={selectedRegion}
        selectedCustomerId={selectedCustomerId}
      />
    </div>
  )
}