import { formatDistanceToNow } from "date-fns"
import { Building2, Mail, User, MoreVertical } from "lucide-react"
import { Deal } from "@/data/pipeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DealCardProps {
  deal: Deal
  onEdit: () => void
  onDelete: () => void
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{deal.title}</h3>
          <p className="text-sm text-gray-500">£{deal.value.toLocaleString('en-GB')}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className={priorityColors[deal.priority]}
        >
          {deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="h-4 w-4" />
          <span>{deal.company}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-4 w-4" />
          <span>{deal.contact}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          <span className="text-blue-600">{deal.email}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Updated {formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })}
      </div>
    </div>
  )
}
