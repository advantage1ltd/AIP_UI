import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Customer } from "@/types/customer"

interface CustomerTableRowProps {
  customer: Customer
  isSelected: boolean
  onSelect: (customerId: string | null) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

export function CustomerTableRow({ 
  customer, 
  isSelected, 
  onSelect, 
  onEdit,
  onDelete 
}: CustomerTableRowProps) {
  return (
    <TableRow 
      className={`cursor-pointer text-xs md:text-sm hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-purple-50/80' : ''}`}
      onClick={() => onSelect(isSelected ? null : customer.id)}
    >
      <TableCell className="py-2 md:py-3 font-medium">{customer.companyName}</TableCell>
      <TableCell className="py-2 md:py-3">{customer.companyNumber}</TableCell>
      <TableCell className="py-2 md:py-3">{customer.vatNumber}</TableCell>
      <TableCell className="py-2 md:py-3">
        <span className={`inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {customer.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="py-2 md:py-3">
        <span className="inline-flex px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-blue-100 text-blue-700">
          {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1).replace(/-/g, ' ')}
        </span>
      </TableCell>
      <TableCell className="py-2 md:py-3 text-right">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(customer)
            }}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit customer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(customer)
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete customer</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
} 