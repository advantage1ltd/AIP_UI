import { Employee } from '@/components/employee-registration/EmployeesTable';
import { mockEmployees } from './mockData';

// Simulating API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateEmployeeDto {
  employeeName: string;
  position: string;
  employeeNumber: string;
  licenseType: string;
  startDate: string;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {
  status: 'active' | 'inactive';
}

// In-memory store
let employees = [...mockEmployees];

export const employeeApi = {
  // Create a new employee
  createEmployee: async (employee: CreateEmployeeDto): Promise<Employee> => {
    await delay(500); // Simulate network delay
    const newEmployee: Employee = {
      ...employee,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active'
    };
    employees.push(newEmployee);
    return newEmployee;
  },

  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    await delay(500);
    return [...employees];
  },

  // Update an employee
  updateEmployee: async (id: string, employee: UpdateEmployeeDto): Promise<Employee> => {
    await delay(500);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }
    const updatedEmployee = { ...employee, id };
    employees[index] = updatedEmployee;
    return updatedEmployee;
  },

  // Delete an employee
  deleteEmployee: async (id: string): Promise<void> => {
    await delay(500);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }
    employees = employees.filter(e => e.id !== id);
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<Employee> => {
    await delay(500);
    const employee = employees.find(e => e.id === id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }
};
