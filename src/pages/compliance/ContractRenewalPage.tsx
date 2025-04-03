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
import { cn } from '@/lib/utils'

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
  const stats = [
    {
      label: 'Total Contracts',
      value: contracts.length,
      subLabel: 'Active contracts',
      textColorSubtle: 'text-indigo-200',
      bgColor: 'bg-indigo-700',
      iconBgColor: 'bg-indigo-600',
      icon: FileText
    },
    {
      label: 'Critical Expiry',
      value: contracts.filter(c => getExpiryStatus(c.expiryDate) === 'Critical').length,
      subLabel: 'Expires &lt; 2 months',
      textColorSubtle: 'text-red-200',
      bgColor: 'bg-red-700',
      iconBgColor: 'bg-red-600',
      icon: AlertCircle
    },
    {
      label: 'Expiring Soon',
      value: contracts.filter(c => getExpiryStatus(c.expiryDate) === 'Expiring Soon').length,
      subLabel: 'Expires &lt; 3 months',
      textColorSubtle: 'text-amber-100',
      bgColor: 'bg-amber-600',
      iconBgColor: 'bg-amber-500',
      icon: Clock
    },
    {
      label: 'Total Value',
      value: contracts.reduce((sum, contract) => sum + parseFloat(contract.cost), 0),
      subLabel: 'Annual contract value',
      textColorSubtle: 'text-emerald-200',
      bgColor: 'bg-emerald-700',
      iconBgColor: 'bg-emerald-600',
      icon: FileText
    }
  ]

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

  const renderPaginationButtons = (currentPage: number, totalPages: number, setCurrentPage: React.Dispatch<React.SetStateAction<number>>) => {
    const buttons = []
    let start = Math.max(currentPage - 2, 1)
    let end = Math.min(currentPage + 2, totalPages)

    if (end - start + 1 > 5) {
      end = start + 4
    }

    if (start > 1) {
      buttons.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          className={`w-8 h-8 ${currentPage === 1 ? 'bg-blue-600 text-white' : ''}`}
        >
          1
        </Button>
      )
    }

    if (start > 2) {
      buttons.push(
        <Button
          key="ellipsis-start"
          variant="outline"
          size="sm"
          className="w-8 h-8"
        >
          ...
        </Button>
      )
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 ${currentPage === i ? 'bg-blue-600 text-white' : ''}`}
        >
          {i}
        </Button>
      )
    }

    if (end < totalPages - 1) {
      buttons.push(
        <Button
          key="ellipsis-end"
          variant="outline"
          size="sm"
          className="w-8 h-8"
        >
          ...
        </Button>
      )
    }

    if (end < totalPages) {
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          className={`w-8 h-8 ${currentPage === totalPages ? 'bg-blue-600 text-white' : ''}`}
        >
          {totalPages}
        </Button>
      )
    }

    return buttons
  }

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <div className="space-y-3 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Contract Renewal Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Track and manage contract renewals</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="w-full sm:w-auto h-8 sm:h-auto text-xs sm:text-sm"
          >
            Add New Contract
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {stats.map((stat, index) => {
            const isLastOddCard = index === stats.length - 1 && stats.length % 2 !== 0
            return (
              <Card 
                key={stat.label} 
                className={cn(
                  "text-white hover:shadow-lg transition-shadow rounded-lg",
                  stat.bgColor,
                  isLastOddCard ? "col-span-2 lg:col-span-1" : "lg:col-span-1"
                )}
              >
                <CardContent className="pt-3 sm:pt-5 pb-2 sm:pb-4 px-3 sm:px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-xs font-medium", stat.textColorSubtle)}>{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold mt-0 sm:mt-1">{stat.value}</p>
                      <p className={cn("text-[10px] mt-0 sm:mt-1", stat.textColorSubtle)}>{stat.subLabel}</p>
                    </div>
                    <div className={cn("p-2 rounded-full", stat.iconBgColor)}>
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm bg-white rounded-lg">
          <CardContent className="pt-3 pb-3 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  className="pl-8 h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm ring-offset-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[200px] h-8 sm:h-10 text-xs sm:text-sm">
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
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card className="bg-white rounded-lg shadow-sm overflow-hidden border">
          <CardContent className="p-0">
            <div className="relative overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-xs">
                  <tr className="border-b">
                    <th className="px-2 py-2">Contract</th>
                    <th className="px-2 py-2 hidden sm:table-cell">Type</th>
                    <th className="px-2 py-2 hidden md:table-cell">Provider</th>
                    <th className="px-2 py-2 hidden lg:table-cell">Start Date</th>
                    <th className="px-2 py-2">Expiry</th>
                    <th className="px-2 py-2 hidden md:table-cell">Cost (£)</th>
                    <th className="px-2 py-2 hidden lg:table-cell">Remaining</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.map((contract) => {
                    const monthsRemaining = getMonthsRemaining(contract.expiryDate)
                    const status = getExpiryStatus(contract.expiryDate)
                    
                    return (
                      <tr key={contract.id} className="border-b hover:bg-gray-50">
                        {/* Mobile: Combine Name/Provider */}
                        <td className="px-2 py-2 font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold line-clamp-2">{contract.contractName}</span>
                            <span className="text-gray-500 sm:hidden">{contract.provider}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 hidden sm:table-cell">{contract.contractType}</td>
                        <td className="px-2 py-2 hidden md:table-cell">{contract.provider}</td>
                        <td className="px-2 py-2 hidden lg:table-cell">{format(contract.startDate, 'dd/MM/yy')}</td>
                        <td className="px-2 py-2 whitespace-nowrap">{format(contract.expiryDate, 'dd/MM/yy')}</td>
                        <td className="px-2 py-2 hidden md:table-cell">{parseFloat(contract.cost).toLocaleString()}</td>
                        <td className="px-2 py-2 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Progress 
                              value={monthsRemaining * 33.33} 
                              className={`h-1.5 w-12 ${getProgressColor(monthsRemaining)}`}
                            />
                            <span className="whitespace-nowrap">{monthsRemaining} mo</span>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <Badge className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(status)}`}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <Button
                              variant="ghost"
                              className="inline-flex items-center justify-center h-7 w-7 p-0"
                              onClick={() => openEditForm(contract)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              className="inline-flex items-center justify-center h-7 w-7 p-0"
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

            {/* Pagination Controls */}
            <div className="border-t border-gray-200 px-2 py-2 sm:px-4 sm:py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-[10px] sm:text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredContracts.length)} of {filteredContracts.length}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {renderPaginationButtons(currentPage, totalPages, setCurrentPage)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
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
