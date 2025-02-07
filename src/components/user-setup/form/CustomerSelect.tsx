import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface CustomerSelectProps {
  availableCustomers: string[]
  selectedCustomers: string[]
  assignedCustomers: string[]
  onSelectedChange: (customers: string[]) => void
  onAssignedChange: (customers: string[]) => void
  onAdd: () => void
  onRemove: () => void
}

export function CustomerSelect({
  availableCustomers,
  selectedCustomers,
  assignedCustomers,
  onSelectedChange,
  onAssignedChange,
  onAdd,
  onRemove
}: CustomerSelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-gray-700">Available Customers</Label>
        <select 
          multiple 
          className="w-full h-48 bg-white/50 border border-purple-200 rounded-lg p-2 focus:border-purple-400 focus:ring-purple-400"
          value={selectedCustomers}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            onSelectedChange(values);
          }}
        >
          {availableCustomers.map((customer) => (
            <option key={customer} value={customer} className="py-1">
              {customer}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Assigned Customers</Label>
        <div className="flex flex-col gap-2">
          <select 
            multiple 
            className="w-full h-48 bg-white/50 border border-purple-200 rounded-lg p-2 focus:border-purple-400 focus:ring-purple-400"
            value={assignedCustomers}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              onAssignedChange(values);
            }}
          >
            {assignedCustomers.map((customer) => (
              <option key={customer} value={customer} className="py-1">
                {customer}
              </option>
            ))}
          </select>
          <div className="flex justify-center gap-4">
            <Button 
              type="button" 
              onClick={onAdd}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              Add &gt;&gt;
            </Button>
            <Button 
              type="button" 
              onClick={onRemove}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
            >
              &lt;&lt; Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}