import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { EmployeeSelect } from "./form/EmployeeSelect"
import { CustomerSelect } from "./form/CustomerSelect"

interface UserFormProps {
  mode: 'new' | 'edit'
  user?: User
  onCancel: () => void
}

export interface User {
  id: string
  employeeName: string
  userName: string
  role: string
  email: string
  jobTitle: string
  isDeleted: boolean
}

// Mock employee data
const employeesList = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Jessica Taylor",
  "James Anderson",
  "Lisa Martinez",
  "Robert Thomas",
  "Jennifer Garcia"
]

const availableCustomers = [
  "Midcounties Co-Operative",
  "Central England Co-Operative",
  "Gloucester Charities Trust",
  "YMCA",
  "FM Security",
  "Lloyds Pharmacy",
  "The Hospital Company",
  "AAH Pharmaceuticals",
  "Heart of England Cooperative",
  "Eastbrook Tewksbury"
]

export function UserForm({ mode, user, onCancel }: UserFormProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>([])
  const [employeeValue, setEmployeeValue] = useState(user?.employeeName || "")

  const handleAddCustomer = () => {
    if (selectedCustomers.length > 0) {
      setAssignedCustomers([...assignedCustomers, ...selectedCustomers])
      setSelectedCustomers([])
    }
  }

  const handleRemoveCustomer = () => {
    if (assignedCustomers.length > 0) {
      setAssignedCustomers([])
    }
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {mode === 'new' ? 'Create New User' : 'Edit User'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg">
            <Checkbox id="recordDeleted" className="border-purple-400" />
            <Label htmlFor="recordDeleted" className="text-purple-700 font-medium">
              Record Is Deleted?
            </Label>
          </div>

          <EmployeeSelect
            value={employeeValue}
            onChange={setEmployeeValue}
            employeesList={employeesList}
          />

          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="text-gray-700">Job Title</Label>
            <Input 
              id="jobTitle" 
              placeholder="Enter job title"
              defaultValue={user?.jobTitle}
              className="bg-white/50 border-purple-200 focus:border-purple-400" 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Enter email address"
                defaultValue={user?.email}
                className="bg-white/50 border-purple-200 focus:border-purple-400" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName" className="text-gray-700">
              User Name <span className="text-sm text-gray-500">(Max 20 chars)</span>
            </Label>
            <Input 
              id="userName" 
              maxLength={20}
              defaultValue={user?.userName}
              className="bg-white/50 border-purple-200 focus:border-purple-400" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password <span className="text-sm text-gray-500">(Case Sensitive)</span>
            </Label>
            <Input 
              id="password" 
              type="password"
              className="bg-white/50 border-purple-200 focus:border-purple-400" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700">User Status</Label>
            <Select defaultValue={user?.role}>
              <SelectTrigger className="bg-white/50 border-purple-200">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advantage-officer">Advantage One Officer</SelectItem>
                <SelectItem value="advantage-editor">Advantage One HO Editor</SelectItem>
                <SelectItem value="advantage-manager">Advantage One HO Manager</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="customer-site-manager">Customer-Site Manager</SelectItem>
                <SelectItem value="customer-ho-manager">Customer-Head Office Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CustomerSelect
            availableCustomers={availableCustomers}
            selectedCustomers={selectedCustomers}
            assignedCustomers={assignedCustomers}
            onSelectedChange={setSelectedCustomers}
            onAssignedChange={setAssignedCustomers}
            onAdd={handleAddCustomer}
            onRemove={handleRemoveCustomer}
          />

          <div className="flex justify-center gap-4 pt-6">
            <Button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {mode === 'new' ? 'Add as New User' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-purple-200 hover:bg-purple-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}