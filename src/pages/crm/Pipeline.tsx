import { useState } from "react"
import { Plus } from "lucide-react"
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

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>(DUMMY_DEALS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>()
  const [dealToDelete, setDealToDelete] = useState<string | undefined>()
  const { toast } = useToast()

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

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-[1920px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#303D51]">Pipeline</h1>
          <p className="text-gray-500">Manage and track your deals through the sales pipeline</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[calc(100vh-12rem)]">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = deals.filter(deal => deal.stage === stage.id)
          const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

          return (
            <div
              key={stage.id}
              className="flex flex-col bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-700">{stage.label}</h3>
                  <span className="text-sm text-gray-500">{stageDeals.length}</span>
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  £{totalValue.toLocaleString('en-GB')}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                  >
                    <DealCard 
                      deal={deal} 
                      onEdit={() => handleEditDeal(deal)}
                      onDelete={() => setDealToDelete(deal.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

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
