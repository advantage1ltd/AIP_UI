import { useState } from "react"
import { Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LeadTable } from "@/components/leads/LeadTable"
import { LeadForm } from "@/components/leads/LeadForm"
import { LeadFilter } from "@/components/leads/LeadFilter"
import { Lead } from "@/types/leads"
import { Contact } from "@/types/contacts"
import { toast } from "@/components/ui/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { v4 as uuidv4 } from 'uuid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDispatch } from 'react-redux'
import { addContact } from '@/store/features/contactsSlice'
import { useNavigate } from 'react-router-dom'

// Sample data - replace with actual data fetching
const SAMPLE_LEADS: Lead[] = [
  {
    id: "1",
    name: "Steven Scott",
    status: "New Lead",
    company: "Microsoft",
    title: "Team leader",
    email: "steven@microsoft.com",
    phone: "+1 203 795 3265",
    lastInteraction: "Nov 8, 2024",
    notes: "Initial contact made through LinkedIn"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    status: "Qualified",
    company: "Apple",
    title: "Security Manager",
    email: "sarah.j@apple.com",
    phone: "+1 408 555 0123",
    lastInteraction: "Nov 10, 2024",
    notes: "Interested in our monitoring services"
  }
]

export default function Leads() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ status?: Lead['status'] }>({})
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<"status" | "company" | null>(null)

  const handleAddLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newLead: Lead = {
      id: uuidv4(),
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      title: formData.get("title") as string,
      status: formData.get("status") as Lead['status'],
      notes: formData.get("notes") as string,
      lastInteraction: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    setLeads([newLead, ...leads])
    setIsAddLeadOpen(false)
    toast({
      title: "Lead Added",
      description: "New lead has been successfully added.",
    })
  }

  const handleMoveToContact = (lead: Lead) => {
    // Convert lead to contact
    const newContact: Contact = {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes || "",
      services: [],
      industry: "",
      region: "",
    }

    // Add to contacts store
    dispatch(addContact(newContact))

    // Remove from leads
    setLeads(leads.filter(l => l.id !== lead.id))

    // Show success message
    toast({
      title: "Lead Moved to Contacts",
      description: `${lead.name} has been successfully moved to contacts.`
    })

    // Navigate to contacts page
    navigate('/crm/contacts')
  }

  const handleFilterChange = (newFilters: { status?: Lead['status'] }) => {
    setFilters(newFilters)
  }

  // Apply filters and search
  let filteredLeads = leads
  
  // Apply status filter
  if (filters.status) {
    filteredLeads = filteredLeads.filter(lead => lead.status === filters.status)
  }

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredLeads = filteredLeads.filter(lead =>
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.title.toLowerCase().includes(query)
    )
  }

  // Group leads if grouping is selected
  const groupedLeads = groupBy ? 
    filteredLeads.reduce((groups, lead) => {
      const key = lead[groupBy]
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(lead)
      return groups
    }, {} as Record<string, Lead[]>) 
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-border/40">
          <div className="space-y-1 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Lead Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your potential clients
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <LeadFilter 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto"
              onClick={() => setIsAddLeadOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search and Group Controls */}
        <Card className="border border-border/40 shadow-sm">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select 
              value={groupBy || 'none'} 
              onValueChange={(value) => setGroupBy(value === 'none' ? null : value as "status" | "company")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Lead Count Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
          {filters.status ? ` with status "${filters.status}"` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg border border-border/40 shadow-sm overflow-hidden">
          {groupedLeads ? (
            Object.entries(groupedLeads).map(([group, leads]) => (
              <div key={group} className="space-y-2 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-primary">{group}</h2>
                <LeadTable 
                  leads={leads}
                  onMoveToContact={handleMoveToContact}
                />
              </div>
            ))
          ) : (
            <LeadTable 
              leads={filteredLeads}
              onMoveToContact={handleMoveToContact}
            />
          )}
        </div>

        {/* Add Lead Button (Bottom) */}
        {filteredLeads.length > 0 && (
          <Button
            variant="outline"
            className="w-full py-4 sm:py-6 border-dashed"
            onClick={() => setIsAddLeadOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add lead
          </Button>
        )}

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-lg border border-border/40 shadow-sm text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || filters.status 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "Get started by adding your first lead to begin tracking potential clients."}
            </p>
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setIsAddLeadOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add your first lead
            </Button>
          </div>
        )}
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-primary">
              Add New Lead
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new lead to your pipeline.
            </DialogDescription>
          </DialogHeader>
          <LeadForm onSubmit={handleAddLead} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
