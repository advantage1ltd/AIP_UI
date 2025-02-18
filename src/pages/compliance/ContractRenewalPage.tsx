import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, AlertCircle, FileText, Clock, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, differenceInMonths, format } from 'date-fns'
import { ContractForm } from '@/components/compliance/ContractForm'
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

interface Contract {
  id: string
  contractName: string
  contractType: 'Antivirus' | 'Cyber Essentials' | 'Software Subscription' | 'Hardware Maintenance' | 'Other'
  provider: string
  startDate: Date
  expiryDate: Date
  cost: string
  notes?: string
  status: 'Active' | 'Expiring Soon' | 'Critical'
}

const sampleData: Contract[] = [
  {
    id: '1',
    contractName: 'Norton Antivirus Enterprise',
    contractType: 'Antivirus',
    provider: 'Norton',
    startDate: new Date('2023-01-15'),
    expiryDate: addMonths(new Date(), 1),
    cost: '2500',
    notes: 'Enterprise license for 100 devices',
    status: 'Critical'
  },
  {
    id: '2',
    contractName: 'Cyber Essentials Plus',
    contractType: 'Cyber Essentials',
    provider: 'IASME',
    startDate: new Date('2023-03-20'),
    expiryDate: addMonths(new Date(), 2),
    cost: '3000',
    notes: 'Annual certification',
    status: 'Expiring Soon'
  },
  {
    id: '3',
    contractName: 'Microsoft 365',
    contractType: 'Software Subscription',
    provider: 'Microsoft',
    startDate: new Date('2023-06-10'),
    expiryDate: addMonths(new Date(), 4),
    cost: '15000',
    notes: 'Business Premium - 150 users',
    status: 'Active'
  }
]

const ContractRenewalPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [contracts, setContracts] = useState<Contract[]>(sampleData)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const getExpiryStatus = (expiryDate: Date) => {
    const monthsToExpiry = differenceInMonths(expiryDate, new Date())
    if (monthsToExpiry <= 2) return 'Critical'
    if (monthsToExpiry <= 3) return 'Expiring Soon'
    return 'Active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'Active':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMonthsRemaining = (expiryDate: Date) => {
    const months = differenceInMonths(expiryDate, new Date())
    return Math.max(0, months)
  }

  const getProgressColor = (months: number) => {
    if (months <= 2) return 'bg-red-500'
    if (months <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Calculate statistics
  const stats = {
    totalContracts: contracts.length,
    expiringCritical: contracts.filter(c => getExpiryStatus(c.expiryDate) === 'Critical').length,
    expiringSoon: contracts.filter(c => getExpiryStatus(c.expiryDate) === 'Expiring Soon').length,
    active: contracts.filter(c => getExpiryStatus(c.expiryDate) === 'Active').length,
    totalValue: contracts.reduce((sum, contract) => sum + parseFloat(contract.cost), 0)
  }

  const handleAddContract = (data: any) => {
    const newContract: Contract = {
      id: Date.now().toString(),
      ...data,
      status: getExpiryStatus(data.expiryDate)
    }
    setContracts([...contracts, newContract])
    setIsFormOpen(false)
  }

  const handleEditContract = (data: any) => {
    if (!selectedContract) return
    
    const updatedContracts = contracts.map(contract => 
      contract.id === selectedContract.id 
        ? { ...contract, ...data, status: getExpiryStatus(data.expiryDate) }
        : contract
    )
    setContracts(updatedContracts)
    setIsFormOpen(false)
    setSelectedContract(null)
  }

  const handleDeleteContract = () => {
    if (!selectedContract) return
    
    const updatedContracts = contracts.filter(contract => contract.id !== selectedContract.id)
    setContracts(updatedContracts)
    setIsDeleteDialogOpen(false)
    setSelectedContract(null)
  }

  const openEditForm = (contract: Contract) => {
    setSelectedContract(contract)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (contract: Contract) => {
    setSelectedContract(contract)
    setIsDeleteDialogOpen(true)
  }

  // Filter contracts based on search and type
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || !selectedType || contract.contractType === selectedType
    return matchesSearch && matchesType
  })

  // Add pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + pageSize)

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Contract Renewal Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage contract renewals</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add New Contract</Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalContracts}</p>
                  <p className="text-sm text-gray-500 mt-1">Active contracts</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Critical Expiry</p>
                  <p className="text-2xl font-bold mt-1">{stats.expiringCritical}</p>
                  <p className="text-sm text-gray-500 mt-1">Expires within 2 months</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold mt-1">{stats.expiringSoon}</p>
                  <p className="text-sm text-gray-500 mt-1">Expires within 3 months</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold mt-1">£{stats.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Annual contract value</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    className="pl-8 h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Antivirus">Antivirus</SelectItem>
                    <SelectItem value="Cyber Essentials">Cyber Essentials</SelectItem>
                    <SelectItem value="Software Subscription">Software Subscription</SelectItem>
                    <SelectItem value="Hardware Maintenance">Hardware Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3">Contract Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Start Date</th>
                    <th className="px-6 py-3">Expiry Date</th>
                    <th className="px-6 py-3">Cost (£)</th>
                    <th className="px-6 py-3">Time Remaining</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.map((contract) => {
                    const monthsRemaining = getMonthsRemaining(contract.expiryDate)
                    const status = getExpiryStatus(contract.expiryDate)
                    
                    return (
                      <tr key={contract.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{contract.contractName}</td>
                        <td className="px-6 py-4">{contract.contractType}</td>
                        <td className="px-6 py-4">{contract.provider}</td>
                        <td className="px-6 py-4">{format(contract.startDate, 'dd/MM/yyyy')}</td>
                        <td className="px-6 py-4">{format(contract.expiryDate, 'dd/MM/yyyy')}</td>
                        <td className="px-6 py-4">{parseFloat(contract.cost).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={monthsRemaining * 33.33} 
                              className={`h-2 w-24 ${getProgressColor(monthsRemaining)}`}
                            />
                            <span>{monthsRemaining} months</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(contract)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(contract)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Pagination Controls */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredContracts.length)} of {filteredContracts.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      <ContractForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedContract(null)
        }}
        onSubmit={selectedContract ? handleEditContract : handleAddContract}
        initialData={selectedContract || undefined}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContract}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ContractRenewalPage
