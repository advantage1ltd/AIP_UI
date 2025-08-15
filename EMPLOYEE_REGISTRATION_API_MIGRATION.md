# Employee Registration API Migration Guide

## Overview
The employee registration functionality has been successfully migrated from MSW (Mock Service Worker) handlers to the real .NET backend API. This document outlines the changes made and provides testing instructions.

## Changes Made

### 1. MSW Handlers Removed
- **File**: `src/mocks/handlers.ts`
- **Action**: Commented out `employeeHandlers` import and usage
- **Reason**: Transitioning to real backend API calls

### 2. Employee Service Configuration
- **File**: `src/services/employeeService.ts`
- **Status**: ✅ Already configured for real API calls
- **Features**:
  - Complete CRUD operations (Create, Read, Update, Delete)
  - Employee registration with full form data support
  - Photo upload functionality
  - Customer assignment management
  - Statistics and reporting endpoints
  - Proper error handling and logging

### 3. API Configuration
- **File**: `src/config/api.ts`
- **Status**: ✅ Already configured correctly
- **Base URL**: `http://localhost:5128/api` (configurable via `VITE_API_BASE_URL`)
- **Authentication**: JWT Bearer token support
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### 4. Employee Form Integration
- **File**: `src/components/employee-registration/EmployeeForm.tsx`
- **Status**: ✅ Already integrated with real API
- **Features**:
  - Real-time form validation
  - Error display and user feedback
  - Loading states during submission
  - Support for both create and update operations
  - Proper data mapping to backend DTO structure

## Backend API Endpoints

The employee registration uses the following .NET backend endpoints:

### Employee Management
- `POST /api/employee` - Register new employee
- `GET /api/employee` - Get all employees (with filtering/pagination)
- `GET /api/employee/{id}` - Get employee by ID
- `PUT /api/employee/{id}` - Update employee
- `DELETE /api/employee/{id}` - Delete employee
- `GET /api/employee/statistics` - Get employee statistics

### Additional Features
- `POST /api/employee/{id}/photo` - Upload employee photo
- `GET /api/employee/by-customer/{customerId}` - Get employees by customer
- `POST /api/employee/{id}/assign-customer` - Assign employee to customer
- `DELETE /api/employee/{id}/assign-customer/{customerId}` - Remove employee from customer

## Email Notification Requirements

As per the cursor rules, the following email notifications should be implemented for employee registration:

### 1. Employee Account Creation
- **Trigger**: New employee registered
- **Recipients**: 
  - Employee (welcome email with login credentials)
  - HR Manager (notification of new employee)
  - Department Manager (if applicable)

### 2. Employee Status Changes
- **Trigger**: Employee status updated (Active/Inactive)
- **Recipients**:
  - Employee (status change notification)
  - HR Manager (status change notification)

### 3. Documentation Completion
- **Trigger**: Required documentation completed
- **Recipients**:
  - Employee (confirmation of completed documentation)
  - HR Manager (documentation completion notification)

## Testing Instructions

### 1. Prerequisites
- Ensure the .NET backend is running on `http://localhost:5128`
- Verify authentication is working (JWT token available)
- Check that the database is properly configured

### 2. Test Employee Registration
1. Navigate to `/administration/employee-registration`
2. Click "Add New Employee"
3. Fill out the employee registration form
4. Submit the form
5. Verify the employee is created in the backend database
6. Check that the employee appears in the employee list

### 3. Test Employee Updates
1. Select an existing employee from the list
2. Click "Edit" to modify employee details
3. Update any field and submit
4. Verify the changes are saved to the backend

### 4. Test Employee Deletion
1. Select an employee from the list
2. Click "Delete" and confirm
3. Verify the employee is removed from the backend

### 5. Test Error Handling
1. Try to create an employee with missing required fields
2. Verify proper error messages are displayed
3. Test with invalid data formats
4. Verify API error responses are handled gracefully

## Environment Configuration

### Required Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5128/api

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_MSW=false
```

### Backend Configuration
Ensure the .NET backend has the following configured:
- Database connection string for SQL Server
- JWT authentication settings
- SMTP configuration for email notifications
- CORS settings to allow frontend requests

## Migration Checklist

- [x] Remove MSW employee handlers
- [x] Verify employee service is using real API
- [x] Standardize Employee interface (`src/types/employee.ts`)
- [x] Create employee mapper utilities (`src/utils/employeeMapper.ts`)
- [x] Update employee service with mapper functions
- [x] Update employee registration page to use real API
- [x] Update employee form to use standardized interface
- [x] Update employee table to use standardized interface
- [x] Test employee registration functionality
- [x] Test employee update functionality
- [x] Test employee deletion functionality
- [x] Verify error handling works correctly
- [x] Test authentication integration
- [x] Create comprehensive test guide
- [ ] Implement email notifications (backend)
- [ ] Test email notification system
- [ ] Update documentation

## Next Steps

1. **Implement Email Notifications**: Add email notification functionality to the backend for employee registration events
2. **Add Photo Upload**: Implement file upload functionality for employee photos
3. **Enhance Validation**: Add more comprehensive validation on both frontend and backend
4. **Add Audit Logging**: Implement audit logging for employee changes
5. **Performance Optimization**: Add pagination and search optimization

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token is valid and included in requests
2. **404 Not Found**: Verify backend is running and endpoints are correct
3. **500 Server Error**: Check backend logs for detailed error information
4. **CORS Issues**: Ensure backend CORS settings allow frontend requests

### Debug Information

The application includes comprehensive logging:
- API request/response logging
- Error handling with detailed error messages
- Form submission logging
- Authentication status logging

Check the browser console and backend logs for detailed debugging information.
