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
  Info,
  Clipboard,
  User,
  Lock,
  ChevronLeft,
  ChevronRight,
  Clock
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

// Define field types for incident data display
type FieldProps = {
  label: string;
  value: React.ReactNode;
}

// Field component for displaying labeled data
const Field = ({ label, value }: FieldProps) => (
  <div>
    <div className="text-sm font-semibold text-slate-600">{label}</div>
    <div className="text-sm text-slate-800 p-2 bg-slate-50 rounded-md border border-slate-200">
      {value}
    </div>
  </div>
);

// Section header component
type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  color: string;
}

const SectionHeader = ({ icon, title, color }: SectionHeaderProps) => (
  <div className={`flex items-center text-${color}-600 font-semibold`}>
    <div className="mr-2">{icon}</div>
    {title}
  </div>
);

// Section card component
type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}

const SectionCard = ({ icon, title, color, children }: SectionCardProps) => (
  <div className="border rounded-lg shadow-sm p-2 md:p-3 space-y-2 md:space-y-3">
    <SectionHeader icon={icon} title={title} color={color} />
    {children}
  </div>
);

export default function IncidentReport() {
  const [incidents] = useState<Incident[]>(mockIncidents)
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

  const filteredIncidents = incidents.filter(incident => 
    incident.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  const currentItems = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen overflow-x-hidden">
      <div className="mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-full 2xl:px-10 py-3 md:py-4 lg:py-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Incident Reports</h1>
              <p className="text-xs md:text-sm text-gray-500">View and track security incidents across all stores</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
            <Card className="bg-blue-600 border-blue-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-2 md:p-3">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Total Amount Saved</CardTitle>
                <PoundSterling className="h-3 md:h-4 w-3 md:w-4 text-white" />
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0 md:pt-0">
                <div className="text-lg md:text-2xl font-bold text-white">£{stats.totalAmountSaved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-600 border-emerald-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-2 md:p-3">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Unique Stores</CardTitle>
                <Store className="h-3 md:h-4 w-3 md:w-4 text-white" />
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0 md:pt-0">
                <div className="text-lg md:text-2xl font-bold text-white">{stats.uniqueStores}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-600 border-purple-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-2 md:p-3">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Total Incidents</CardTitle>
                <AlertCircle className="h-3 md:h-4 w-3 md:w-4 text-white" />
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0 md:pt-0">
                <div className="text-lg md:text-2xl font-bold text-white">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-600 border-orange-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-2 md:p-3">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Active Cases</CardTitle>
                <FileText className="h-3 md:h-4 w-3 md:w-4 text-white" />
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0 md:pt-0">
                <div className="text-lg md:text-2xl font-bold text-white">{Math.floor(stats.totalIncidents * 0.65)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-3 md:mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 md:p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:max-w-md border-gray-300"
              />
            </div>
          </div>

          {/* Table for tablet and desktop */}
          <div className="hidden md:block overflow-x-auto">
            <div className="w-full inline-block align-middle p-1 md:p-2 lg:p-3">
              <Table className="w-full divide-y divide-gray-200 table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900 px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200 w-[75px] md:w-[100px] lg:w-[120px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200 w-[120px] md:w-[140px] lg:w-[180px]">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                        Site
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200 w-[110px] md:w-[120px] lg:w-[150px]">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900 px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900 px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200 w-[100px] md:w-[110px] lg:w-[130px]">Value</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right px-2 py-2 lg:px-3 lg:py-3 border-b border-gray-200 w-[70px] md:w-[80px] lg:w-[100px]">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500 px-2 py-2">
                        No incidents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((incident) => (
                      <TableRow 
                        key={incident.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <TableCell className="font-medium px-2 py-2 lg:px-4 lg:py-4 xl:px-5 whitespace-nowrap lg:text-base">
                          {new Date(incident.dateInputted).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-2 py-2 lg:px-4 lg:py-4 xl:px-5 truncate lg:text-base">{incident.siteName}</TableCell>
                        <TableCell className="px-2 py-2 lg:px-4 lg:py-4 xl:px-5">
                          <span className="inline-flex px-2 py-1 lg:px-3 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            {incident.incidentType}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-2 lg:px-4 lg:py-4 xl:px-5">
                          <div className="max-w-[120px] md:max-w-[160px] lg:max-w-[350px] xl:max-w-[800px] 2xl:max-w-[1200px] truncate lg:text-base">
                            {incident.description}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2 lg:px-4 lg:py-4 xl:px-5 font-medium text-emerald-600 whitespace-nowrap lg:text-base">£{incident.totalValueRecovered?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-right pr-2 py-2 lg:pr-4 lg:py-4 xl:pr-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 whitespace-nowrap w-[65px] lg:w-auto lg:px-4 lg:py-2 xl:px-5 xl:py-2.5"
                            onClick={() => setViewingIncident(incident)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
                            <span className="lg:text-base">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Card view for mobile */}
          <div className="md:hidden p-2">
            {currentItems.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                No incidents found
              </div>
            ) : (
              <div className="space-y-2">
                {currentItems.map((incident) => (
                  <div 
                    key={incident.id}
                    className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Date:</span>
                        </div>
                        <div className="font-medium text-sm">
                      {new Date(incident.dateInputted).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {incident.incidentType}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Site:</span>
                      </div>
                      <div className="text-sm">{incident.siteName}</div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Description:</span>
                      </div>
                      <div className="text-sm line-clamp-2">{incident.description}</div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                      <div>
                        <div className="flex items-center gap-1">
                          <PoundSterling className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Value:</span>
                        </div>
                        <div className="font-medium text-sm text-emerald-600">
                          £{incident.totalValueRecovered?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingIncident(incident)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-2 md:p-3 border-t border-gray-200">
            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-gray-300 text-xs h-8"
              >
                Previous
              </Button>
              <div className="text-xs text-gray-700 flex items-center">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
                size="sm"
                className="border-gray-300 text-xs h-8"
              >
                Next
              </Button>
            </div>
            
            {/* Desktop pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs md:text-sm lg:text-base text-gray-700">
                  Showing <span className="font-medium">{currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of{' '}
                  <span className="font-medium">{filteredIncidents.length}</span> results
                </p>
              </div>
              <div>
                <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-1 lg:px-3 lg:py-2 rounded-l-md border border-gray-300"
                    size="sm"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                  
                  {/* Page numbers - only show on larger screens */}
                  <div className="hidden md:flex">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        // Show all pages if 5 or fewer
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        // Near the start
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // Near the end
                        pageNumber = totalPages - 4 + i;
                      } else {
                        // In the middle
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          className={`relative inline-flex items-center px-2 md:px-3 lg:px-4 py-1 lg:py-2 border lg:text-base
                            ${currentPage === pageNumber 
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700'
                            }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    variant="outline"
                    className="relative inline-flex items-center px-2 py-1 lg:px-3 lg:py-2 rounded-r-md border border-gray-300"
                    size="sm"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* View Dialog */}
        <Dialog 
          open={!!viewingIncident} 
          onOpenChange={(isOpen) => !isOpen && setViewingIncident(null)}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto p-2 md:p-3 lg:p-5">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <div className="flex items-center">
                  <span className="h-2 w-2 bg-red-600 rounded-full mr-2"></span>
                  View Incident Details
                </div>
              </DialogTitle>
            </DialogHeader>
            {viewingIncident && (
              <div className="mt-2 md:mt-3 lg:mt-4 space-y-3 md:space-y-4 lg:space-y-5">
                <div className="text-xs md:text-sm lg:text-base text-slate-600">Incident ID: {viewingIncident.id}</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
                {/* Basic Information */}
                  <SectionCard icon={<Info className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />} title="Basic Information" color="blue">
                    <div className="space-y-2 md:space-y-3">
                      <Field label="Date" value={new Date(viewingIncident.dateInputted).toLocaleDateString()} />
                      <Field label="Site Name" value={viewingIncident.siteName} />
                      <Field label="Incident Type" value={
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {viewingIncident.incidentType}
                        </span>
                      } />
                      <Field label="Value Recovered" value={
                        <span className="font-medium text-emerald-600">
                          £{viewingIncident.totalValueRecovered?.toFixed(2) || '0.00'}
                        </span>
                      } />
                    </div>
                  </SectionCard>

                  {/* Description */}
                  <SectionCard icon={<FileText className="h-4 md:h-5 w-4 md:w-5 text-green-600" />} title="Description" color="green">
                    <div className="space-y-2 md:space-y-3">
                      <div className="text-sm text-slate-800 p-2 bg-slate-50 rounded-md border border-slate-200 min-h-[80px] md:min-h-[100px]">
                        {viewingIncident.description}
                    </div>
                    </div>
                  </SectionCard>

                  {/* Additional Details */}
                  <SectionCard icon={<Clipboard className="h-4 md:h-5 w-4 md:w-5 text-amber-600" />} title="Additional Details" color="amber">
                    <div className="space-y-2 md:space-y-3">
                      <Field label="Reported By" value={viewingIncident.reportedBy || "Security Staff"} />
                      <Field label="Status" value={
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {viewingIncident.status || "Under Investigation"}
                        </span>
                      } />
                      <Field label="Discovery Time" value={"10:30 AM"} />
                    </div>
                  </SectionCard>
                </div>

                {/* Police Involvement & Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {/* Police Involvement */}
                  <SectionCard icon={<AlertCircle className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />} title="Police Involvement" color="blue">
                    <div className="py-2 md:py-3">
                      <div className="text-xs md:text-sm font-semibold text-slate-600 mb-2">Was police involved?</div>
                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 md:w-5 h-4 md:h-5 rounded-full border ${false ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                            {false && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                          <span className="text-xs md:text-sm">Yes</span>
                    </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 md:w-5 h-4 md:h-5 rounded-full border ${true ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                            {true && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                          <span className="text-xs md:text-sm">No</span>
                </div>
                      </div>
                      <div className="mt-2 md:mt-3 space-y-2 md:space-y-3">
                        <Field label="Response Time" value={"N/A"} />
                        <Field label="Police Reference" value="N/A" />
                      </div>
                    </div>
                  </SectionCard>

                  {/* Location Details */}
                  <SectionCard icon={<Building2 className="h-4 md:h-5 w-4 md:w-5 text-purple-600" />} title="Location Details" color="purple">
                    <div className="space-y-2 md:space-y-3">
                      <Field label="Site Location" value={"Main Store"} />
                      <Field label="Specific Area" value={"Electronics Section"} />
                      <Field label="Store Address" value="123 High Street, London" />
                      <Field label="Post Code" value="SW1A 1AA" />
                      </div>
                  </SectionCard>
                      </div>

                {/* Incident Categories - Displayed on tablet and above */}
                <div className="hidden sm:block">
                  <SectionCard icon={<Clipboard className="h-4 md:h-5 w-4 md:w-5 text-amber-600" />} title="Incident Categories" color="amber">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                      {['J - Self Scan Tills?', 'L - Threats And Intimidation?', 'N - Ban From Store?', 
                        'M - Scan And Go?', 'K - Abusive behaviour?', 'Q - Police Failed to Attend?',
                        'O - Violent Behavior (Physical)?', 'M - Spitting?'].map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-4 md:h-5 w-4 md:w-5 border rounded border-gray-300"></div>
                          <span className="text-xs md:text-sm">{category}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                  </div>

                {/* Incident Categories - Mobile accordion */}
                <div className="sm:hidden">
                  <details className="border rounded-lg shadow-sm p-2">
                    <summary className="font-medium text-amber-600 cursor-pointer flex items-center gap-2">
                      <Clipboard className="h-4 w-4 text-amber-600" />
                      Incident Categories
                    </summary>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {['J - Self Scan Tills?', 'L - Threats And Intimidation?', 'N - Ban From Store?', 
                        'M - Scan And Go?', 'K - Abusive behaviour?', 'Q - Police Failed to Attend?',
                        'O - Violent Behavior (Physical)?', 'M - Spitting?'].map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-4 w-4 border rounded border-gray-300"></div>
                          <span className="text-xs">{category}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Stolen Items */}
                <SectionCard icon={<Lock className="h-4 md:h-5 w-4 md:w-5 text-red-600" />} title="Stolen Items" color="red">
                  {/* Table for tablet and desktop */}
                  <div className="hidden md:block overflow-x-auto rounded-md border border-slate-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">electronics</td>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">Laptop</td>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">Laptop</td>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">£599.99</td>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">1</td>
                          <td className="px-2 py-2 text-xs md:text-sm text-gray-700">£599.99</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-2 py-2 text-xs md:text-sm font-medium text-gray-600 text-right">Total Value:</td>
                          <td className="px-2 py-2 text-xs md:text-sm font-medium text-green-600">£599.99</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  {/* Mobile cards for stolen items */}
                  <div className="md:hidden space-y-2">
                    <div className="border rounded-md p-2 bg-white">
                      <div className="flex justify-between">
                        <div className="text-xs font-medium">Laptop</div>
                        <div className="text-xs font-medium text-emerald-600">£599.99</div>
                      </div>
                      <div className="text-xs text-gray-500">Electronics • 1 unit</div>
                      <div className="text-xs text-gray-700 mt-1">Laptop</div>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200">
                      <div className="text-xs font-medium text-gray-600">Total Value:</div>
                      <div className="text-xs font-medium text-green-600">£599.99</div>
                    </div>
                  </div>
                </SectionCard>

                <div className="pt-2 md:pt-3 flex justify-end">
                  <Button
                    onClick={() => setViewingIncident(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 md:text-sm md:h-9"
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