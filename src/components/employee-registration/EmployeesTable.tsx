/**
 * Employee roster table with actions.
 * Flow: client search/pagination → row actions delegate create/edit/delete to parent page.
 */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { TableActions } from "./TableActions"
import { TablePagination } from "./TablePagination"
import { Employee } from "@/types/employee"

interface EmployeesTableProps {
  employees?: Employee[]
  onNewEmployee: () => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (employee: Employee) => void
}

// === Component ===
export function EmployeesTable({ employees, onNewEmployee, onEditEmployee, onDeleteEmployee }: EmployeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  const employeesArray = employees || []
  const filteredEmployees = employeesArray.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.surname || ''}`.toLowerCase()
    const employeeNumber = (employee.employeeNumber || '').toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    
    return fullName.includes(searchLower) || employeeNumber.includes(searchLower)
  })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

  // Function to determine which columns to hide on different screen sizes
  const getResponsiveClasses = (column: string) => {
    switch (column) {
      case 'siaLicenceType':
        return 'hidden lg:table-cell'
      case 'startDate':
        return 'hidden md:table-cell'
      case 'position':
        return 'hidden md:table-cell'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2 md:space-y-4">
      <TableActions 
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query)
          setCurrentPage(1)
        }}
        onNewEmployee={onNewEmployee}
      />

      <div className="rounded-lg border bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="space-y-2 p-2 sm:hidden">
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((employee, index) => (
              <div key={`mobile-${employee.id || index}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{`${employee.firstName || ''} ${employee.surname || ''}`}</p>
                    <p className="mt-0.5 text-xs text-slate-500">No: {employee.employeeNumber || '-'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    employee.employeeStatus === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.employeeStatus}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Position</p>
                    <p className="truncate font-medium text-slate-700">{employee.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Start Date</p>
                    <p className="truncate font-medium text-slate-700">
                      {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditEmployee(employee)}
                    className="h-7 w-7 p-0 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteEmployee(employee)}
                    className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-muted-foreground">
              No employees found.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm font-medium">Employee Name</TableHead>
                <TableHead className="text-xs md:text-sm font-medium">Employee No.</TableHead>
                <TableHead className={`text-xs md:text-sm font-medium ${getResponsiveClasses('position')}`}>Position</TableHead>
                <TableHead className={`text-xs md:text-sm font-medium ${getResponsiveClasses('siaLicenceType')}`}>SIA Licence Type</TableHead>
                <TableHead className={`text-xs md:text-sm font-medium ${getResponsiveClasses('startDate')}`}>Start Date</TableHead>
                <TableHead className="text-xs md:text-sm font-medium">Status</TableHead>
                <TableHead className="text-right text-xs md:text-sm font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee, index) => (
                  <TableRow key={employee.id || `employee-${index}`} className="hover:bg-purple-50/50 text-xs md:text-sm">
                    <TableCell className="font-medium py-2 md:py-3">{`${employee.firstName || ''} ${employee.surname || ''}`}</TableCell>
                    <TableCell className="py-2 md:py-3">{employee.employeeNumber}</TableCell>
                    <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('position')}`}>{employee.position}</TableCell>
                    <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('siaLicenceType')}`}>
                      {employee.siaLicenceType || '-'}
                    </TableCell>
                    <TableCell className={`py-2 md:py-3 ${getResponsiveClasses('startDate')}`}>
                      {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell className="py-2 md:py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.employeeStatus === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.employeeStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-2 md:py-3">
                      <div className="flex justify-end items-center gap-1 md:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditEmployee(employee)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-purple-100"
                        >
                          <Pencil className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteEmployee(employee)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredEmployees.length}
        startIndex={startIndex}
      />
    </div>
  )
}
