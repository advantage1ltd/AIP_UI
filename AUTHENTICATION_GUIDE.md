# Authentication Guide

## 🔑 Token Management

### Frontend Configuration
- **Token Key**: `authToken` (localStorage)
- **Token Format**: JWT Bearer token
- **Storage Method**: `localStorage.setItem('authToken', token)`
- **Retrieval Method**: `localStorage.getItem('authToken')`

### Backend Requirements
- **Header Format**: `Authorization: Bearer {token}`
- **Authentication Scheme**: JWT Bearer tokens
- **Required for**: All protected endpoints (marked with `[Authorize]`)

## 🛡️ Role-Based Access Control

### Employee Management
- **Required Role**: "Administrator"
- **Endpoints**:
  - `POST /api/employee` - Create employee
  - `PUT /api/employee/{id}` - Update employee  
  - `DELETE /api/employee/{id}` - Delete employee
  - `GET /api/employee` - List employees (authenticated)
  - `GET /api/employee/{id}` - Get employee details

### API Interceptor Configuration

```typescript
// AIP_UI/src/config/api.ts
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 🔄 Authentication Flow

1. **Login Process**:
   - User submits credentials to `/api/auth/login`
   - Backend validates and returns JWT token
   - Frontend stores token: `localStorage.setItem('authToken', token)`

2. **API Requests**:
   - Interceptor automatically adds `Authorization: Bearer {token}` header
   - Backend validates token and role permissions
   - Returns data or 401/403 error

3. **Logout Process**:
   - Remove token: `localStorage.removeItem('authToken')`
   - Redirect to login page

4. **Token Expiry**:
   - Backend returns 401 status
   - Frontend automatically logs out user
   - Redirects to login page

## ⚠️ Important Notes

- **Never use test endpoints** in production
- **Always use standard authenticated endpoints** for CRUD operations
- **Token key consistency**: Always use `authToken` (not `auth_token`)
- **Role validation**: Backend enforces role-based access control
- **Error handling**: 401 errors trigger automatic logout

## 🧪 Development Testing

For development testing without full authentication:
1. Obtain valid JWT token from backend
2. Manually set in browser console: `localStorage.setItem('authToken', 'your-jwt-token')`
3. Test CRUD operations through frontend

## 📋 Backend Endpoints Reference

### Employee Management
- `GET /api/employee` - List employees (paginated)
- `GET /api/employee/{id}` - Get employee by ID
- `POST /api/employee` - Register new employee [Admin only]
- `PUT /api/employee/{id}` - Update employee [Admin only]
- `DELETE /api/employee/{id}` - Soft delete employee [Admin only]

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Validation (Unauthenticated)
- `GET /api/employee/validate/employee-number/{number}` - Validate employee number
- `GET /api/employee/validate/email/{email}` - Validate email uniqueness
