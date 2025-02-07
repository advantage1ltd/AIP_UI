import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

// Dummy data
const DUMMY_CANDIDATES = [
  {
    id: 1,
    region: "West Midlands",
    officerName: "John Smith",
    roleOffered: "Security Officer",
    interviewDate: "2024-02-15",
    driver: "Yes",
    vettingStartDate: "2024-02-16",
    interviewNotes: "Yes",
    estimatedStartDate: "2024-03-01",
    interviewingManager: "Sarah Wilson",
    redFlags: "No",
    recruitmentOutcome: "Ready for next stage!",
    comments: "Excellent candidate with strong references."
  },
  {
    id: 2,
    region: "East Midlands",
    officerName: "Jane Doe",
    roleOffered: "Site Supervisor",
    interviewDate: "2024-02-14",
    driver: "No",
    vettingStartDate: "2024-02-15",
    interviewNotes: "Yes",
    estimatedStartDate: "2024-03-15",
    interviewingManager: "Mike Johnson",
    redFlags: "Yes",
    recruitmentOutcome: "Docs Received - Processing",
    comments: "Pending background check verification."
  }
]

interface VettingTableProps {
  onNew: () => void
  onEdit: (candidate: any) => void
  onDelete: (candidate: any) => void
}

export function VettingTable({ onNew, onEdit, onDelete }: VettingTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredCandidates = DUMMY_CANDIDATES.filter(candidate =>
    candidate.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-9 bg-white/50 border-none" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onNew} className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="mr-2 h-4 w-4" />
          New Candidate
        </Button>
      </div>

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Officer Name</TableHead>
              <TableHead>Role Offered</TableHead>
              <TableHead>Interview Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vetting Start</TableHead>
              <TableHead>Interview Notes</TableHead>
              <TableHead>Est. Start Date</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Red Flags</TableHead>
              <TableHead>Recruitment Outcome</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.region}</TableCell>
                <TableCell>{candidate.officerName}</TableCell>
                <TableCell>{candidate.roleOffered}</TableCell>
                <TableCell>{formatDate(candidate.interviewDate)}</TableCell>
                <TableCell>{candidate.driver}</TableCell>
                <TableCell>{formatDate(candidate.vettingStartDate)}</TableCell>
                <TableCell>{candidate.interviewNotes}</TableCell>
                <TableCell>{formatDate(candidate.estimatedStartDate)}</TableCell>
                <TableCell>{candidate.interviewingManager}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    candidate.redFlags === "Yes" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-green-100 text-green-700"
                  }`}>
                    {candidate.redFlags}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {candidate.recruitmentOutcome}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={candidate.comments}>
                  {candidate.comments}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(candidate)}
                    className="hover:bg-purple-100"
                  >
                    <Pencil className="h-4 w-4 text-purple-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(candidate)}
                    className="hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}