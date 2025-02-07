import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { StockItem } from "@/types/stock"
import { StockTable } from "@/components/stock/StockTable"
import { StockItemForm } from "@/components/stock/StockItemForm"
import { StockStats } from "@/components/stock/StockStats"

const ITEMS_PER_PAGE = 10

const StockControl = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockItem
    direction: 'asc' | 'desc'
  }>({ key: 'name', direction: 'asc' })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const { toast } = useToast()

  const [stockItems, setStockItems] = useState<StockItem[]>([
    { 
      id: 1, 
      name: "Security Camera - HD", 
      sku: "SEC-CAM-001", 
      quantity: 45,
      minimumStock: 10,
      category: "Cameras", 
      status: "In Stock",
      unitPrice: 239.99,
      description: "High-definition security camera with night vision capabilities"
    },
    { 
      id: 2, 
      name: "Motion Sensor", 
      sku: "SNS-MOT-002", 
      quantity: 12,
      minimumStock: 15,
      category: "Sensors", 
      status: "Low Stock",
      unitPrice: 39.99,
      description: "Advanced motion detection sensor with adjustable sensitivity"
    },
    { 
      id: 3, 
      name: "Door Lock - Smart", 
      sku: "LCK-SMT-003", 
      quantity: 0,
      minimumStock: 5,
      category: "Locks", 
      status: "Out of Stock",
      unitPrice: 127.99,
      description: "Smart door lock with fingerprint and PIN access"
    },
  ])

  const filteredItems = useMemo(() => {
    return stockItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [stockItems, searchQuery])

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
    return sorted
  }, [filteredItems, sortConfig])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedItems, currentPage])

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE)

  const handleSort = (key: keyof StockItem) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newItem: StockItem = {
      id: stockItems.length + 1,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      quantity: Number(formData.get('quantity')),
      minimumStock: Number(formData.get('minimumStock')),
      category: formData.get('category') as string,
      status: Number(formData.get('quantity')) === 0 
        ? "Out of Stock" 
        : Number(formData.get('quantity')) <= Number(formData.get('minimumStock'))
        ? "Low Stock"
        : "In Stock",
      unitPrice: Number(formData.get('unitPrice')),
      description: formData.get('description') as string,
    }
    
    setStockItems([...stockItems, newItem])
    setIsAddDialogOpen(false)
    toast({
      title: "Success",
      description: "New item has been added to inventory",
    })
  }

  const handleEditItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedItem) return

    const formData = new FormData(e.currentTarget)
    const quantity = Number(formData.get('quantity'))
    const minimumStock = Number(formData.get('minimumStock'))
    
    const updatedItem: StockItem = {
      ...selectedItem,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      quantity,
      minimumStock,
      category: formData.get('category') as string,
      status: quantity === 0 
        ? "Out of Stock" 
        : quantity <= minimumStock
        ? "Low Stock"
        : "In Stock",
      unitPrice: Number(formData.get('unitPrice')),
      description: formData.get('description') as string,
    }

    setStockItems(stockItems.map(item => 
      item.id === selectedItem.id ? updatedItem : item
    ))
    setSelectedItem(null)
    toast({
      title: "Success",
      description: "Item has been updated",
    })
  }

  const handleDeleteItem = (id: number) => {
    setStockItems(stockItems.filter(item => item.id !== id))
    toast({
      title: "Success",
      description: "Item has been deleted",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#303D51]">Stock Control</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-600 hover:to-slate-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new item to your inventory. Fill in all the required fields below.
              </DialogDescription>
            </DialogHeader>
            <StockItemForm onSubmit={handleAddItem} />
          </DialogContent>
        </Dialog>
      </div>

      <StockStats items={stockItems} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <StockTable 
            items={paginatedItems}
            onSort={handleSort}
            onEdit={setSelectedItem}
            onDelete={handleDeleteItem}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details below.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <StockItemForm item={selectedItem} onSubmit={handleEditItem} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StockControl
