import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Printer,
  AlertCircle, 
  Package, 
  Pencil, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { AssetForm } from '@/components/compliance/AssetForm'
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

interface Asset {
  id: string
  assetTag: string
  assetType: 'Laptop' | 'Phone' | 'Tablet' | 'Desktop' | 'Monitor' | 'Printer' | 'Other'
  make: string
  model: string
  serialNumber: string
  purchaseDate: Date
  assignedTo?: string
  location: string
  status: 'In Use' | 'In Stock' | 'In Repair' | 'Disposed'
  notes?: string
}

const sampleData: Asset[] = [
  {
    id: '1',
    assetTag: 'LAP001',
    assetType: 'Laptop',
    make: 'Dell',
    model: 'Latitude 5520',
    serialNumber: 'DL123456789',
    purchaseDate: new Date('2023-01-15'),
    assignedTo: 'John Smith',
    location: 'Head Office',
    status: 'In Use',
    notes: 'Company standard laptop'
  },
  {
    id: '2',
    assetTag: 'PHN002',
    assetType: 'Phone',
    make: 'iPhone',
    model: '13 Pro',
    serialNumber: 'IP987654321',
    purchaseDate: new Date('2023-03-20'),
    assignedTo: 'Sarah Wilson',
    location: 'Field',
    status: 'In Use',
  },
  {
    id: '3',
    assetTag: 'MON003',
    assetType: 'Monitor',
    make: 'Dell',
    model: 'P2419H',
    serialNumber: 'MN456789123',
    purchaseDate: new Date('2023-06-10'),
    location: 'Storage',
    status: 'In Stock',
  }
]

const AssetRegisterPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [assets, setAssets] = useState<Asset[]>(sampleData)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Calculate statistics
  const stats = {
    totalAssets: assets.length,
    inUse: assets.filter(a => a.status === 'In Use').length,
    inStock: assets.filter(a => a.status === 'In Stock').length,
    inRepair: assets.filter(a => a.status === 'In Repair').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Use':
        return 'bg-green-100 text-green-800'
      case 'In Stock':
        return 'bg-blue-100 text-blue-800'
      case 'In Repair':
        return 'bg-yellow-100 text-yellow-800'
      case 'Disposed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddAsset = (data: any) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      ...data,
    }
    setAssets([...assets, newAsset])
    setIsFormOpen(false)
  }

  const handleEditAsset = (data: any) => {
    if (!selectedAsset) return
    
    const updatedAssets = assets.map(asset => 
      asset.id === selectedAsset.id 
        ? { ...asset, ...data }
        : asset
    )
    setAssets(updatedAssets)
    setIsFormOpen(false)
    setSelectedAsset(null)
  }

  const handleDeleteAsset = () => {
    if (!selectedAsset) return
    
    const updatedAssets = assets.filter(asset => asset.id !== selectedAsset.id)
    setAssets(updatedAssets)
    setIsDeleteDialogOpen(false)
    setSelectedAsset(null)
  }

  const openEditForm = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsDeleteDialogOpen(true)
  }

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesType = selectedType === 'all' || asset.assetType === selectedType
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + pageSize)

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Asset Register</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage company assets</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add New Asset
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Assets</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalAssets}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Use</p>
                  <p className="text-2xl font-bold mt-1">{stats.inUse}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Laptop className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Stock</p>
                  <p className="text-2xl font-bold mt-1">{stats.inStock}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Repair</p>
                  <p className="text-2xl font-bold mt-1">{stats.inRepair}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="pl-8 h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="In Repair">In Repair</SelectItem>
                  <SelectItem value="Disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Asset Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3">Asset Tag</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Make/Model</th>
                    <th className="px-6 py-3">Serial Number</th>
                    <th className="px-6 py-3">Purchase Date</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.map((asset) => (
                    <tr key={asset.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{asset.assetTag}</td>
                      <td className="px-6 py-4">{asset.assetType}</td>
                      <td className="px-6 py-4">{`${asset.make} ${asset.model}`}</td>
                      <td className="px-6 py-4">{asset.serialNumber}</td>
                      <td className="px-6 py-4">{format(asset.purchaseDate, 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4">{asset.assignedTo || '-'}</td>
                      <td className="px-6 py-4">{asset.location}</td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(asset)}
                            className="hover:bg-gray-100 rounded-full p-1"
                          >
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(asset)}
                            className="hover:bg-gray-100 rounded-full p-1"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredAssets.length)} of {filteredAssets.length} entries
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

      {/* Forms and Dialogs */}
      <AssetForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedAsset(null)
        }}
        onSubmit={selectedAsset ? handleEditAsset : handleAddAsset}
        initialData={selectedAsset || undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this asset record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AssetRegisterPage
