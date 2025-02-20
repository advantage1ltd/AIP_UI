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

export default function IncidentReportPage() {
  const [open, setOpen] = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null)

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

  const filteredIncidents = incidents.filter(incident => 
    incident.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-8xl">
        {/* Header Section */}
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
                <p className="text-sm text-gray-500">Track and manage security incidents across all stores</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingIncident(null)
                setOpen(true)
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              New Incident
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total Amount Saved</CardTitle>
                <PoundSterling className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">£{stats.totalAmountSaved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Unique Stores</CardTitle>
                <Store className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{stats.uniqueStores}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Total Incidents</CardTitle>
                <AlertCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 max-w-md border-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      Site Name
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Incident Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Description</TableHead>
                  <TableHead className="font-semibold text-gray-900">Value Recovered</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow 
                    key={incident.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {new Date(incident.dateInputted).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{incident.siteName}</TableCell>
                    <TableCell>{incident.incidentType}</TableCell>
                    <TableCell className="max-w-md truncate">{incident.description}</TableCell>
                    <TableCell>£{incident.totalValueRecovered?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(incident)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(incident)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(incident)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIncidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">No incidents found</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setEditingIncident(null)
                          setOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-700 mt-2"
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
          <DialogContent className="max-w-[60vw] h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold">
                {editingIncident ? 'Edit Incident Report' : 'Officer Incident Report'}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
        
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-6 px-1">
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Incident Details</DialogTitle>
            </DialogHeader>
            {viewingIncident && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{new Date(viewingIncident.dateInputted).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Site Name</label>
                    <p className="text-gray-900">{viewingIncident.siteName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Incident Type</label>
                    <p className="text-gray-900">{viewingIncident.incidentType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Value Recovered</label>
                    <p className="text-gray-900">£{viewingIncident.totalValueRecovered?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1">{viewingIncident.description}</p>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setViewingIncident(null)}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Incident Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this incident report? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}