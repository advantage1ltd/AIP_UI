import { useState } from "react"
import { 
  Plus, 
  DollarSign, 
  ArrowRight, 
  Filter, 
  Search,
  BarChart3
} from "lucide-react"
import { DealCard } from "@/components/crm/DealCard"
import { DealDialog } from "@/components/crm/DealDialog"
import { Button } from "@/components/ui/button"
import { DUMMY_DEALS, PIPELINE_STAGES, Deal, PipelineStage } from "@/data/pipeline"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>(DUMMY_DEALS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()
  const [dealToDelete, setDealToDelete] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const { toast } = useToast()

  // Filter deals based on search and priority
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.contact.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || deal.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, deal: Deal) => {
    e.dataTransfer.setData("dealId", deal.id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId 
          ? { ...deal, stage, updatedAt: new Date().toISOString() }
          : deal
      )
    )

    toast({
      title: "Deal Updated",
      description: "Deal stage has been updated successfully",
    })
  }

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

    setDeals(prev => prev.filter(deal => deal.id !== dealToDelete))
    setDealToDelete(undefined)
    toast({
      title: "Deal Deleted",
      description: "Deal has been deleted successfully",
      variant: "destructive",
    })
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDialogOpen(true)
  }

  // Calculate summary stats
  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
  const totalDeals = filteredDeals.length
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-[#EFF4FF]">
      <div className="container ml-0 mr-2 md:ml-0 md:mr-2 lg:mx-auto px-2 md:px-4 lg:px-6 py-3 md:py-4 lg:py-6 max-w-full md:max-w-[95%] lg:max-w-7xl">
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          {/* Header with action buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-border/40">
            <div className="space-y-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Sales Pipeline</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and track your deals through the sales process
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

          {/* Summary Cards - modified for mobile to have 2 per row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-3 md:px-4 pt-3 md:pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Pipeline Value</CardTitle>
                <div className="rounded-full bg-blue-500/30 p-1 md:p-1.5">
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-4 pb-3 md:pb-4">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
                <div className="flex items-center mt-0.5 md:mt-1">
                  <span className="text-[10px] md:text-xs text-blue-100">
                    {totalDeals} active deals
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-indigo-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-3 md:px-4 pt-3 md:pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Average Deal</CardTitle>
                <div className="rounded-full bg-indigo-500/30 p-1 md:p-1.5">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-4 pb-3 md:pb-4">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">{formatCurrency(avgDealValue)}</div>
                <div className="flex items-center mt-0.5 md:mt-1">
                  <span className="text-[10px] md:text-xs text-indigo-100">
                    Per deal
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-emerald-600 col-span-2 md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 px-3 md:px-4 pt-3 md:pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-white">Conversion Rate</CardTitle>
                <div className="rounded-full bg-emerald-500/30 p-1 md:p-1.5">
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-4 pb-3 md:pb-4">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                  {filteredDeals.filter(d => d.stage === "closed").length > 0 
                    ? Math.round((filteredDeals.filter(d => d.stage === "closed").length / totalDeals) * 100) 
                    : 0}%
                </div>
                <div className="flex items-center mt-0.5 md:mt-1">
                  <span className="text-[10px] md:text-xs text-emerald-100">
                    Deals closed
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
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
            {priorityFilter !== "all" && (
              <> with <Badge variant="outline" className="ml-1 font-normal capitalize">
                {priorityFilter}
              </Badge> priority</>
            )}
            {searchQuery && <> matching "{searchQuery}"</>}
          </div>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[calc(100vh-20rem)]">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id)
              const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

              return (
                <div
                  key={stage.id}
                  className="flex flex-col bg-muted/30 rounded-lg border border-border/40 shadow-sm overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="p-3 border-b border-border/40 bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-primary">{stage.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {formatCurrency(totalValue)}
                    </div>
                  </div>

                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-24rem)]">
                    {stageDeals.length > 0 ? (
                      stageDeals.map(deal => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <DealCard 
                            deal={deal} 
                            onEdit={() => handleEditDeal(deal)}
                            onDelete={() => setDealToDelete(deal.id)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <p className="text-xs">No deals in this stage</p>
                        <p className="text-xs">Drag deals here or add a new one</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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
              {deals.find(d => d.id === dealToDelete)?.title && (
                <> "{deals.find(d => d.id === dealToDelete)?.title}"</>
              )}.
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
