import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { regionsService } from "@/services/regionsService"
import type { Region } from "@/types/customer"
import { RegionDialog } from "./RegionDialog"
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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

interface RegionsTableProps {
  selectedCustomerId: string | null
}

export function RegionsTable({ selectedCustomerId }: RegionsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [regions, setRegions] = useState<Region[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const itemsPerPage = 10

  // Load regions data
  const loadRegions = async () => {
    setIsLoading(true)
    try {
      const result = await regionsService.getRegions()
      if (result.success) {
        setRegions(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load regions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading regions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  const currentRegions = selectedCustomerId
    ? regions.filter(region => region.customerId === selectedCustomerId)
    : []

  const handleEdit = (region: Region) => {
    setSelectedRegion(region)
    setDialogOpen(true)
  }

  const handleNewRegion = () => {
    setSelectedRegion(undefined)
    setDialogOpen(true)
  }

  const handleDeleteClick = (region: Region) => {
    setRegionToDelete(region)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!regionToDelete) return

    try {
      const result = await regionsService.deleteRegion(regionToDelete.id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Region deleted successfully",
        })
        await loadRegions() // Refresh the data
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete region",
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
      setRegionToDelete(null)
    }
  }

  const handleDialogSuccess = async () => {
    await loadRegions() // Refresh the data after successful creation/update
  }

  // Filter by search query
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (!selectedCustomerId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Regions</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          Please select a customer to view regions
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Regions</h2>
        <Button onClick={handleNewRegion}>Add Region</Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading regions...</div>
      ) : currentRegions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No regions found for this customer. Click "Add Region" to create one.
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No regions match your search criteria.
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRegionsTable.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>{region.manager}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        region.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {region.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(region)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(region)}
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRegions.length)} of {filteredRegions.length} regions
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

      <RegionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        region={selectedRegion}
        selectedCustomerId={selectedCustomerId}
        onSuccess={handleDialogSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Region</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{regionToDelete?.name}"? This action cannot be undone.
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