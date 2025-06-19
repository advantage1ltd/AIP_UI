import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { sitesService } from "@/services/sitesService"
import type { Site } from "@/types/customer"
import { SiteDialog } from "./SiteDialog"
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight, Shield } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface SitesTableProps {
  selectedCustomerId: string | null
}

export function SitesTable({ selectedCustomerId }: SitesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sites, setSites] = useState<Site[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const itemsPerPage = 10

  // Load sites data
  const loadSites = async () => {
    setIsLoading(true)
    try {
      const result = await sitesService.getSites()
      if (result.success) {
        setSites(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load sites",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading sites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSites()
  }, [])

  const currentSites = selectedCustomerId
    ? sites.filter(site => site.customerId === selectedCustomerId)
    : []

  const handleEdit = (site: Site) => {
    setSelectedSite(site)
    setDialogOpen(true)
  }

  const handleNewSite = () => {
    setSelectedSite(undefined)
    setDialogOpen(true)
  }

  const handleDeleteClick = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!siteToDelete) return

    try {
      const result = await sitesService.deleteSite(siteToDelete.id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Site deleted successfully",
        })
        await loadSites() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete site",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  const handleDialogSuccess = async () => {
    await loadSites() // Refresh the data after successful creation/update
  }

  // Filter by search query
  const filteredSites = currentSites.filter(site => {
    const searchLower = searchQuery.toLowerCase()
    return (
      site.locationName.toLowerCase().includes(searchLower) ||
      site.buildingName.toLowerCase().includes(searchLower) ||
      site.town.toLowerCase().includes(searchLower) ||
      site.county.toLowerCase().includes(searchLower) ||
      site.postcode.toLowerCase().includes(searchLower) ||
      site.sinNumber.toLowerCase().includes(searchLower)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSitesTable = filteredSites.slice(startIndex, endIndex)

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getResponsiveClasses = (field: string) => {
    switch (field) {
      case 'address':
        return 'hidden md:table-cell'
      case 'telephone':
        return 'hidden lg:table-cell'
      case 'sin':
        return 'hidden xl:table-cell'
      default:
        return ''
    }
  }

  if (!selectedCustomerId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Sites</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          Please select a customer to view sites
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Sites</h2>
        <Button onClick={handleNewSite}>Add Site</Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading sites...</div>
      ) : currentSites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sites found for this customer. Click "Add Site" to create one.
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sites match your search criteria.
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className={getResponsiveClasses('address')}>Address</TableHead>
                  <TableHead className={getResponsiveClasses('sin')}>SIN</TableHead>
                  <TableHead className={getResponsiveClasses('telephone')}>Telephone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSitesTable.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{site.locationName}</div>
                        <div className="text-sm text-gray-500">{site.buildingName}</div>
                      </div>
                    </TableCell>
                    <TableCell className={getResponsiveClasses('address')}>
                      <div className="text-sm">
                        <div>{site.street}</div>
                        <div className="text-gray-500">{site.town}, {site.county}</div>
                        <div className="text-gray-500">{site.postcode}</div>
                      </div>
                    </TableCell>
                    <TableCell className={getResponsiveClasses('sin')}>
                      <span className="font-mono text-sm">{site.sinNumber}</span>
                    </TableCell>
                    <TableCell className={getResponsiveClasses('telephone')}>
                      <span className="text-sm">{site.telephone}</span>
                    </TableCell>
                    <TableCell>
                      {site.isCoreSite ? (
                        <Badge variant="default" className="bg-purple-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Core Site
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(site)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(site)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSites.length)} of {filteredSites.length} sites
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <SiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        site={selectedSite}
        selectedCustomerId={selectedCustomerId}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{siteToDelete?.locationName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}