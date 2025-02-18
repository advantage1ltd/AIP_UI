import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { VettingTable } from "@/components/recruitment/VettingTable"
import { VettingDialog } from "@/components/recruitment/VettingDialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Filter, Search, ClipboardCheck, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Vetting = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Candidate Vetting</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track candidate vetting process</p>
        </div>
        <Button 
          onClick={handleNewCandidate}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add New Candidate
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Candidates</p>
                <p className="text-2xl font-bold mt-1">24</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">8</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold mt-1">4</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="pl-8 h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <VettingTable
            onEdit={handleEditCandidate}
            onDelete={handleDeleteCandidate}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
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