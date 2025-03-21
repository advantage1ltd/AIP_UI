import { useState, useCallback } from "react"
import { Incident } from "@/types/incidents"
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

export default function IncidentReportPage() {
  const [open, setOpen] = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6 max-w-[100vw] lg:max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Incident Reports</h1>
                <p className="text-xs sm:text-sm text-gray-500">Track and manage security incidents across all stores</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingIncident(null)
                setOpen(true)
              }}
              size="default"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              New Incident
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 pb-1 md:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-white">Total Amount Saved</CardTitle>
                <PoundSterling className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 pt-0 md:pt-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">£{stats.totalAmountSaved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 pb-1 md:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-white">Unique Stores</CardTitle>
                <Store className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 pt-0 md:pt-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.uniqueStores}</div>
              </CardContent>
            </Card>
            <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-2 md:p-4 pb-1 md:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-white">Total Incidents</CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-300" />
              </CardHeader>
              <CardContent className="p-2 md:p-4 pt-0 md:pt-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-gray-300 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span>Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span>Site Name</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 whitespace-nowrap hidden md:table-cell">Incident Type</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 hidden lg:table-cell">Description</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 whitespace-nowrap">Value</TableHead>
                    <TableHead className="font-medium text-xs sm:text-sm text-gray-900 py-2 md:py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncidents.map((incident) => (
                    <TableRow 
                      key={incident.id}
                      className="hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      <TableCell className="py-2 md:py-3 font-medium whitespace-nowrap">
                        {new Date(incident.dateInputted).toLocaleDateString()}
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          {incident.siteName}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 md:py-3 hidden sm:table-cell whitespace-nowrap">{incident.siteName}</TableCell>
                      <TableCell className="py-2 md:py-3 hidden md:table-cell whitespace-nowrap">{incident.incidentType}</TableCell>
                      <TableCell className="py-2 md:py-3 max-w-[150px] lg:max-w-[250px] xl:max-w-md hidden lg:table-cell">
                        <div className="truncate">{incident.description}</div>
                      </TableCell>
                      <TableCell className="py-2 md:py-3 whitespace-nowrap">
                        £{(incident.totalValueRecovered !== undefined && incident.totalValueRecovered !== null)
                           ? incident.totalValueRecovered.toFixed(2)
                           : (incident.stolenItems && incident.stolenItems.length > 0)
                             ? incident.stolenItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)
                             : '0.00'
                      }
                      </TableCell>
                      <TableCell className="py-2 md:py-3">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(incident)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(incident)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(incident)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIncidents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500 text-sm">No incidents found</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setEditingIncident(null)
                            setOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 mt-2 text-sm"
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
          <div className="flex justify-center py-3 sm:py-4 border-t border-gray-200">
            <Pagination>
              <PaginationContent className="flex flex-wrap items-center gap-1 sm:gap-0">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} h-8 w-8 sm:h-9 sm:w-auto flex items-center justify-center`}
                    aria-disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                  </PaginationPrevious>
                </PaginationItem>
                
                {/* Desktop Pagination Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show appropriate page numbers based on current page position
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
                        className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-md"
                        aria-label={`Go to page ${pageToShow}`}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {/* Mobile Pagination Counter */}
                <PaginationItem className="sm:hidden">
                  <span className="h-8 px-3 flex items-center justify-center text-xs font-medium text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} h-8 w-8 sm:h-9 sm:w-auto flex items-center justify-center`}
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
        <DialogContent className="w-[calc(100%-32px)] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {editingIncident ? 'Edit Incident Report' : 'Officer Incident Report'}
            </DialogTitle>
            
            <DialogDescription className="text-gray-500">
      
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 sm:py-6 px-1">
            <IncidentForm
              initialData={editingIncident}
              onSubmit={handleSubmit}
              onCancel={() => {
                setOpen(false)
                setEditingIncident(null)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!viewingIncident} 
        onOpenChange={(isOpen) => !isOpen && setViewingIncident(null)}
      >
        <DialogContent className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] h-[85vh] sm:h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-2 sm:pb-4">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Incident Details</DialogTitle>
          </DialogHeader>
          {viewingIncident && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">📋</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Customer Name</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.customerName}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Site Name</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.siteName}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Officer Name</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.officerName}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Officer Role</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.officerRole}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Duty Manager</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.dutyManagerName}</p>
                    </div>
                  </div>
                </div>

                {/* Incident Details */}
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">🕒</span>
                    Incident Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Date of Incident</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">
                        {new Date(viewingIncident.dateOfIncident).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Time of Incident</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.timeOfIncident}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Incident Type</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.incidentType}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">📝</span>
                    Description
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Incident Details</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1 whitespace-pre-wrap">{viewingIncident.description}</p>
                    </div>
                    {viewingIncident.storeComments && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Store Comments</label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1 whitespace-pre-wrap">{viewingIncident.storeComments}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Police Involvement */}
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">👮</span>
                    Police Involvement
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Police Involved</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.policeInvolvement ? "Yes" : "No"}</p>
                    </div>
                    {viewingIncident.policeInvolvement && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        {viewingIncident.urnNumber && (
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">URN Number</label>
                            <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.urnNumber}</p>
                          </div>
                        )}
                        {viewingIncident.crimeRefNumber && (
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500">Crime Reference Number</label>
                            <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.crimeRefNumber}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Offender Details */}
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">👤</span>
                    Offender Details
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {viewingIncident.offenderName && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Name</label>
                          <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.offenderName}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Sex</label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">{viewingIncident.offenderSex}</p>
                      </div>
                      {viewingIncident.offenderDOB && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-sm sm:text-base text-gray-900 mt-1">
                            {new Date(viewingIncident.offenderDOB).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {(viewingIncident.offenderAddress?.numberAndStreet || 
                      viewingIncident.offenderAddress?.town || 
                      viewingIncident.offenderAddress?.postCode) && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Address</label>
                        <div className="text-sm sm:text-base text-gray-900 mt-1 space-y-1">
                          {viewingIncident.offenderAddress.numberAndStreet && (
                            <p>{viewingIncident.offenderAddress.numberAndStreet}</p>
                          )}
                          {viewingIncident.offenderAddress.town && (
                            <p>{viewingIncident.offenderAddress.town}</p>
                          )}
                          {viewingIncident.offenderAddress.postCode && (
                            <p>{viewingIncident.offenderAddress.postCode}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Incident Categories */}
                {viewingIncident.incidentInvolved && viewingIncident.incidentInvolved.length > 0 && (
                  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-blue-600">🏷️</span>
                      Incident Categories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {viewingIncident.incidentInvolved.map((type, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          <p className="text-sm sm:text-base text-gray-900">{type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stolen Items */}
                {viewingIncident.stolenItems && viewingIncident.stolenItems.length > 0 && (
                  <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-5 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-blue-600">💰</span>
                      Stolen Items
                    </h3>
                    <div className="overflow-x-auto -mx-2 sm:-mx-4 px-2 sm:px-4">
                      <div className="min-w-[320px]">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-500">Category</th>
                              <th className="text-left py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-500">Description</th>
                              <th className="text-right py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-500">Cost</th>
                              <th className="text-right py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-500">Qty</th>
                              <th className="text-right py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-500">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingIncident.stolenItems.map((item, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-900">{item.category}</td>
                                <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-900">{item.description}</td>
                                <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-900 text-right">£{item.cost.toFixed(2)}</td>
                                <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-900 text-right">{item.quantity}</td>
                                <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm text-gray-900 text-right">£{item.totalAmount.toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-900">Total Value Recovered</td>
                              <td className="py-2 px-2 sm:px-3 text-xs sm:text-base font-medium text-gray-900 text-right">
                                £{(viewingIncident.totalValueRecovered !== undefined 
                                  ? viewingIncident.totalValueRecovered 
                                  : viewingIncident.stolenItems.reduce((sum, item) => sum + item.totalAmount, 0)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 p-2 sm:p-4 pt-3 sm:pt-4 border-t mt-auto">
                <Button
                  variant="outline"
                  onClick={() => setViewingIncident(null)}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-sm"
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
    </div>
  )
}