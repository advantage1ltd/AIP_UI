import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { EmployeeForm } from "@/components/employee-registration/EmployeeForm"
import { EmployeesTable, type Employee } from "@/components/employee-registration/EmployeesTable"
import { EmployeeStats } from "@/components/employee-registration/EmployeeStats"
import { useToast } from "@/hooks/use-toast"
import { employeeApi } from "@/api/employee"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmployeeRegistration() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const data = await employeeApi.getEmployees()
      setEmployees(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      })
    }
  }

  const handleNewEmployee = () => {
    setSelectedEmployee(null)
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      await employeeApi.deleteEmployee(employee.id)
      setEmployees(employees.filter(e => e.id !== employee.id))
      toast({
        title: "Success",
        description: `${employee.employeeName} has been deleted`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      if (selectedEmployee) {
        // Update
        const updated = await employeeApi.updateEmployee(selectedEmployee.id, {
          ...data,
          status: data.status || 'active'
        })
        setEmployees(employees.map(e => e.id === updated.id ? updated : e))
        toast({
          title: "Success",
          description: `${updated.employeeName} has been updated`,
        })
      } else {
        // Create
        const created = await employeeApi.createEmployee(data)
        setEmployees([...employees, created])
        toast({
          title: "Success",
          description: `${created.employeeName} has been created`,
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gradient-to-br from-indigo-100/80 via-purple-50/80 to-pink-100/80">
      <div className="container mx-auto px-2 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#324053]">
              Employee Registration
            </h1>
            <p className="text-sm md:text-base text-gray-500">Register and manage employee information</p>
          </div>
        </div>

        {/* Employee Stats - Responsive Grid */}
        <div className="w-full overflow-hidden">
          <EmployeeStats employees={employees} />
        </div>

        {/* Main Content - Responsive Container */}
        <div className="w-full overflow-x-auto rounded-lg">
          <div className="min-w-[320px]">
            <Card className="bg-white/70 backdrop-blur-lg border border-gray-100 shadow-md">
              <CardContent className="p-2 md:p-4 lg:p-6">
                <EmployeesTable
                  employees={employees}
                  onNewEmployee={handleNewEmployee}
                  onEditEmployee={handleEditEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Employee Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">
                {selectedEmployee ? "Edit Employee" : "New Employee"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              initialData={selectedEmployee || undefined}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}