import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, FileText, CheckCircle, ClipboardList, Calendar, User, FileCheck, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface SecurityUpdate {
  id: string
  name: string
  description: string
  effectiveDate: string
  declarations: {
    count: number
    officers: number
  }
  document?: {
    name: string
    type: string
    size: string
    uploadedAt: string
  }
}

interface Declaration {
  id: string
  officerName: string
  officerId: string
  timestamp: string
  status: 'completed' | 'pending'
}

const OfficerSupport = () => {
  const [securityUpdates, setSecurityUpdates] = useState<SecurityUpdate[]>([
    {
      id: '1',
      name: 'New Security Protocol 2024',
      description: 'Updated security protocols for handling emergency situations',
      effectiveDate: '3/1/2024',
      declarations: {
        count: 2,
        officers: 2
      },
      document: {
        name: 'security_protocol_2024.pdf',
        type: 'PDF',
        size: '1.2 MB',
        uploadedAt: '2/15/2024'
      }
    },
    {
      id: '2',
      name: 'Health & Safety Guidelines',
      description: 'Revised health and safety guidelines including COVID-19 protocols',
      effectiveDate: '2/20/2024',
      declarations: {
        count: 0,
        officers: 0
      },
      document: {
        name: 'health_safety_guidelines.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadedAt: '2/10/2024'
      }
    }
  ])

  // Sample declarations data
  const [declarations, setDeclarations] = useState<Record<string, Declaration[]>>({
    '1': [
      {
        id: 'd1',
        officerName: 'John Smith',
        officerId: 'OFF-001',
        timestamp: '2/25/2024 09:15 AM',
        status: 'completed'
      },
      {
        id: 'd2',
        officerName: 'Sarah Johnson',
        officerId: 'OFF-002',
        timestamp: '2/26/2024 02:30 PM',
        status: 'completed'
      }
    ],
    '2': []
  })

  // Calculate summary statistics
  const stats = {
    totalUpdates: securityUpdates.length,
    activeUpdates: securityUpdates.length,
    totalDeclarations: securityUpdates.reduce((sum, update) => sum + update.declarations.count, 0)
  }

  // State for view dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedUpdate, setSelectedUpdate] = useState<SecurityUpdate | null>(null)

  // Handle view button click
  const handleViewClick = (update: SecurityUpdate) => {
    setSelectedUpdate(update)
    setViewDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Officer Support</h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage and track security officer documentation and declarations</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-blue-600">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Total Updates</h3>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUpdates}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-green-600">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Active Updates</h3>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{stats.activeUpdates}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-purple-600">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Total Declarations</h3>
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalDeclarations}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Updates & Declarations Section */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Security Updates & Declarations</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Track and manage security updates and officer declarations</p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Update Name</TableHead>
                  <TableHead className="font-medium hidden sm:table-cell">Description</TableHead>
                  <TableHead className="font-medium">Effective Date</TableHead>
                  <TableHead className="font-medium">Declarations</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityUpdates.map((update) => (
                  <TableRow key={update.id} className="border-b">
                    <TableCell className="font-medium">{update.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{update.description}</TableCell>
                    <TableCell>{update.effectiveDate}</TableCell>
                    <TableCell>
                      <Badge className={update.declarations.officers > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                        {update.declarations.officers} Officers
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:bg-blue-50 px-2 sm:px-3"
                          onClick={() => handleViewClick(update)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold">{selectedUpdate?.name}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-500">
              View document details and officer declarations
            </DialogDescription>
          </DialogHeader>

          {selectedUpdate && (
            <Tabs defaultValue="document" className="mt-2 sm:mt-4 overflow-hidden flex flex-col flex-1">
              <TabsList className="grid w-full grid-cols-2 shrink-0">
                <TabsTrigger value="document">Document</TabsTrigger>
                <TabsTrigger value="declarations">Declarations</TabsTrigger>
              </TabsList>

              <TabsContent value="document" className="mt-2 sm:mt-4 overflow-auto flex-1">
                <div className="bg-gray-50 p-3 sm:p-6 rounded-lg h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-6 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm sm:text-base">{selectedUpdate.document?.name}</h3>
                        <p className="text-xs text-gray-500">{selectedUpdate.document?.type} • {selectedUpdate.document?.size}</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                      onClick={() => {
                        // In a real implementation, this would trigger a download
                        alert(`Downloading ${selectedUpdate.document?.name}`);
                      }}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Download Document
                    </Button>
                  </div>

                  <div className="space-y-2 sm:space-y-4 shrink-0">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="text-gray-500">Effective Date:</span>
                      <span className="font-medium">{selectedUpdate.effectiveDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="font-medium">{selectedUpdate.document?.uploadedAt}</span>
                    </div>
                  </div>

                  <Separator className="my-3 sm:my-4 shrink-0" />

                  <div className="shrink-0">
                    <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Description</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedUpdate.description}</p>
                  </div>

                  {/* Document preview placeholder */}
                  <div className="mt-3 sm:mt-4 border rounded-lg overflow-hidden bg-white flex-1 flex flex-col">
                    {/* Document header */}
                    <div className="bg-gray-100 p-2 border-b flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">{selectedUpdate.document?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          onClick={() => {
                            // In a real implementation, this would trigger a download
                            alert(`Downloading ${selectedUpdate.document?.name}`);
                          }}
                        >
                          <Download className="h-3 w-3 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document content */}
                    <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                      {selectedUpdate.id === '1' ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-center mb-3 sm:mb-6">
                            <h1 className="text-base sm:text-lg font-bold mb-1">Security Protocol 2024</h1>
                            <p className="text-xs text-gray-500">Updated March 1, 2024</p>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <h2 className="text-sm sm:text-base font-semibold">1. Emergency Response Procedures</h2>
                            <p className="text-xs text-gray-700">This document outlines the updated security protocols for handling emergency situations. All security personnel must familiarize themselves with these procedures and acknowledge receipt.</p>
                            
                            <h3 className="text-xs sm:text-sm font-medium mt-2 sm:mt-3">1.1 Immediate Actions</h3>
                            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                              <li>Assess the situation and determine the nature of the emergency</li>
                              <li>Contact emergency services if necessary (999/911)</li>
                              <li>Secure the immediate area to prevent unauthorized access</li>
                              <li>Notify the security control room and provide a situation report</li>
                            </ul>
                            
                            <h3 className="text-xs sm:text-sm font-medium mt-2 sm:mt-3">1.2 Communication Protocol</h3>
                            <p className="text-xs text-gray-700">All communications during an emergency must follow the established protocol:</p>
                            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                              <li>Use clear, concise language</li>
                              <li>Identify yourself by your assigned code</li>
                              <li>Provide location, nature of emergency, and required assistance</li>
                              <li>Maintain regular updates until the situation is resolved</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="text-center mb-3 sm:mb-6">
                            <h1 className="text-base sm:text-lg font-bold mb-1">Health & Safety Guidelines</h1>
                            <p className="text-xs text-gray-500">Revised February 20, 2024</p>
                          </div>
                          
                          <div className="space-y-2 sm:space-y-3">
                            <h2 className="text-sm sm:text-base font-semibold">1. COVID-19 Protocols</h2>
                            <p className="text-xs text-gray-700">These revised health and safety guidelines include updated COVID-19 protocols. All personnel must review and acknowledge these guidelines.</p>
                            
                            <h3 className="text-xs sm:text-sm font-medium mt-2 sm:mt-3">1.1 Personal Protective Equipment</h3>
                            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                              <li>Face masks are recommended in crowded indoor settings</li>
                              <li>Hand sanitizer should be available at all security stations</li>
                              <li>Gloves should be worn when handling shared equipment</li>
                            </ul>
                            
                            <h3 className="text-xs sm:text-sm font-medium mt-2 sm:mt-3">1.2 Social Distancing</h3>
                            <p className="text-xs text-gray-700">Maintain appropriate distance when possible:</p>
                            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                              <li>Keep 1-2 meters distance when interacting with the public</li>
                              <li>Limit occupancy in security offices and break rooms</li>
                              <li>Use virtual meetings when possible for team briefings</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Document footer */}
                    <div className="bg-gray-100 p-2 border-t flex items-center justify-between shrink-0">
                      <span className="text-[10px] text-gray-500">Page 1 of 5</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">Previous</Button>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">Next</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="declarations" className="mt-2 sm:mt-4 overflow-auto flex-1">
                <div className="bg-gray-50 p-3 sm:p-6 rounded-lg h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base">Officer Declarations</h3>
                      <p className="text-xs text-gray-500">
                        {declarations[selectedUpdate.id]?.length || 0} officers have acknowledged this update
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {declarations[selectedUpdate.id]?.length > 0 ? (
                      <div className="overflow-auto h-full">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-white">
                              <TableHead className="font-medium">Officer</TableHead>
                              <TableHead className="font-medium hidden sm:table-cell">ID</TableHead>
                              <TableHead className="font-medium">Date & Time</TableHead>
                              <TableHead className="font-medium">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {declarations[selectedUpdate.id].map((declaration) => (
                              <TableRow key={declaration.id} className="border-b">
                                <TableCell className="font-medium">{declaration.officerName}</TableCell>
                                <TableCell className="hidden sm:table-cell">{declaration.officerId}</TableCell>
                                <TableCell className="text-xs">{declaration.timestamp}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    {declaration.status === 'completed' ? 'Completed' : 'Pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 bg-white rounded-lg border h-full flex flex-col justify-center">
                        <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-800 mb-1 text-sm">No Declarations Yet</h4>
                        <p className="text-xs text-gray-500">No officers have acknowledged this update yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OfficerSupport