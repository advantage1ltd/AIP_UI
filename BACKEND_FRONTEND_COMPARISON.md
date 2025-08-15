# Backend vs Frontend Employee Structure Comparison

## Overview
This document compares the backend .NET Employee model with the frontend TypeScript interfaces to identify any mismatches and ensure proper API integration.

## Backend Structure (.NET)

### Employee Model (`AIP_Backend/Models/Employee.cs`)
```csharp
public class Employee
{
    // Primary Key
    public int EmployeeId { get; set; }
    
    // Required Fields
    public string EmployeeNumber { get; set; }
    public string Title { get; set; }
    public string FirstName { get; set; }
    public string Surname { get; set; }
    public DateTime StartDate { get; set; }
    public string Position { get; set; }
    public string EmployeeStatus { get; set; }
    public string EmploymentType { get; set; }
    
    // Optional Fields
    public string AipAccessLevel { get; set; }
    public string Department { get; set; }
    public string Region { get; set; }
    public string Email { get; set; }
    public string ContactNumber { get; set; }
    
    // Address Information
    public string HouseName { get; set; }
    public string NumberAndStreet { get; set; }
    public string Town { get; set; }
    public string County { get; set; }
    public string PostCode { get; set; }
    
    // SIA License Information
    public string SiaLicenceType { get; set; }
    public DateTime? SiaLicenceExpiry { get; set; }
    public string SiaLicenceNumber { get; set; }
    
    // Personal Information
    public string Nationality { get; set; }
    public string RightToWorkCondition { get; set; }
    
    // Driving License Information
    public string DrivingLicenceType { get; set; }
    public DateTime? DateDLChecked { get; set; }
    public bool DrivingLicenceCopyTaken { get; set; }
    public bool SixMonthlyCheck { get; set; }
    
    // Checks and References
    public bool GraydonCheckAuthorised { get; set; }
    public string GraydonCheckDetails { get; set; }
    public bool InitialOralReferencesComplete { get; set; }
    public DateTime? InitialOralReferencesDate { get; set; }
    public bool WrittenRefsComplete { get; set; }
    public DateTime? WrittenRefsCompleteDate { get; set; }
    public bool QuickStarterFormCompleted { get; set; }
    
    // Employment Documentation Status
    public string WorkingTimeDirective { get; set; }
    public bool WorkingTimeDirectiveComplete { get; set; }
    public bool ContractOfEmploymentSigned { get; set; }
    public bool PhotoTaken { get; set; }
    public string PhotoFile { get; set; }
    public bool IdCardIssued { get; set; }
    public bool EquipmentIssued { get; set; }
    public bool UniformIssued { get; set; }
    public bool NextOfKinDetailsComplete { get; set; }
    public string PeopleHoursPin { get; set; }
    
    // Training and Induction
    public string FullRotasIssued { get; set; }
    public string InductionAndTrainingBooked { get; set; }
    public string Location { get; set; }
    public string Trainer { get; set; }
    
    // Relationships
    public string UserId { get; set; }
    public int? SupervisorId { get; set; }
    
    // Audit Fields
    public bool RecordIsDeletedYN { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string UpdatedBy { get; set; }
    
    // Computed Properties
    public string FullName { get; set; }
    public bool IsSiaLicenceExpired { get; set; }
    public bool IsSiaLicenceExpiringSoon { get; set; }
}
```

## Frontend Structure (TypeScript)

### Employee Interface (`src/types/employee.ts`) - SIMPLIFIED VERSION
```typescript
export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  employmentType: 'full-time' | 'part-time' | 'contract';
  supervisor?: string;
  email: string;
  contactNumber?: string;
}
```

### Employee Interface (`src/components/employee-registration/EmployeesTable.tsx`) - COMPREHENSIVE VERSION
```typescript
export interface Employee {
  id: number
  firstName: string
  surname: string
  position: string
  employeeNumber: string
  siaLicenceType?: string
  startDate: string
  status?: 'active' | 'inactive'
  
  // Basic Information
  aipAccessLevel?: string
  title?: string
  
  // Address Information
  houseName?: string
  numberAndStreet?: string
  town?: string
  county?: string
  postCode?: string
  region?: string
  
  // Employment Information
  employeeStatus?: string
  employmentType?: string
  department?: string
  
  // Contact Information
  email?: string
  contactNumber?: string
  
  // SIA Information
  siaLicenceExpiry?: string
  siaLicenceNumber?: string
  
  // Personal Information
  nationality?: string
  rightToWorkCondition?: string
  
  // Driving License Information
  drivingLicenceType?: string
  dateDLChecked?: string
  drivingLicenceCopyTaken?: boolean
  sixMonthlyCheck?: boolean
  
  // Checks and References
  graydonCheckAuthorised?: boolean
  graydonCheckDetails?: string
  initialOralReferencesComplete?: boolean
  initialOralReferencesDate?: string
  writtenRefsComplete?: boolean
  writtenRefsCompleteDate?: string
  quickStarterFormCompleted?: boolean
  
  // Employment Documentation
  workingTimeDirective?: string
  workingTimeDirectiveComplete?: boolean
  contractOfEmploymentSigned?: boolean
  photoTaken?: boolean
  photoFile?: string
  idCardIssued?: boolean
  equipmentIssued?: boolean
  uniformIssued?: boolean
  nextOfKinDetailsComplete?: boolean
  peopleHoursPin?: string
  
  // Training and Induction
  fullRotasIssued?: string
  inductionAndTrainingBooked?: string
  location?: string
  trainer?: string
  
  // Relationships
  userId?: string
  supervisorId?: number
  supervisorName?: string
  
  // Audit Fields
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}
```

## Key Differences and Issues

### 1. **Primary Key Mismatch**
- **Backend**: `EmployeeId` (int)
- **Frontend**: `id` (string in some places, number in others)

### 2. **Field Name Inconsistencies**
- **Backend**: `SiaLicenceType`, `SiaLicenceExpiry`, `SiaLicenceNumber`
- **Frontend**: `siaLicenceType`, `siaLicenceExpiry`, `siaLicenceNumber`

### 3. **Missing Fields in Frontend**
The simplified `src/types/employee.ts` is missing many fields that exist in the backend:
- All SIA license fields
- All address fields
- All documentation status fields
- All training and induction fields
- All audit fields

### 4. **Data Type Mismatches**
- **Backend**: `DateTime` for dates
- **Frontend**: `string` for dates (ISO format)

### 5. **Status Field Differences**
- **Backend**: `EmployeeStatus` (string)
- **Frontend**: `status` (union type: 'active' | 'inactive' | 'terminated')

## Backend API Endpoints Available

### Employee Controller (`AIP_Backend/Controllers/EmployeeController.cs`)
- `POST /api/employee` - Register new employee
- `GET /api/employee/{id}` - Get employee by ID
- `GET /api/employee` - Get all employees
- `PUT /api/employee/{id}` - Update employee
- `DELETE /api/employee/{id}` - Delete employee
- `GET /api/employee/statistics` - Get employee statistics

## Existing Database Records

### Seeded Test Employees
Based on `DataSeedingService.cs`, the following test employees are created:

1. **John Officer**
   - Email: officer@advantageone.com
   - Position: Security Officer
   - Status: Active
   - Employment Type: Full Time
   - Department: Security
   - Region: Central

2. **Sarah Manager**
   - Email: manager@customer.com
   - Position: Site Manager
   - Status: Active
   - Employment Type: Full Time
   - Department: Management
   - Region: North

## Recommendations

### 1. **Standardize Frontend Types**
Update `src/types/employee.ts` to match the comprehensive structure used in `EmployeesTable.tsx`:

```typescript
export interface Employee {
  id: number
  employeeNumber: string
  title: string
  firstName: string
  surname: string
  startDate: string
  position: string
  employeeStatus: string
  employmentType: string
  
  // All other fields matching backend structure...
}
```

### 2. **Update API Service**
Ensure `employeeService.ts` uses the correct field names and data types that match the backend DTOs.

### 3. **Fix Field Name Casing**
Update frontend to use PascalCase for API requests to match backend expectations:
- `firstName` → `FirstName`
- `surname` → `Surname`
- `employeeNumber` → `EmployeeNumber`

### 4. **Add Missing Fields**
Ensure all backend fields are represented in frontend interfaces and forms.

### 5. **Test API Integration**
Verify that the employee registration form sends data in the correct format expected by the backend.

## Current Status

✅ **Backend**: Fully implemented with comprehensive Employee model
✅ **API Endpoints**: All CRUD operations available
✅ **Database**: Test employees seeded
⚠️ **Frontend**: Multiple interface definitions with inconsistencies
⚠️ **API Integration**: Field name mismatches need resolution

## Next Steps

1. **Standardize Employee Interface**: Update `src/types/employee.ts` to match backend structure
2. **Fix API Service**: Ensure proper field mapping between frontend and backend
3. **Update Forms**: Ensure all form fields match backend expectations
4. **Test Integration**: Verify employee registration works end-to-end
5. **Add Validation**: Implement proper validation on both frontend and backend
