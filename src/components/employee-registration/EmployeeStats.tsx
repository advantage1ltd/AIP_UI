import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Building2, CalendarCheck } from "lucide-react"
import { Employee } from "./EmployeesTable"

interface EmployeeStatsProps {
  employees: Employee[]
}

export const EmployeeStats = ({ employees }: EmployeeStatsProps) => {
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.status === "active").length
  const positions = new Set(employees.map(emp => emp.position)).size
  const licenses = new Set(employees.map(emp => emp.licenseType)).size

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-white">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalEmployees}</div>
          <p className="text-xs text-slate-200">Registered employees</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-white">Active Employees</CardTitle>
          <CalendarCheck className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{activeEmployees}</div>
          <p className="text-xs text-emerald-200">Currently active</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-white">Positions</CardTitle>
          <Briefcase className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{positions}</div>
          <p className="text-xs text-amber-200">Unique positions</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-white">License Types</CardTitle>
          <Building2 className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{licenses}</div>
          <p className="text-xs text-blue-200">Different licenses</p>
        </CardContent>
      </Card>
    </div>
  )
}
