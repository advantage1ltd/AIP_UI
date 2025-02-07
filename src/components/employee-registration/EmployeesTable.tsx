import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { TableActions } from "./TableActions"
import { TablePagination } from "./TablePagination"

export interface Employee {
  id: string
  employeeName: string
  position: string
  employeeNumber: string
  licenseType: string
  startDate: string
  status: 'active' | 'inactive'
}

interface EmployeesTableProps {
  employees: Employee[]
  onNewEmployee: () => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (employee: Employee) => void
}

export function EmployeesTable({ employees, onNewEmployee, onEditEmployee, onDeleteEmployee }: EmployeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 15

  const filteredEmployees = employees.filter(employee => 
    employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      <TableActions 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewEmployee={onNewEmployee}
      />

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Employee Name</TableHead>
              <TableHead className="font-semibold">Employee Number</TableHead>
              <TableHead className="font-semibold">Position</TableHead>
              <TableHead className="font-semibold">License Type</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-purple-50/50">
                <TableCell className="font-medium">{employee.employeeName}</TableCell>
                <TableCell>{employee.employeeNumber}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.licenseType}</TableCell>
                <TableCell>{employee.startDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditEmployee(employee)}
                    className="hover:bg-purple-100"
                  >
                    <Pencil className="h-4 w-4 text-purple-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteEmployee(employee)}
                    className="hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}