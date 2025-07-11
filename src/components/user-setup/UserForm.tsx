import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { EmployeeSelect } from "./form/EmployeeSelect"
import { CustomerSelect } from "./form/CustomerSelect"
import { User, UserRole, AdvantageOneUser } from "@/types/user"

interface UserFormProps {
  mode: 'new' | 'edit'
  user?: User
  onSubmit: (data: any) => void
  onCancel: () => void
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

export function UserForm({ mode, user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'AdvantageOneOfficer',
    pageAccessRole: user?.pageAccessRole || 'AdvantageOneOfficer',
    assignedCustomerIds: user?.role === 'AdvantageOneOfficer' || user?.role === 'AdvantageOneHOOfficer' || user?.role === 'Administrator' 
      ? (user as AdvantageOneUser)?.assignedCustomerIds || []
      : [],
  })

  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [assignedCustomers, setAssignedCustomers] = useState<number[]>(
    user?.role === 'AdvantageOneOfficer' || user?.role === 'AdvantageOneHOOfficer' || user?.role === 'Administrator'
      ? (user as AdvantageOneUser)?.assignedCustomerIds || []
      : []
  )
  const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch('/api/customers')
        const result = await response.json()
        
        if (result.success) {
          setAvailableCustomers(
            result.data.map((c: any) => ({
              id: c.id,
              name: c.companyName
            }))
          )
        } else {
          console.error('Failed to fetch customers:', result.message)
          setAvailableCustomers([])
        }
      } catch (error) {
        console.error('Failed to load customers:', error)
        setAvailableCustomers([])
      }
    }
    loadCustomers()

    // Listen for customer events to refresh the list
    const handleCustomerEvent = () => {
      loadCustomers()
    }

    window.addEventListener('customer-created', handleCustomerEvent)
    window.addEventListener('customer-updated', handleCustomerEvent)
    window.addEventListener('customer-deleted', handleCustomerEvent)
    
    return () => {
      window.removeEventListener('customer-created', handleCustomerEvent)
      window.removeEventListener('customer-updated', handleCustomerEvent)
      window.removeEventListener('customer-deleted', handleCustomerEvent)
    }
  }, [])

  // Update formData when assigned customers change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      assignedCustomerIds: assignedCustomers
    }))
  }, [assignedCustomers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form with assigned customers:', assignedCustomers)
    const submitData = {
      ...formData,
      assignedCustomerIds: assignedCustomers
    }
    
    // Log for debugging
    console.log('🔄 [UserForm] Submitting user with assignments:', {
      userId: user?.id,
      username: formData.username,
      role: formData.role,
      assignedCustomerIds: assignedCustomers,
      previousAssignments: user?.role === 'AdvantageOneOfficer' || user?.role === 'AdvantageOneHOOfficer' || user?.role === 'Administrator' 
        ? (user as AdvantageOneUser)?.assignedCustomerIds || []
        : []
    })
    
    onSubmit(submitData)
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {mode === 'new' ? 'Create New User' : 'Edit User'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
              <Input 
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-white/50 border-purple-200 focus:border-purple-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
              <Input 
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-white/50 border-purple-200 focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-white/50 border-purple-200 focus:border-purple-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700">
              Username <span className="text-sm text-gray-500">(Max 20 chars)</span>
            </Label>
            <Input 
              id="username" 
              name="username"
              maxLength={20}
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="bg-white/50 border-purple-200 focus:border-purple-400"
              required
            />
          </div>

          {mode === 'new' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password <span className="text-sm text-gray-500">(Case Sensitive)</span>
              </Label>
              <Input 
                id="password" 
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-white/50 border-purple-200 focus:border-purple-400"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700">User Role</Label>
            <Select 
              value={formData.role}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  role: value as UserRole,
                  pageAccessRole: value as UserRole
                }))
              }}
            >
              <SelectTrigger className="bg-white/50 border-purple-200">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AdvantageOneOfficer">Advantage One Officer</SelectItem>
                <SelectItem value="AdvantageOneHOOfficer">Advantage One HO Officer</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="CustomerSiteManager">Customer-Site Manager</SelectItem>
                <SelectItem value="CustomerHOManager">Customer-Head Office Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'AdvantageOneOfficer' && (
            <CustomerSelect
              availableCustomers={availableCustomers}
              selectedCustomers={selectedCustomers}
              assignedCustomers={assignedCustomers}
              onSelectedChange={setSelectedCustomers}
              onAssignedChange={setAssignedCustomers}
              onAdd={() => {
                const newAssigned = [...new Set([...assignedCustomers, ...selectedCustomers])]
                setAssignedCustomers(newAssigned)
                setSelectedCustomers([])
              }}
              onRemove={() => {
                setAssignedCustomers([])
                setSelectedCustomers([])
              }}
            />
          )}

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