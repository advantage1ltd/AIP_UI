import { useState } from "react"
import { Incident } from "@/types/incidents"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PoundSterling, 
  Store, 
  AlertCircle, 
  Eye,
  FileText,
  Search,
  Calendar,
  Building2,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileCheck
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
import { mockIncidents } from "@/data/mockIncidents"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function IncidentReport() {
  const [incidents] = useState<Incident[]>(mockIncidents)
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

  const filteredIncidents = incidents.filter(incident => 
    incident.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityBadge = (priority?: string) => {
    const variants = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
    }
    return priority ? variants[priority as keyof typeof variants] : ""
  }

  const getStatusBadge = (status?: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    }
    return status ? variants[status as keyof typeof variants] : ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
              <p className="text-sm text-gray-500">View and track security incidents across all stores</p>
            </div>
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
                  <TableHead className="font-semibold text-gray-900 text-right">View</TableHead>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingIncident(incident)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Dialog */}
        <Dialog 
          open={!!viewingIncident} 
          onOpenChange={(isOpen) => !isOpen && setViewingIncident(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Incident Details
              </DialogTitle>
            </DialogHeader>
            {viewingIncident && (
              <div className="mt-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Date</label>
                      <p className="text-sm text-gray-900">{new Date(viewingIncident.dateInputted).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Site Name</label>
                      <p className="text-sm text-gray-900">{viewingIncident.siteName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Incident Type</label>
                      <p className="text-sm text-gray-900">{viewingIncident.incidentType}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Value Recovered</label>
                      <p className="text-sm text-gray-900">£{viewingIncident.totalValueRecovered?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>

                {/* Status and Priority */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Status & Priority</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Status</label>
                      <Badge className={getStatusBadge(viewingIncident.status)}>
                        {viewingIncident.status || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Priority</label>
                      <Badge className={getPriorityBadge(viewingIncident.priority)}>
                        {viewingIncident.priority || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingIncident.description}</p>
                  </div>
                </div>

                {/* Location Details */}
                {viewingIncident.locationDetails && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Location Details</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Area</label>
                        <p className="text-sm text-gray-900">{viewingIncident.locationDetails.area}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Specific Location</label>
                        <p className="text-sm text-gray-900">{viewingIncident.locationDetails.specificLocation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Details */}
                {viewingIncident.timeDetails && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Time Details</h3>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Discovery Time</label>
                        <p className="text-sm text-gray-900">{viewingIncident.timeDetails.discoveryTime}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Reported Time</label>
                        <p className="text-sm text-gray-900">{viewingIncident.timeDetails.reportedTime}</p>
                      </div>
                      {viewingIncident.timeDetails.responseTime && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Response Time</label>
                          <p className="text-sm text-gray-900">{viewingIncident.timeDetails.responseTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Taken */}
                {viewingIncident.actionTaken && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Action Taken</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingIncident.actionTaken}</p>
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Additional Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Evidence Attached</label>
                      <p className="text-sm text-gray-900">{viewingIncident.evidenceAttached ? 'Yes' : 'No'}</p>
                    </div>
                    {viewingIncident.witnessStatements && (
                      <div>
                        <label className="text-xs font-medium text-gray-500">Witness Statements</label>
                        <p className="text-sm text-gray-900">{viewingIncident.witnessStatements.join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-500">Recorded By</label>
                      <p className="text-sm text-gray-900">{viewingIncident.userThatInput}</p>
                    </div>
                  </div>
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
      </div>
    </div>
  )
} 