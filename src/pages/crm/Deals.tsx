import { useState } from "react"
import { Plus, Search, Filter, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { DealsTable } from "@/components/crm/DealsTable"
import { DealDialog } from "@/components/crm/DealDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useToast } from "@/components/ui/use-toast"
import { Deal, DUMMY_DEALS, PIPELINE_STAGES } from "@/data/pipeline"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>(DUMMY_DEALS)
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()
  const [dealToDelete, setDealToDelete] = useState<Deal | undefined>()
  const { toast } = useToast()

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilter === "all" || deal.stage === stageFilter
    const matchesPriority = priorityFilter === "all" || deal.priority === priorityFilter

    return matchesSearch && matchesStage && matchesPriority
  })

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  const highPriorityCount = filteredDeals.filter(deal => deal.priority === "high").length
  const closedDealsValue = filteredDeals
    .filter(deal => deal.stage === "closed")
    .reduce((sum, deal) => sum + deal.value, 0)

  const handleCreateDeal = (data: Partial<Deal>) => {
    const newDeal: Deal = {
      id: `d${deals.length + 1}`,
      title: data.title!,
      value: data.value!,
      company: data.company!,
      contact: data.contact!,
      email: data.email!,
      stage: data.stage!,
      priority: data.priority!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDeals(prev => [...prev, newDeal])
    setIsDialogOpen(false)
    toast({
      title: "Deal Created",
      description: "New deal has been created successfully",
    })
  }

  const handleUpdateDeal = (data: Partial<Deal>) => {
    if (!selectedDeal) return

    setDeals(prev => prev.map(deal => 
      deal.id === selectedDeal.id 
        ? { 
            ...deal, 
            ...data, 
            updatedAt: new Date().toISOString() 
          }
        : deal
    ))
    setIsDialogOpen(false)
    setSelectedDeal(undefined)
    toast({
      title: "Deal Updated",
      description: "Deal has been updated successfully",
    })
  }

  const handleDeleteDeal = () => {
    if (!dealToDelete) return

    setDeals(prev => prev.filter(deal => deal.id !== dealToDelete.id))
    setDealToDelete(undefined)
    toast({
      title: "Deal Deleted",
      description: "Deal has been deleted successfully",
      variant: "destructive",
    })
  }

  const handleViewDeal = (deal: Deal) => {
    // TODO: Implement view deal details
    console.log("View deal:", deal)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-border/40">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Deal Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track and manage your sales pipeline
            </p>
          </div>
          <Button 
            onClick={() => {
              setSelectedDeal(undefined)
              setIsDialogOpen(true)
            }}
            className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">Total Pipeline Value</CardTitle>
              <div className="rounded-full bg-blue-500/30 p-1.5 sm:p-2">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-blue-100">
                  Across {filteredDeals.length} active deals
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-amber-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">High Priority Deals</CardTitle>
              <div className="rounded-full bg-amber-500/30 p-1.5 sm:p-2">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{highPriorityCount}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-amber-100">
                  Requiring immediate attention
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-emerald-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-white">Closed Deals Value</CardTitle>
              <div className="rounded-full bg-emerald-500/30 p-1.5 sm:p-2">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl sm:text-2xl font-bold text-white">{formatCurrency(closedDealsValue)}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-emerald-100">
                  Successfully closed deals
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="border border-border/40 shadow-sm">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {PIPELINE_STAGES.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Deal Count Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
          {stageFilter !== "all" && (
            <> in <Badge variant="outline" className="ml-1 font-normal">
              {PIPELINE_STAGES.find(s => s.id === stageFilter)?.label || stageFilter}
            </Badge> stage</>
          )}
          {priorityFilter !== "all" && (
            <> with <Badge variant="outline" className="ml-1 font-normal capitalize">
              {priorityFilter}
            </Badge> priority</>
          )}
          {searchTerm && <> matching "{searchTerm}"</>}
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg border border-border/40 shadow-sm overflow-hidden">
          {filteredDeals.length > 0 ? (
            <DealsTable 
              data={filteredDeals}
              onEdit={(deal) => {
                setSelectedDeal(deal)
                setIsDialogOpen(true)
              }}
              onDelete={setDealToDelete}
              onView={handleViewDeal}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No deals found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm || stageFilter !== "all" || priorityFilter !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for." 
                  : "Get started by adding your first deal to begin tracking your sales pipeline."}
              </p>
              <Button 
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => {
                  setSelectedDeal(undefined)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Add your first deal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Deal Dialog */}
      <DealDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deal={selectedDeal}
        onSubmit={selectedDeal ? handleUpdateDeal : handleCreateDeal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!dealToDelete} onOpenChange={() => setDealToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal
              {dealToDelete?.title && <> "{dealToDelete.title}"</>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeal} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}