# Employee Registration Integration Test Guide

## Overview
This document provides a comprehensive testing guide for the employee registration functionality that has been migrated from MSW handlers to the real .NET backend API.

## Prerequisites

### Backend Requirements
- ✅ .NET backend running on `http://localhost:5128`
- ✅ SQL Server database connected and running
- ✅ Authentication system working (JWT tokens)
- ✅ Employee controller endpoints available
- ✅ Test data seeded (John Officer, Sarah Manager)

### Frontend Requirements
- ✅ Employee interface standardized (`src/types/employee.ts`)
- ✅ Employee service updated with mapper utilities
- ✅ Employee form using real API calls
- ✅ MSW handlers removed for employee functionality

## Test Scenarios

### 1. **Database Connection Test**

**Objective**: Verify backend can connect to database and retrieve existing employees

**Steps**:
1. Start the .NET backend application
2. Navigate to `http://localhost:5128/api/employee` in browser or Postman
3. Verify response contains seeded employees:
   - John Officer (officer@advantageone.com)
   - Sarah Manager (manager@customer.com)

**Expected Result**: 
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "id": 1,
        "employeeNumber": "...",
        "firstName": "John",
        "surname": "Officer",
        "position": "Security Officer",
        "employeeStatus": "Active",
        "employmentType": "Full Time"
      }
    ]
  }
}
```

### 2. **Frontend Employee List Test**

**Objective**: Verify frontend can fetch and display employees from real backend

**Steps**:
1. Start the frontend application
2. Navigate to `/administration/employee-registration`
3. Check browser console for API logs
4. Verify employee table displays seeded employees

**Expected Result**:
- Employee table shows John Officer and Sarah Manager
- Console shows successful API calls to `/api/employee`
- No MSW handler logs for employee endpoints

### 3. **Employee Registration Test**

**Objective**: Verify new employee can be created through frontend form

**Steps**:
1. Click "Add New Employee" button
2. Fill out the employee registration form with test data:
   - **Basic Info**: Title: Mr, First Name: Test, Surname: Employee
   - **Employment**: Position: Security Officer, Status: Active, Type: Full Time
   - **Address**: Complete address information
   - **Personal**: Nationality: British, Right to Work: British Citizen
   - **Driving**: License Type: Full UK Licence
3. Submit the form
4. Check browser console for API logs
5. Verify employee appears in the list

**Expected Result**:
- Form submission successful
- Console shows POST request to `/api/employee`
- New employee appears in the table
- Success toast notification displayed

### 4. **Employee Update Test**

**Objective**: Verify existing employee can be updated through frontend form

**Steps**:
1. Click "Edit" on an existing employee
2. Modify any field (e.g., change position to "Senior Security Officer")
3. Submit the form
4. Check browser console for API logs
5. Verify changes are saved

**Expected Result**:
- Form loads with existing employee data
- Console shows PUT request to `/api/employee/{id}`
- Employee data updated in the table
- Success toast notification displayed

### 5. **Employee Deletion Test**

**Objective**: Verify employee can be deleted through frontend

**Steps**:
1. Click "Delete" on an employee
2. Confirm deletion
3. Check browser console for API logs
4. Verify employee removed from list

**Expected Result**:
- Console shows DELETE request to `/api/employee/{id}`
- Employee removed from table
- Success toast notification displayed

### 6. **Field Mapping Test**

**Objective**: Verify proper field mapping between frontend and backend

**Steps**:
1. Create a new employee with all fields populated
2. Check browser network tab for request payload
3. Verify field names use PascalCase (backend format)
4. Check backend logs for received data

**Expected Result**:
- Request payload uses PascalCase: `FirstName`, `Surname`, `EmployeeNumber`
- Backend receives data in correct format
- All fields properly mapped and saved

### 7. **Error Handling Test**

**Objective**: Verify proper error handling for API failures

**Steps**:
1. Stop the backend server
2. Try to create a new employee
3. Check error handling and user feedback

**Expected Result**:
- Proper error message displayed
- User-friendly error toast notification
- Form remains in valid state

### 8. **Validation Test**

**Objective**: Verify form validation works correctly

**Steps**:
1. Try to submit form with missing required fields
2. Check validation messages
3. Verify backend validation errors are handled

**Expected Result**:
- Frontend validation prevents submission
- Backend validation errors displayed properly
- Form highlights required fields

## API Endpoint Verification

### Required Endpoints
- ✅ `POST /api/employee` - Create employee
- ✅ `GET /api/employee` - List employees
- ✅ `GET /api/employee/{id}` - Get employee by ID
- ✅ `PUT /api/employee/{id}` - Update employee
- ✅ `DELETE /api/employee/{id}` - Delete employee
- ✅ `GET /api/employee/statistics` - Get employee statistics

### Authentication
- ✅ JWT Bearer token required
- ✅ Proper authorization headers sent
- ✅ Unauthorized requests handled

## Data Flow Verification

### Frontend to Backend
1. **Form Data** → `Employee` interface (camelCase)
2. **Mapper Utility** → `EmployeeRegistrationRequest` (PascalCase)
3. **API Service** → HTTP request to backend
4. **Backend** → Database save

### Backend to Frontend
1. **Database** → `Employee` model
2. **Backend** → `EmployeeDetailResponse` DTO
3. **API Service** → HTTP response
4. **Mapper Utility** → `Employee` interface (camelCase)
5. **Component** → Display in UI

## Performance Testing

### Load Test
- Test with 100+ employees in database
- Verify pagination works correctly
- Check response times

### Memory Test
- Monitor memory usage during operations
- Verify no memory leaks in mapper utilities

## Security Testing

### Authentication
- Test with invalid/expired tokens
- Verify proper 401 responses
- Check token refresh handling

### Authorization
- Test role-based access control
- Verify only authorized users can access employee data

## Browser Compatibility

### Test Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Testing
- ✅ Responsive design on mobile devices
- ✅ Touch interactions work correctly
- ✅ Form validation on mobile

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend URL is allowed

2. **Authentication Errors**
   - Check JWT token validity
   - Verify token is included in requests

3. **Field Mapping Errors**
   - Check mapper utility functions
   - Verify field name casing

4. **Database Connection Errors**
   - Check SQL Server connection string
   - Verify database is running

### Debug Information

**Frontend Logs**:
- Check browser console for API request/response logs
- Look for mapper utility logs
- Monitor network tab for HTTP requests

**Backend Logs**:
- Check .NET application logs
- Monitor database connection logs
- Verify controller method execution

## Success Criteria

✅ **All test scenarios pass**
✅ **No MSW handlers used for employee functionality**
✅ **Real API calls working end-to-end**
✅ **Proper error handling implemented**
✅ **Field mapping working correctly**
✅ **Performance acceptable**
✅ **Security requirements met**

## Next Steps

After successful testing:
1. **Remove remaining MSW handlers** for other features
2. **Implement email notifications** for employee events
3. **Add comprehensive logging** for production monitoring
4. **Performance optimization** if needed
5. **Security hardening** for production deployment
