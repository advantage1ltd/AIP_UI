import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MoreVertical, Eye } from "lucide-react"
import { Customer } from "@/data/customers"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface CustomerTableRowProps {
  customer: Customer
  isSelected: boolean
  onSelect: (customerId: string) => void
  onEdit: (customer: Customer) => void
}

export function CustomerTableRow({ 
  customer, 
  isSelected, 
  onSelect, 
  onEdit 
}: CustomerTableRowProps) {
  return (
    <TableRow 
      className={`cursor-pointer text-xs md:text-sm hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-purple-50/80' : ''}`}
      onClick={() => onSelect(customer.id)}
    >
      <TableCell className="py-2 md:py-3 font-medium">{customer.companyName}</TableCell>
      <TableCell className="py-2 md:py-3 hidden sm:table-cell">
        {`${customer.contact.forename} ${customer.contact.surname}`}
      </TableCell>
      <TableCell className="py-2 md:py-3 hidden md:table-cell">
        {`${customer.address.town}, ${customer.address.county}`}
      </TableCell>
      <TableCell className="py-2 md:py-3">
        <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-700'
            : customer.status === 'dormant'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {customer.status}
        </span>
      </TableCell>
      <TableCell className="text-right py-2 md:py-3">
        {/* Desktop Actions */}
        <div className="hidden sm:flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(customer)
            }}
            className="h-7 w-7 md:h-8 md:w-8 hover:bg-purple-100 p-0"
          >
            <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className="h-7 w-7 md:h-8 md:w-8 hover:bg-red-100 p-0"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        
        {/* Mobile Actions */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem 
                className="cursor-pointer text-xs py-1.5"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(customer.id)
                }}
              >
                <Eye className="h-3.5 w-3.5 text-blue-600 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-xs py-1.5"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(customer)
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-purple-600 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-xs text-red-600 py-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}