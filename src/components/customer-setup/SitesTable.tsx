import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteDialog } from "./SiteDialog"
import { DUMMY_SITES } from "@/data/sites"
import { TableActions } from "./table-components/TableActions"
import { Pencil, MoreVertical, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface SitesTableProps {
  selectedCustomerId: string | null
}

export function SitesTable({ selectedCustomerId }: SitesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<any | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSites = filteredSites.slice(startIndex, endIndex)

  // Function to determine which columns to hide on different screen sizes
  const getResponsiveClasses = (column: string) => {
    switch (column) {
      case 'address':
        return 'hidden md:table-cell'
      case 'contact':
        return 'hidden md:table-cell'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <TableActions 
        title="Sites"
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1) // Reset to first page on search
        }}
        onNew={handleNewSite}
        searchPlaceholder="Search sites..."
        newButtonText="New Site"
      />

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3">Location Name</TableHead>
                <TableHead className={`text-xs md:text-sm font-medium py-2 md:py-3 ${getResponsiveClasses('address')}`}>Address</TableHead>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3">Core Site</TableHead>
                <TableHead className={`text-xs md:text-sm font-medium py-2 md:py-3 ${getResponsiveClasses('contact')}`}>Contact</TableHead>
                <TableHead className="text-xs md:text-sm font-medium py-2 md:py-3 text-right">Actions</TableHead>
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
                    <TableCell className="py-2 md:py-3">
                      <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                        site.isCoreSite
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {site.isCoreSite ? 'Core' : 'Standard'}
                      </span>
                    </TableCell>
                    <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('contact')}`}>{site.telephone}</TableCell>
                    <TableCell className="text-right py-2 md:py-3">
                      {/* Desktop Actions */}
                      <div className="hidden sm:flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSite(site)}
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
                              onClick={() => handleEditSite(site)}
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
                  <TableCell colSpan={5} className="h-16 text-center text-xs md:text-sm text-gray-500">
                    {selectedCustomerId ? 'No sites found for this customer' : 'No sites found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredSites.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-gray-500">
            Showing {Math.min(filteredSites.length, startIndex + 1)}-{Math.min(filteredSites.length, endIndex)} of {filteredSites.length}
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

      <SiteDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        site={selectedSite}
        selectedCustomerId={selectedCustomerId}
      />
    </div>
  )
}