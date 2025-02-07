import { Employee } from '@/components/employee-registration/EmployeesTable';

export const mockEmployees: Employee[] = [
  {
    id: "1",
    employeeName: "John Doe",
    position: "Security Officer",
    employeeNumber: "EMP001",
    licenseType: "Door Supervisor",
    startDate: "2024-01-15",
    status: "active"
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    position: "Store Detective",
    employeeNumber: "EMP002",
    licenseType: "CCTV",
    startDate: "2024-02-01",
    status: "active"
  },
  {
    id: "3",
    employeeName: "Mike Johnson",
    position: "Supervisor",
    employeeNumber: "EMP003",
    licenseType: "Security Guarding",
    startDate: "2023-12-01",
    status: "inactive"
  }
];
