import { useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
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

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-[1920px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#303D51]">Deals</h1>
          <p className="text-gray-500">Manage and track all your deals in one place</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedDeal(undefined)
            setIsDialogOpen(true)
          }}
          className="bg-[#324053] hover:bg-[#324053]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(totalValue)}
            </div>
            <p className="text-xs text-blue-100">
              Across {filteredDeals.length} active deals
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">High Priority Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{highPriorityCount}</div>
            <p className="text-xs text-amber-100">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Closed Deals Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(closedDealsValue)}
            </div>
            <p className="text-xs text-green-100">
              Successfully closed deals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="max-w-sm flex-1">
            <Input
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              prefix={<Search className="h-4 w-4 text-gray-500" />}
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
      </div>

      <DealsTable 
        data={filteredDeals}
        onEdit={(deal) => {
          setSelectedDeal(deal)
          setIsDialogOpen(true)
        }}
        onDelete={setDealToDelete}
        onView={handleViewDeal}
      />

      <DealDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deal={selectedDeal}
        onSubmit={selectedDeal ? handleUpdateDeal : handleCreateDeal}
      />

      <AlertDialog open={!!dealToDelete} onOpenChange={() => setDealToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeal} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}