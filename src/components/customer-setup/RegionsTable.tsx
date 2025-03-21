import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RegionDialog } from "./RegionDialog"
import { DUMMY_REGIONS } from "@/data/regions"
import { TableActions } from "./table-components/TableActions"
import { Pencil, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<any | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRegions = filteredRegions.slice(startIndex, endIndex)

  return (
    <div className="space-y-2 md:space-y-4">
      <TableActions 
        title="Regions"
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1) // Reset to first page on search
        }}
        onNew={handleNewRegion}
        searchPlaceholder="Search regions..."
        newButtonText="New Region"
      />

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3">Region Name</TableHead>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3 hidden sm:table-cell">Manager</TableHead>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3">Status</TableHead>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRegions.length > 0 ? (
                currentRegions.map((region) => (
                  <TableRow key={region.id} className="text-xs md:text-sm hover:bg-gray-50/80 transition-colors">
                    <TableCell className="py-2 md:py-3 font-medium">{region.name}</TableCell>
                    <TableCell className="py-2 md:py-3 hidden sm:table-cell">{region.manager}</TableCell>
                    <TableCell className="py-2 md:py-3">
                      <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                        region.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {region.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-2 md:py-3">
                      {/* Desktop Actions */}
                      <div className="hidden sm:flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRegion(region)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-blue-50"
                        >
                          <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                      
                      {/* Mobile Actions */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem 
                              className="cursor-pointer text-xs py-1.5"
                              onClick={() => handleEditRegion(region)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-blue-600 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-xs text-red-600 py-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-16 text-center text-xs md:text-sm text-gray-500">
                    {selectedCustomerId ? 'No regions found for this customer' : 'No regions found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        region={selectedRegion}
        customerId={selectedCustomerId}
      />
    </div>
  )
}