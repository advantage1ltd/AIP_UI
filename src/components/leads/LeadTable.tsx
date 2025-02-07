import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Lead } from "@/types/leads"
import { Badge } from "@/components/ui/badge"

interface LeadTableProps {
  leads: Lead[]
  onMoveToContact: (lead: Lead) => void
}

const getStatusColor = (status: Lead['status']) => {
  switch (status) {
    case 'New Lead':
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
    case 'Qualified':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    case 'Negotiation':
      return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
    case 'Won':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
    case 'Lost':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
  }
}

export function LeadTable({ leads, onMoveToContact }: LeadTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="font-semibold">Lead</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Last Interaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-muted/50">
              <TableCell>
                <input type="checkbox" className="rounded border-gray-300" />
              </TableCell>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(lead.status)}
                >
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onMoveToContact(lead)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Move to Contacts
                </Button>
              </TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.title}</TableCell>
              <TableCell>
                <a 
                  href={`mailto:${lead.email}`}
                  className="text-primary hover:underline"
                >
                  {lead.email}
                </a>
              </TableCell>
              <TableCell>
                <a 
                  href={`tel:${lead.phone}`}
                  className="text-primary hover:underline"
                >
                  {lead.phone}
                </a>
              </TableCell>
              <TableCell>{lead.lastInteraction}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
