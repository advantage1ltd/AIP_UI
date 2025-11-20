# Testing MSW for Incidents

## Issue
Getting "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error when loading incidents.

## Root Cause Analysis

1. **Two Different Services:**
   - `src/services/api/incidents.ts` - Was using `/api` (relative) ❌ → Fixed to use `BASE_API_URL` ✅
   - `src/services/incidentService.ts` - Already using `BASE_API_URL` ✅

2. **BASE_API_URL Configuration:**
   ```typescript
   export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128/api'
   ```

3. **MSW Handler Pattern:**
   ```typescript
   http.get(`${BASE_API_URL}/incidents`, async ({ request }) => {
     // Handler logic
   })
   ```

## Testing Steps

### 1. Check Browser Console
Open DevTools Console and look for:
- ✅ `🚀 Starting application with MSW for missing backend endpoints...`
- ✅ `✅ [MSW] Started successfully`
- ✅ `📋 [MSW] Registered handlers:`
- ✅ `   GET http://localhost:5128/api/incidents`

### 2. Test Incident Loading
Navigate to incident report page and check console for:
- ✅ `🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===`
- ✅ `🔍 Found incidents for customer X: Y`
- ❌ No "Failed to fetch" or HTML errors

### 3. Network Tab Verification
In DevTools Network tab:
- Request URL: `http://localhost:5128/api/incidents`
- Status: `200 OK`
- Response Type: `application/json`
- Response Preview: Should show `{ success: true, data: [...] }`

### 4. Verify MSW Service Worker
Check Application tab in DevTools:
- Go to Application → Service Workers
- Should see: `mockServiceWorker.js` registered
- Status: `Activated and is running`

## Common Issues

### Issue 1: HTML Response (404)
**Symptom:** Getting HTML instead of JSON
**Cause:** MSW not intercepting the request
**Fix:** 
1. Ensure `public/mockServiceWorker.js` exists
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: CORS Errors
**Symptom:** CORS policy blocking requests
**Cause:** Backend server rejecting requests
**Fix:** MSW should intercept before CORS check - verify MSW is running

### Issue 3: 401 Unauthorized
**Symptom:** Authorization errors
**Cause:** MSW auth check failing
**Fix:** Ensure you're logged in and check localStorage for `user` and `authToken`

## Quick Debug Commands

### Check if MSW is loaded:
```javascript
// In browser console
console.log(window.msw)
```

### Check localStorage:
```javascript
// In browser console
console.log('User:', localStorage.getItem('user'))
console.log('Auth Token:', localStorage.getItem('authToken'))
console.log('User Role:', localStorage.getItem('userRole'))
```

### Test MSW Handler Directly:
```javascript
// In browser console
fetch('http://localhost:5128/api/incidents/test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Expected response:
```json
{
  "success": true,
  "message": "✅ Unified auth system working",
  "authDetails": {
    "userRole": "Administrator",
    "customerId": null,
    "hasGlobalAccess": true
  },
  "dataStats": {
    "totalIncidents": 100+,
    "customerIncidents": 100+
  }
}
```

## If Still Not Working

1. **Clear browser cache completely**
2. **Unregister old service workers:**
   - DevTools → Application → Service Workers
   - Click "Unregister" on all workers
   - Hard refresh

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   cd AIP_UI
   npm run dev
   ```

4. **Check MSW is in package.json:**
   ```bash
   npm list msw
   ```

5. **Verify environment:**
   ```javascript
   console.log('DEV MODE:', import.meta.env.DEV)
   console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
   ```

