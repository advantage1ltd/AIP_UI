import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Customer } from "@/data/customers"

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
      className={`cursor-pointer ${isSelected ? 'bg-purple-50' : ''}`}
      onClick={() => onSelect(customer.id)}
    >
      <TableCell className="font-medium">{customer.companyName}</TableCell>
      <TableCell>{`${customer.contact.forename} ${customer.contact.surname}`}</TableCell>
      <TableCell>{`${customer.address.town}, ${customer.address.county}`}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-700'
            : customer.status === 'dormant'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {customer.status}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(customer)
          }}
          className="hover:bg-purple-100"
        >
          <Pencil className="h-4 w-4 text-purple-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </TableCell>
    </TableRow>
  )
}