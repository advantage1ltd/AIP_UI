import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { UK_COUNTIES } from "@/lib/constants"

interface VettingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate?: any
}

export function VettingDialog({ open, onOpenChange, candidate }: VettingDialogProps) {
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast({
      title: candidate ? "Candidate Updated" : "Candidate Added",
      description: "The candidate information has been saved successfully."
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {candidate ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select defaultValue={candidate?.region}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {UK_COUNTIES.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officerName">Officer Name</Label>
              <Input 
                id="officerName"
                defaultValue={candidate?.officerName}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleOffered">Role Offered</Label>
              <Select defaultValue={candidate?.roleOffered}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security Officer">Security Officer</SelectItem>
                  <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
                  <SelectItem value="Control Room Operator">Control Room Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input 
                id="interviewDate"
                type="date"
                defaultValue={candidate?.interviewDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Select defaultValue={candidate?.driver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vettingStartDate">Vetting Start Date</Label>
              <Input 
                id="vettingStartDate"
                type="date"
                defaultValue={candidate?.vettingStartDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewNotes">Interview Notes</Label>
              <Select defaultValue={candidate?.interviewNotes}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedStartDate">Estimated Start Date</Label>
              <Input 
                id="estimatedStartDate"
                type="date"
                defaultValue={candidate?.estimatedStartDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewingManager">Interviewing Manager</Label>
              <Input 
                id="interviewingManager"
                defaultValue={candidate?.interviewingManager}
                placeholder="Enter manager name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redFlags">Red Flags</Label>
              <Select defaultValue={candidate?.redFlags}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruitmentOutcome">Recruitment Outcome</Label>
              <Select defaultValue={candidate?.recruitmentOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ready for next stage!">Ready for next stage!</SelectItem>
                  <SelectItem value="Preliminary vetting Nearing Completion (Within 1 week)">
                    Preliminary vetting Nearing Completion (Within 1 week)
                  </SelectItem>
                  <SelectItem value="Docs Received - Processing">Docs Received - Processing</SelectItem>
                  <SelectItem value="Job Offered - Awaiting FULL Documents">
                    Job Offered - Awaiting FULL Documents
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea 
                id="comments"
                defaultValue={candidate?.comments}
                placeholder="Enter any additional comments..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {candidate ? "Update Candidate" : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}