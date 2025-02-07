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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="space-y-8 p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#324053]">
              Employee Registration
            </h1>
            <p className="text-gray-500">Register and manage employee information</p>
          </div>
        </div>

        <EmployeeStats employees={employees} />

        <Card className="bg-white/70 backdrop-blur-lg border-none shadow-lg">
          <CardContent className="p-6">
            <EmployeesTable
              employees={employees}
              onNewEmployee={handleNewEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
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