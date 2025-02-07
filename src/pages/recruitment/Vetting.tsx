import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { VettingTable } from "@/components/recruitment/VettingTable"
import { VettingDialog } from "@/components/recruitment/VettingDialog"
import { useToast } from "@/hooks/use-toast"

const Vetting = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const { toast } = useToast()

  const handleNewCandidate = () => {
    setSelectedCandidate(null)
    setIsDialogOpen(true)
  }

  const handleEditCandidate = (candidate: any) => {
    setSelectedCandidate(candidate)
    setIsDialogOpen(true)
  }

  const handleDeleteCandidate = (candidate: any) => {
    toast({
      title: "Candidate Deleted",
      description: `${candidate.officerName} has been removed from vetting.`
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white drop-shadow-md mb-8">Candidate Vetting</h1>
      
      <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md">
        <CardContent className="p-6">
          <VettingTable
            onNew={handleNewCandidate}
            onEdit={handleEditCandidate}
            onDelete={handleDeleteCandidate}
          />
        </CardContent>
      </Card>

      <VettingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        candidate={selectedCandidate}
      />
    </div>
  )
}

export default Vetting