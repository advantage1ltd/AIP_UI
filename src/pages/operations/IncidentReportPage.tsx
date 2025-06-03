import { useState, useCallback } from "react"
import { Incident, StolenItem } from "@/types/incidents"
import { IncidentForm } from "@/components/operations/IncidentForm"
import { IncidentsTable } from "@/components/operations/IncidentsTable"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { mockIncidents } from "@/data/mockIncidents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PlusCircle, 
  PoundSterling, 
  Store, 
  AlertCircle, 
  Edit2,
  Trash2,
  Eye,
  FileText,
  Search,
  Calendar,
  Building2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import BarcodeScanner from '@/components/BarcodeScanner'

export default function IncidentReportPage() {
  const [open, setOpen] = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [scanningBarcode, setScanningBarcode] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  // Calculate statistics
  const stats = {
    totalAmountSaved: incidents.reduce((total, incident) => 
      total + (incident.totalValueRecovered || 0), 0
    ),
    uniqueStores: new Set(incidents.map(incident => incident.siteName)).size,
    totalIncidents: incidents.length
  }

  const handleSubmit = useCallback((incident: Incident) => {
    if (editingIncident) {
      // Update existing incident
      setIncidents(prev =>
        prev.map(i => (i.id === editingIncident.id ? { ...incident, id: i.id } : i))
      )
      toast.success('Incident report updated successfully')
    } else {
      // Create new incident
      const newIncident = {
        ...incident,
        id: (incidents.length + 1).toString(),
        dateInputted: new Date().toISOString(),
        userThatInput: "admin" // This would come from auth context
      }
      setIncidents(prev => [newIncident, ...prev])
      toast.success('Incident report created successfully')
    }
    setOpen(false)
    setEditingIncident(null)
  }, [editingIncident, incidents])

  const handleEdit = useCallback((incident: Incident) => {
    setEditingIncident(incident)
    setOpen(true)
  }, [])

  const handleView = useCallback((incident: Incident) => {
    setViewingIncident(incident)
  }, [])

  const handleDelete = useCallback((incident: Incident) => {
    setDeletingIncident(incident)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deletingIncident) {
      setIncidents(prev => prev.filter(i => i.id !== deletingIncident.id))
      toast.success('Incident deleted successfully')
      setDeletingIncident(null)
    }
  }, [deletingIncident])

  // Filter and paginate incidents
  const filteredIncidents = incidents.filter(incident => 
    incident.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  
  // Get current page items
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      setIsLoadingProduct(true)
      
      // Call to your EAN API to fetch product details
      const response = await fetch(`${process.env.NEXT_PUBLIC_EAN_API_URL}/api/products/${barcode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EAN_API_KEY}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Product not found')
      }
      
      const productData = await response.json()
      
      // Create new stolen item from scanned data
      const newItem: StolenItem = {
        id: Date.now().toString(),
        category: productData.category?.toLowerCase() || 'other',
        description: productData.description || '',
        productName: productData.name || '',
        cost: productData.price || 0,
        quantity: 1,
        totalAmount: productData.price || 0
      }

      // Update the incident with the new item
      if (editingIncident) {
        setEditingIncident({
          ...editingIncident,
          stolenItems: [...(editingIncident.stolenItems || []), newItem]
        })
      }
      
      toast.success('Product found and added to stolen items')
      
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found or scanning error occurred')
    } finally {
      setIsLoadingProduct(false)
      setScanningBarcode(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 xl:py-10 2xl:py-12 px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 max-w-screen-2xl">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 xl:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
              <div className="bg-blue-100 p-2 xl:p-3 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Incident Reports</h1>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-500">Track and manage security incidents across all stores</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingIncident(null)
                setOpen(true)
              }}
              size="default"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto xl:text-lg xl:h-12 xl:px-6"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
              New Incident
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 xl:gap-6">
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 shadow-md col-span-1">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 xl:p-6 pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-white">Total Amount Saved</CardTitle>
                <PoundSterling className="h-3 w-3 sm:h-4 sm:w-4 xl:h-5 xl:w-5 text-blue-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">£{stats.totalAmountSaved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 shadow-md col-span-1">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 xl:p-6 pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-white">Unique Stores</CardTitle>
                <Store className="h-3 w-3 sm:h-4 sm:w-4 xl:h-5 xl:w-5 text-emerald-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{stats.uniqueStores}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md col-span-2 md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 xl:p-6 pb-1 md:pb-2 xl:pb-3">
                <CardTitle className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-white">Total Incidents</CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 xl:h-5 xl:w-5 text-purple-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 xl:p-6 pt-0 md:pt-1 xl:pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 sm:p-3 md:p-4 xl:p-6 border-b border-gray-200">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 xl:w-5 xl:h-5" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 xl:pl-10 border-gray-300 text-sm xl:text-base xl:h-12"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 sm:gap-2 xl:gap-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-gray-500" />
                        <span>Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-1 sm:gap-2 xl:gap-3">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-gray-500" />
                        <span>Site Name</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 whitespace-nowrap hidden md:table-cell">Incident Type</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 hidden lg:table-cell">Description</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 whitespace-nowrap">Value</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm lg:text-base xl:text-lg text-gray-900 py-2 md:py-3 xl:py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncidents.map((incident) => (
                    <TableRow 
                      key={incident.id}
                      className="hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base xl:text-lg"
                    >
                      <TableCell className="py-2 md:py-3 xl:py-4 font-medium whitespace-nowrap">
                        {new Date(incident.dateInputted).toLocaleDateString()}
                        <div className="sm:hidden text-xs xl:text-sm text-gray-500 mt-1">
                          {incident.siteName}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 md:py-3 xl:py-4 hidden sm:table-cell whitespace-nowrap">{incident.siteName}</TableCell>
                      <TableCell className="py-2 md:py-3 xl:py-4 hidden md:table-cell whitespace-nowrap">{incident.incidentType}</TableCell>
                      <TableCell className="py-2 md:py-3 xl:py-4 max-w-[200px] lg:max-w-[300px] xl:max-w-[400px] 2xl:max-w-[500px] hidden lg:table-cell">
                        <div className="truncate">{incident.description}</div>
                      </TableCell>
                      <TableCell className="py-2 md:py-3 xl:py-4 whitespace-nowrap">
                        £{(incident.totalValueRecovered !== undefined && incident.totalValueRecovered !== null)
                           ? incident.totalValueRecovered.toFixed(2)
                           : (incident.stolenItems && incident.stolenItems.length > 0)
                             ? incident.stolenItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)
                             : '0.00'
                      }
                      </TableCell>
                      <TableCell className="py-2 md:py-3 xl:py-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2 xl:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(incident)}
                            className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(incident)}
                            className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(incident)}
                            className="h-7 w-7 sm:h-8 sm:w-8 xl:h-10 xl:w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIncidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 xl:py-12">
                        <p className="text-gray-500 text-sm xl:text-base">No incidents found</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setEditingIncident(null)
                            setOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 mt-2 text-sm xl:text-base"
                        >
                          Create your first incident report
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {filteredIncidents.length > 0 && totalPages > 1 && (
          <div className="flex justify-center py-3 sm:py-4 xl:py-6 border-t border-gray-200">
            <Pagination>
              <PaginationContent className="flex flex-wrap items-center gap-1 sm:gap-0">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} h-8 w-8 sm:h-9 sm:w-auto xl:h-12 xl:w-auto flex items-center justify-center xl:text-lg`}
                    aria-disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                  </PaginationPrevious>
                </PaginationItem>
                
                {/* Desktop Pagination Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageToShow;
                  
                  if (totalPages <= 5) {
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    pageToShow = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i;
                  } else {
                    pageToShow = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageToShow} className="hidden sm:inline-block">
                      <PaginationLink
                        onClick={() => handlePageChange(pageToShow)}
                        isActive={currentPage === pageToShow}
                        className="h-8 w-8 sm:h-9 sm:w-9 xl:h-12 xl:w-12 flex items-center justify-center rounded-md xl:text-lg"
                        aria-label={`Go to page ${pageToShow}`}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {/* Mobile Pagination Counter */}
                <PaginationItem className="sm:hidden">
                  <span className="h-8 px-3 flex items-center justify-center text-xs xl:text-base font-medium text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} h-8 w-8 sm:h-9 sm:w-auto xl:h-12 xl:w-auto flex items-center justify-center xl:text-lg`}
                    aria-disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog 
        open={open} 
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) {
            setEditingIncident(null)
          }
        }}
      >
        <DialogContent className="max-w-[65vw] md:max-w-[60vw] lg:max-w-[50vw] h-[90vh] p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-xl font-bold">
              {editingIncident ? 'Edit Incident Report' : 'Officer Incident Report'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <IncidentForm
              initialData={editingIncident}
              onSubmit={handleSubmit}
              onCancel={() => {
                setOpen(false)
                setEditingIncident(null)
              }}
              onScanBarcode={() => setScanningBarcode(true)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!viewingIncident} 
        onOpenChange={(isOpen) => !isOpen && setViewingIncident(null)}
      >
        <DialogContent className="max-w-[65vw] md:max-w-[60vw] lg:max-w-[50vw] h-[90vh] p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-xl font-bold">View Incident Details</DialogTitle>
          </DialogHeader>
          {viewingIncident && (
            <div className="flex-1 overflow-y-auto">
              <div className="bg-[#F8F3F1]">
                <div className="w-full max-w-[98%] mx-auto px-4 py-4">
                {/* Basic Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">📋</div>
                      <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.customerName}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Site Name</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.siteName}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Officer Name</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.officerName}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Officer Role</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.officerRole}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Duty Manager</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.dutyManagerName}</p>
                      </div>
                  </div>
                </div>

                {/* Incident Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">🕒</div>
                      <h2 className="text-lg font-medium text-gray-900">Incident Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Date of Incident</label>
                        <p className="mt-1 text-sm text-gray-900">
                        {new Date(viewingIncident.dateOfIncident).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Time of Incident</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.timeOfIncident}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Incident Type</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.incidentType}</p>
                      </div>
                  </div>
                </div>

                {/* Description */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">📝</div>
                      <h2 className="text-lg font-medium text-gray-900">Description</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Incident Details</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{viewingIncident.description}</p>
                      </div>
                      {viewingIncident.storeComments && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Store Comments</label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{viewingIncident.storeComments}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Police Involvement */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">👮</div>
                      <h2 className="text-lg font-medium text-gray-900">Police Involvement</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Was Police Involved?</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.policeInvolved ? "Yes" : "No"}</p>
                    </div>
                    {viewingIncident.policeInvolved && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {viewingIncident.urnNumber && (
                          <div>
                              <label className="text-sm font-medium text-gray-500">URN Number</label>
                              <p className="mt-1 text-sm text-gray-900">{viewingIncident.urnNumber}</p>
                          </div>
                        )}
                        {viewingIncident.crimeRefNumber && (
                          <div>
                              <label className="text-sm font-medium text-gray-500">Crime Reference Number</label>
                              <p className="mt-1 text-sm text-gray-900">{viewingIncident.crimeRefNumber}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Offender Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">👤</div>
                      <h2 className="text-lg font-medium text-gray-900">Offender Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewingIncident.offenderName && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="mt-1 text-sm text-gray-900">{viewingIncident.offenderName}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500">Sex</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingIncident.offenderSex}</p>
                      </div>
                      {viewingIncident.offenderDOB && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(viewingIncident.offenderDOB).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {viewingIncident.offenderAddress && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Address</label>
                            <p className="mt-1 text-sm text-gray-900">{viewingIncident.offenderAddress.numberAndStreet}</p>
                    </div>
                      <div>
                            <label className="text-sm font-medium text-gray-500">Town</label>
                            <p className="mt-1 text-sm text-gray-900">{viewingIncident.offenderAddress.town}</p>
                        </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Post Code</label>
                            <p className="mt-1 text-sm text-gray-900">{viewingIncident.offenderAddress.postCode}</p>
                      </div>
                        </>
                    )}
                  </div>
                </div>

                {/* Incident Categories */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 text-blue-600">🏷️</div>
                      <h2 className="text-lg font-medium text-gray-900">Incident Categories</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {viewingIncident.incidentInvolved?.map((type, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          <p className="text-sm text-gray-900">{type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                {/* Stolen Items */}
                {viewingIncident.stolenItems && viewingIncident.stolenItems.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 text-blue-600">💰</div>
                        <h2 className="text-lg font-medium text-gray-900">Stolen Items</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 text-sm font-medium text-gray-500">Category</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-500">Product Name</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-500">Description</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-500">Cost</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-500">Qty</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-500">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingIncident.stolenItems.map((item, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2 text-sm text-gray-900">{item.category}</td>
                                <td className="py-2 text-sm text-gray-900">{item.productName}</td>
                                <td className="py-2 text-sm text-gray-900">{item.description}</td>
                                <td className="py-2 text-sm text-gray-900 text-right">£{(item.cost || 0).toFixed(2)}</td>
                                <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                                <td className="py-2 text-sm text-gray-900 text-right">£{(item.totalAmount || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td colSpan={5} className="py-2 text-sm font-medium text-gray-900">Total Value</td>
                              <td className="py-2 text-sm font-medium text-gray-900 text-right">
                                £{viewingIncident.stolenItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  </div>
              </div>

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setViewingIncident(null)}
                  className="h-9 px-4 text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!deletingIncident} 
        onOpenChange={(isOpen) => !isOpen && setDeletingIncident(null)}
      >
        <AlertDialogContent className="w-[calc(100%-32px)] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Delete Incident Report</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this incident report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BarcodeScanner
        isOpen={scanningBarcode}
        onClose={() => setScanningBarcode(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  )
}