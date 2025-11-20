# Incident Loading Fix - MSW Configuration

## ✅ Changes Made

### 1. Fixed API URL Configuration (`src/services/api/incidents.ts`)

**Before:**
```typescript
const API_URL = '/api'  // ❌ Relative path - bypasses MSW
```

**After:**
```typescript
import { BASE_API_URL } from '@/config/api'
const API_URL = BASE_API_URL  // ✅ Uses 'http://localhost:5128/api'
```

**Why:** 
- MSW can only intercept requests to absolute URLs
- Relative paths `/api` go through Vite's dev server
- MSW handlers are registered for `http://localhost:5128/api/incidents`

### 2. MSW Handler Configuration (Already Correct)

```typescript
// In src/mocks/incidentHandlers.ts
http.get(`${BASE_API_URL}/incidents`, async ({ request }) => {
  console.log('🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===')
  // ... handler logic
})
```

### 3. Service Configuration Summary

| Service File | URL Used | Status |
|--------------|----------|--------|
| `services/api/incidents.ts` | `BASE_API_URL` | ✅ Fixed |
| `services/incidentService.ts` | `BASE_API_URL` | ✅ Already correct |
| `services/dashboardService.ts` | `/api/dashboard/officer` | ⚠️ Relative (for dashboard) |

## 🧪 How to Test

### 1. Restart Development Server

**PowerShell:**
```powershell
cd AIP_UI
npm run dev
```

### 2. Clear Browser Cache & Service Workers

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left panel
4. Click **Unregister** on any existing workers
5. Hard refresh: **Ctrl + Shift + R**

### 3. Check Console Logs

You should see in order:
```
🚀 Starting application with MSW for missing backend endpoints...
🔧 [MSW] Starting with XX handlers
✅ [MSW] Started successfully
📋 [MSW] Registered handlers:
   GET http://localhost:5128/api/incidents
   POST http://localhost:5128/api/incidents
   ... (more handlers)
```

### 4. Navigate to Incident Report

When you access the incident report page, you should see:
```
🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===
🔍 Found incidents for customer 21: 14
🔍 [MSW] Final results: { totalIncidents: 14, paginatedCount: 10 }
```

### 5. Verify API Response

In Network tab:
- **Request URL:** `http://localhost:5128/api/incidents?page=1&pageSize=10`
- **Status:** `200 OK`
- **Response Type:** `application/json`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": [...incidents...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "pageSize": 10,
      "totalCount": 14
    }
  }
  ```

## 🔍 Troubleshooting

### Still Getting HTML Response?

**Check 1: Verify MSW is Running**
```javascript
// In browser console:
console.log('Handlers loaded:', window.msw ? 'Yes' : 'No')
```

**Check 2: Test MSW Directly**
```javascript
// In browser console:
fetch('http://localhost:5128/api/incidents/test')
  .then(r => r.json())
  .then(data => console.log('✅ MSW Working:', data))
  .catch(err => console.error('❌ MSW Failed:', err))
```

Expected response:
```json
{
  "success": true,
  "message": "✅ Unified auth system working",
  "authDetails": { "userRole": "Administrator" },
  "dataStats": { "totalIncidents": 100+ }
}
```

**Check 3: Verify localStorage Has User Data**
```javascript
// In browser console:
console.log('User:', localStorage.getItem('user'))
console.log('Role:', localStorage.getItem('userRole'))
console.log('Token:', localStorage.getItem('authToken'))
```

If empty, **login first** before accessing incident reports.

### Service Worker Not Registering?

1. **Check file exists:**
   - URL: `http://localhost:5173/mockServiceWorker.js`
   - Should return JavaScript code, not 404

2. **Manually copy if missing:**
   ```powershell
   # From AIP_UI directory
   npx msw init public/ --save
   ```

3. **Clear all service workers:**
   - DevTools → Application → Service Workers
   - Unregister all
   - Clear site data
   - Hard refresh

### CORS Errors?

MSW should intercept **before** CORS check. If seeing CORS errors:
1. MSW is not intercepting (see above checks)
2. Request is going to real backend (wrong URL)

## 📊 Which Services Use Which Endpoints?

### Using MSW (No Backend Controller)
- ✅ **Incidents** - All CRUD operations
- ✅ **Dashboard** - Officer/Customer dashboards
- ✅ **Site Visits** - Site visit tracking
- ✅ **Holiday Requests** - Leave management
- ✅ **Customer Satisfaction** - Survey data
- ✅ **Mystery Shopper** - Evaluation data
- ✅ **Daily Activities** - Activity logs
- ✅ **Daily Occurrence Book** - Occurrence records

### Using Real Backend (Controllers Exist)
- ✅ **Employees** - `EmployeeController.cs`
- ✅ **Users** - `UserController.cs`
- ✅ **Customers** - `CustomerController.cs`
- ✅ **Regions** - `RegionController.cs`
- ✅ **Sites** - `SiteController.cs`
- ✅ **Stock** - `StockController.cs`
- ✅ **Action Calendar** - `ActionCalendarController.cs`
- ✅ **Authentication** - `AuthController.cs`

## 🎯 Expected Behavior After Fix

1. **Incident Report Page:**
   - ✅ Loads incidents from MSW
   - ✅ Pagination works
   - ✅ Search works
   - ✅ Site filtering works
   - ✅ No HTML/JSON errors

2. **Incident Form:**
   - ✅ Offender search works
   - ✅ Fetches incident history
   - ✅ Auto-fills previous details
   - ✅ Submit creates new incident

3. **Console:**
   - ✅ Clean logs (no errors)
   - ✅ MSW interception logs visible
   - ✅ Proper JSON responses

## 📝 Next Steps (For Backend Migration)

When creating the real Incident Controller:

1. Create `AIP_Backend/Controllers/IncidentController.cs`
2. Implement all CRUD endpoints
3. Test with real backend running
4. Comment out `...incidentHandlers` in `handlers.ts`
5. Verify frontend works with real API

## 🚨 Common Mistakes to Avoid

1. ❌ **Don't use relative paths** in API services
2. ❌ **Don't mix MSW and real backend** for same endpoint
3. ❌ **Don't forget to login** before testing
4. ❌ **Don't skip clearing service workers** when troubleshooting
5. ❌ **Don't use production build** when testing MSW (MSW only in dev)

## ✅ Success Checklist

- [ ] Dev server running
- [ ] Browser console shows MSW started
- [ ] Service worker registered in DevTools
- [ ] User logged in (localStorage has user data)
- [ ] Incident page loads without errors
- [ ] Network tab shows JSON responses
- [ ] No "Unexpected token '<'" errors

