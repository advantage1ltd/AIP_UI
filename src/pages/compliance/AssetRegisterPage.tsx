import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  ChevronRight,
  Plus
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
import { cn } from '@/lib/utils'

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
  const stats = [
    {
      title: 'Total Assets',
      value: assets.length,
      icon: Package,
      color: 'bg-indigo-700',
      iconBg: 'bg-indigo-600/40'
    },
    {
      title: 'In Use',
      value: assets.filter(a => a.status === 'In Use').length,
      icon: Laptop,
      color: 'bg-emerald-700',
      iconBg: 'bg-emerald-600/40'
    },
    {
      title: 'In Stock',
      value: assets.filter(a => a.status === 'In Stock').length,
      icon: Package,
      color: 'bg-blue-700',
      iconBg: 'bg-blue-600/40'
    },
    {
      title: 'In Repair',
      value: assets.filter(a => a.status === 'In Repair').length,
      icon: AlertCircle,
      color: 'bg-amber-600',
      iconBg: 'bg-amber-500/40'
    }
  ];

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

  const getAssetTypeIcon = (assetType: string) => {
    switch (assetType) {
      case 'Laptop':
        return <Laptop className="h-5 w-5" />
      case 'Phone':
        return <Smartphone className="h-5 w-5" />
      case 'Monitor':
        return <Monitor className="h-5 w-5" />
      case 'Printer':
        return <Printer className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  };

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
    <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <div className="container mx-auto px-3 py-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-full md:max-w-[95%] lg:max-w-7xl">
        
        {/* Header Card */}
        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Asset Register</CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">Track and manage company assets</CardDescription>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
                className="w-full sm:w-auto h-9 text-xs sm:text-sm"
          >
                <Plus className="h-5 w-5 mr-1 sm:mr-2" />
                <span className="sm:hidden">Add New</span>
                <span className="hidden sm:inline">Add New Asset</span>
          </Button>
        </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={cn(
                "text-white hover:shadow-lg transition-shadow rounded-lg",
                stat.color 
              )}
            >
              <CardContent className="pt-3 pb-2 px-3 md:pt-4 md:pb-3 md:px-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs md:text-sm font-medium text-white/80">{stat.title}</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold mt-0 md:mt-1">{stat.value}</p>
                </div>
                  <div className={cn("p-2 rounded-full", stat.iconBg)}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>

        {/* Filters Card */}
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search assets..."
                  className="pl-9 h-9 sm:h-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm min-w-[120px]">
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
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm min-w-[120px]">
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
            </div>
          </CardContent>
        </Card>

        {/* Card-based layout for smaller screens */}
        <div className="block sm:hidden space-y-2">
          {paginatedAssets.length > 0 ? (
            paginatedAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Header with Asset Tag & Type */}
                  <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                    <div className="flex items-center gap-2">
                      <Badge className="px-1.5 py-0.5">
                        {asset.assetType}
                        </Badge>
                      <h3 className="font-medium text-sm">{asset.assetTag}</h3>
                    </div>
                    <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(asset)}
                        className="h-8 w-8 rounded-full p-0 text-blue-600"
                          >
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(asset)}
                        className="h-8 w-8 rounded-full p-0 text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Asset Details */}
                  <div className="divide-y divide-slate-100">
                    {/* Make/Model Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Make/Model</div>
                      <div className="w-2/3 text-xs font-medium truncate">{`${asset.make} ${asset.model}`}</div>
                    </div>
                    
                    {/* Serial Number Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Serial</div>
                      <div className="w-2/3 text-xs font-medium truncate">{asset.serialNumber}</div>
                    </div>
                    
                    {/* Status Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Status</div>
                      <div className="w-2/3">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Assigned To Row - if present */}
                    {asset.assignedTo && (
                      <div className="flex items-center p-3">
                        <div className="w-1/3 text-xs text-slate-500">Assigned To</div>
                        <div className="w-2/3 text-xs truncate">{asset.assignedTo}</div>
                      </div>
                    )}
                    
                    {/* Location Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Location</div>
                      <div className="w-2/3 text-xs truncate">{asset.location}</div>
                    </div>
                    
                    {/* Purchase Date Row */}
                    <div className="flex items-center p-3">
                      <div className="w-1/3 text-xs text-slate-500">Purchased</div>
                      <div className="w-2/3 text-xs">{format(asset.purchaseDate, 'dd/MM/yyyy')}</div>
                    </div>
                    
                    {/* Notes Row - if present */}
                    {asset.notes && (
                      <div className="p-3">
                        <div className="text-xs text-slate-500 mb-1">Notes</div>
                        <div className="text-xs">{asset.notes}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-lg border border-border/40 shadow-sm">
              <p className="text-sm text-slate-500">No assets found matching your search.</p>
            </div>
          )}
          
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="text-xs text-slate-500">
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAssets.length)} of {filteredAssets.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {[
                  ...currentPage > 2 ? [1] : [],
                  ...currentPage > 3 ? [-1] : [],
                  ...Array.from(
                    { length: Math.min(3, totalPages) },
                    (_, i) => Math.min(Math.max(currentPage - 1 + i, 1 + (currentPage > 2 ? 1 : 0) + (currentPage > 3 ? 1 : 0)), totalPages - (currentPage < totalPages - 2 ? 1 : 0) - (currentPage < totalPages - 3 ? 1 : 0))
                  ),
                  ...currentPage < totalPages - 2 ? [-2] : [],
                  ...currentPage < totalPages - 1 ? [totalPages] : []
                ].map((page, i) => 
                  page < 0 ? (
                    <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-slate-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table layout for iPad and larger screens */}
        <Card className="hidden sm:block border border-border/40 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Asset Tag</th>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Make/Model</th>
                    <th className="hidden md:table-cell px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Serial</th>
                    <th className="hidden lg:table-cell px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Purchase</th>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Assigned</th>
                    <th className="hidden lg:table-cell px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-2 md:px-3 lg:px-4 py-3 text-center md:text-right text-xs font-semibold uppercase tracking-wider w-[100px] md:w-[110px] lg:w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap font-medium">{asset.assetTag}</td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600">
                              {getAssetTypeIcon(asset.assetType)}
                            </span>
                            <span className="hidden md:inline">{asset.assetType}</span>
                          </div>
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">{`${asset.make} ${asset.model}`}</td>
                        <td className="hidden md:table-cell px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap font-mono text-xs">{asset.serialNumber}</td>
                        <td className="hidden lg:table-cell px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">{format(asset.purchaseDate, 'dd/MM/yyyy')}</td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">{asset.assignedTo || '-'}</td>
                        <td className="hidden lg:table-cell px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">{asset.location}</td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap">
                          <Badge className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </td>
                        <td className="px-2 md:px-3 lg:px-4 py-3 whitespace-nowrap text-center md:text-right">
                          <div className="inline-flex items-center gap-2 ml-auto">
                            <Button
                              variant="outline"
                              onClick={() => openEditForm(asset)}
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200 h-9 w-9 md:w-10 lg:w-[75px] flex items-center justify-center gap-1"
                            >
                              <Pencil className="h-5 w-5 md:h-6 md:w-6 text-blue-600" strokeWidth={2} />
                              <span className="hidden lg:inline text-xs text-blue-600">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => openDeleteDialog(asset)}
                              className="bg-red-50 hover:bg-red-100 border-red-200 h-9 w-9 md:w-10 lg:w-[75px] flex items-center justify-center gap-1"
                            >
                              <Trash2 className="h-5 w-5 md:h-6 md:w-6 text-red-600" strokeWidth={2} />
                              <span className="hidden lg:inline text-xs text-red-600">Delete</span>
                          </Button>
                        </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-sm text-slate-500">
                        No assets found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tablet/Desktop Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-3 py-3 sm:px-3 md:px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 order-2 sm:order-1">
                    Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAssets.length)} of {filteredAssets.length}
                </div>
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                  >
                      <ChevronLeft className="h-5 w-5" />
                  </Button>
                    {totalPages <= 5 ? (
                      // Show all pages if 5 or fewer
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                          {page}
                        </Button>
                      ))
                    ) : (
                      // Show limited pages with ellipsis for larger page counts
                      <>
                        {[
                          1,
                          currentPage > 3 ? '...' : 2,
                          currentPage > 2 && currentPage < totalPages - 1 ? currentPage : null,
                          currentPage < totalPages - 2 ? '...' : totalPages - 1,
                          totalPages
                        ].filter(Boolean).map((page, i) => 
                          page === '...' ? (
                            <span key={`ellipsis-${i}`} className="h-9 w-9 flex items-center justify-center text-xs text-slate-400">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => typeof page === 'number' && setCurrentPage(page)}
                              className={`h-9 w-9 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        {page}
                      </Button>
                          )
                        )}
                      </>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                  >
                      <ChevronRight className="h-5 w-5" />
                  </Button>
                  </div>
                </div>
              </div>
            )}
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
            <AlertDialogAction onClick={handleDeleteAsset} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AssetRegisterPage
