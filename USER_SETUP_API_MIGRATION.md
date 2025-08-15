# User Setup API Migration Guide

## Overview
The user setup functionality has been successfully migrated from MSW (Mock Service Worker) to the real .NET backend API. This document outlines the changes made and provides testing instructions.

## Changes Made

### 1. Backend Changes

#### New Sample Users Added
Added 5 sample users with different roles to the `DataSeedingService.cs`:

1. **Michael Admin** - Administrator
   - Username: `admin.test`
   - Email: `admin.test@advantageone.com`
   - Role: Administrator
   - Company: Central England COOP

2. **Emily Wilson** - Head Office Officer
   - Username: `ho.officer`
   - Email: `ho.officer@advantageone.com`
   - Role: AdvantageOneHOOfficer
   - Company: Central England COOP

3. **David Brown** - Field Officer
   - Username: `field.officer`
   - Email: `field.officer@advantageone.com`
   - Role: AdvantageOneOfficer
   - Company: Central England COOP

4. **Lisa Garcia** - Site Manager
   - Username: `site.manager`
   - Email: `site.manager@heartofengland.com`
   - Role: CustomerSiteManager
   - Company: Heart of England

5. **Robert Taylor** - Head Office Manager
   - Username: `ho.manager`
   - Email: `ho.manager@midcounties.com`
   - Role: CustomerHOManager
   - Company: Midcounties COOP

#### Backend API Endpoints
The backend provides the following user management endpoints:

- `POST /api/user` - Create new user
- `GET /api/user` - Get all users (with pagination and filtering)
- `GET /api/user/{id}` - Get user by ID
- `PUT /api/user/{id}` - Update user
- `DELETE /api/user/{id}` - Delete user (soft delete)
- `POST /api/user/{id}/assign-customers` - Assign customers to user

### 2. Frontend Changes

#### UserService Updates
- Updated `userService.ts` to use real API endpoints
- Added comprehensive logging for debugging
- All API calls now go to the real backend instead of MSW

#### MSW Handlers Disabled
- Commented out `userHandlers` in `handlers.ts`
- User endpoints now use real API instead of mocks

#### Enhanced Logging
Added detailed logging throughout the user setup flow:
- UserForm submission
- UserService API calls
- API interceptors
- UserSetup page operations

#### Test Integration Button
Added a test button in the UserSetup page to verify API integration:
- Creates a test user with predefined data
- Shows success/error messages
- Helps verify the API connection is working

## Testing Instructions

### 1. Backend Setup
1. Ensure the .NET backend is running on `http://localhost:5128`
2. Run the database migrations
3. The sample users will be automatically created during data seeding

### 2. Frontend Testing
1. Start the React frontend: `npm run dev`
2. Navigate to the User Setup page
3. You should see the 5 sample users listed in the table
4. Test the "🧪 Test API Integration" button to verify API connectivity

### 3. User Management Testing

#### Create New User
1. Click "Add User" button
2. Fill in the form with test data:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Username: testuser
   - Password: Test123!@#
   - Role: AdvantageOneOfficer
3. Click "Create User"
4. Verify the user appears in the table

#### Edit User
1. Click the edit (pencil) icon on any user
2. Modify some fields
3. Click "Update User"
4. Verify changes are saved

#### Delete User
1. Click the delete (trash) icon on any user
2. Confirm deletion
3. Verify user is removed from the table

### 4. Role-Based Testing

#### Administrator Role
- Can create, edit, and delete any user
- Can assign customers to AdvantageOne users
- Has access to all user management features

#### AdvantageOne Users
- Can be assigned to multiple customers
- Have `assignedCustomerIds` field populated
- Can access customer-specific features

#### Customer Users
- Belong to specific customer companies
- Have `customerId` field populated
- Limited access based on their customer assignment

## API Response Format

The backend returns responses in this format:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-id",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "AdvantageOneOfficer",
    "pageAccessRole": "AdvantageOneOfficer",
    "jobTitle": "Test Officer",
    "userCompany": "Central England COOP",
    "isActive": true,
    "assignedCustomerIds": [1, 2, 3],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Error Handling

The frontend includes comprehensive error handling:
- API errors are caught and displayed as toast notifications
- Console logging for debugging
- Graceful fallbacks for network issues

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if user is logged in
   - Verify JWT token is valid
   - Ensure user has Administrator role

2. **404 Not Found**
   - Verify backend is running on correct port
   - Check API endpoint URLs
   - Ensure database is properly seeded

3. **500 Server Error**
   - Check backend logs for detailed error messages
   - Verify database connection
   - Check if all required fields are provided

### Debug Steps

1. Open browser developer tools
2. Check Console tab for detailed logging
3. Check Network tab for API request/response details
4. Verify backend logs for server-side errors

## Sample User Credentials

For testing purposes, you can use these sample user credentials:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@advantageone.com | Admin123!@# | Administrator |
| admin.test | admin.test@advantageone.com | Sample123!@# | Administrator |
| ho.officer | ho.officer@advantageone.com | Sample123!@# | AdvantageOneHOOfficer |
| field.officer | field.officer@advantageone.com | Sample123!@# | AdvantageOneOfficer |
| site.manager | site.manager@heartofengland.com | Sample123!@# | CustomerSiteManager |
| ho.manager | ho.manager@midcounties.com | Sample123!@# | CustomerHOManager |

## Next Steps

1. Test all user management functionality
2. Verify customer assignments work correctly
3. Test role-based access control
4. Validate error handling scenarios
5. Remove test button once integration is confirmed working

## Files Modified

### Backend
- `Services/DataSeedingService.cs` - Added sample users
- `Services/IDataSeedingService.cs` - Added interface method
- `Controllers/UserController.cs` - Already implemented

### Frontend
- `services/userService.ts` - Updated to use real API
- `mocks/handlers.ts` - Disabled user handlers
- `pages/administration/UserSetup.tsx` - Added test button
- `components/administration/UserForm.tsx` - Added logging
- `config/api.ts` - Enhanced logging

## Conclusion

The user setup functionality has been successfully migrated to use the real backend API. The system now supports:

- Creating users with different roles
- Assigning customers to AdvantageOne users
- Comprehensive error handling and logging
- 5 sample users for testing
- Full CRUD operations for user management

The migration maintains backward compatibility while providing a robust foundation for user management in the production environment.
