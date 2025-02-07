import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EmployeeSelectProps {
  value: string
  onChange: (value: string) => void
  employeesList: string[]
}

export function EmployeeSelect({ value, onChange, employeesList = [] }: EmployeeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="employeeName" className="text-gray-700">Employee Name</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white/50 border-purple-200 hover:bg-purple-50">
          <SelectValue placeholder="Select employee..." />
        </SelectTrigger>
        <SelectContent>
          {employeesList.map((employee) => (
            <SelectItem key={employee} value={employee}>
              {employee}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}