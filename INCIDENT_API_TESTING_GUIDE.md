# Incident API Testing Guide

## ✅ Changes Made

### 1. Removed MSW Handlers
- **File:** `src/mocks/handlers.ts`
- **Change:** Commented out `incidentHandlers` import and removed from handlers array
- **Result:** Frontend now uses real backend API instead of MSW mocks

### 2. Updated API Service
- **File:** `src/services/api/incidents.ts`
- **Changes:**
  - Added authentication token to headers (`Authorization: Bearer {token}`)
  - Improved error handling with detailed error messages
  - Added proper status code handling (404 for not found)

### 3. API Configuration
- **Backend URL:** `http://localhost:5128/api` (matches backend port)
- **Authentication:** JWT Bearer token from `localStorage.getItem('authToken')`
- **Response Format:** camelCase (configured in backend `Program.cs`)

## 🧪 Testing Checklist

### Prerequisites
1. ✅ Backend is running on `http://localhost:5128`
2. ✅ Database has `Incidents` and `StolenItems` tables
3. ✅ User is logged in (has valid auth token)
4. ✅ Frontend is running and MSW is disabled for incidents

### Test 1: Read Operations (GET)

#### 1.1 Get All Incidents (Paginated)
**Steps:**
1. Navigate to Incident Report page
2. Check browser console for API calls
3. Verify incidents load from database

**Expected Results:**
- ✅ Incidents list displays
- ✅ Pagination controls work
- ✅ Search functionality works
- ✅ No MSW console logs
- ✅ Network tab shows request to `http://localhost:5128/api/incidents`

**Check:**
- Response has `data` array and `pagination` object
- All incident fields are displayed correctly

#### 1.2 Get Single Incident
**Steps:**
1. Click "View" on any incident
2. Verify incident details display

**Expected Results:**
- ✅ All incident fields are visible
- ✅ Stolen items display correctly
- ✅ Offender information displays (if present)
- ✅ Police involvement details show

### Test 2: Create Operation (POST)

#### 2.1 Create New Incident
**Steps:**
1. Click "New Incident" button
2. Fill in all required fields:
   - Customer Name
   - Site Name
   - Officer Name
   - Officer Role
   - Date of Incident
   - Time of Incident
   - Incident Type
   - Description
   - Duty Manager Name
3. Add stolen items (optional)
4. Add offender information (optional)
5. Click "Save"

**Expected Results:**
- ✅ Success toast message appears
- ✅ Incident appears in the list
- ✅ Incident is saved to database
- ✅ All fields are persisted correctly

**Field Verification:**
- [ ] Customer ID
- [ ] Site Name
- [ ] Officer Name
- [ ] Date/Time of Incident
- [ ] Incident Type
- [ ] Description
- [ ] Stolen Items (if added)
- [ ] Offender Details (if added)
- [ ] Police Involvement (if checked)
- [ ] Status and Priority

#### 2.2 Create with Stolen Items
**Steps:**
1. Create new incident
2. Add multiple stolen items with:
   - Category
   - Product Name
   - Description
   - Cost
   - Quantity
3. Save

**Expected Results:**
- ✅ All stolen items are saved
- ✅ Total amount is calculated correctly
- ✅ Items display in view mode

### Test 3: Update Operation (PUT)

#### 3.1 Update Existing Incident
**Steps:**
1. Click "Edit" on an existing incident
2. Modify fields:
   - Change description
   - Update status
   - Modify stolen items
3. Save

**Expected Results:**
- ✅ Success message appears
- ✅ Changes are reflected in the list
- ✅ Database is updated
- ✅ All modified fields persist

#### 3.2 Update Stolen Items
**Steps:**
1. Edit incident with stolen items
2. Add/remove/modify items
3. Save

**Expected Results:**
- ✅ Items are updated correctly
- ✅ Total value recalculates
- ✅ Old items are removed, new ones added

### Test 4: Delete Operation (DELETE)

#### 4.1 Delete Incident
**Steps:**
1. Click "Delete" on an incident
2. Confirm deletion

**Expected Results:**
- ✅ Success message appears
- ✅ Incident is removed from list
- ✅ Incident is soft-deleted in database (`RecordIsDeletedYN = true`)
- ✅ Related stolen items are also deleted

### Test 5: Field Validation

#### 5.1 Required Fields
**Test:** Try to save without required fields
**Expected:** Validation errors appear

#### 5.2 Date Fields
**Test:** Verify date formatting and timezone handling
**Expected:** Dates display correctly

#### 5.3 Numeric Fields
**Test:** Enter invalid numbers in cost/quantity fields
**Expected:** Validation prevents invalid input

#### 5.4 JSON Arrays
**Test:** Verify `incidentInvolved`, `witnessStatements`, `involvedParties`
**Expected:** Arrays are serialized/deserialized correctly

### Test 6: Search and Filtering

#### 6.1 Search Functionality
**Steps:**
1. Enter search term
2. Verify results filter

**Expected:**
- ✅ Searches across site name, officer name, description
- ✅ Results update in real-time

#### 6.2 Filter by Customer
**Steps:**
1. Filter by customer ID
2. Verify only that customer's incidents show

**Expected:**
- ✅ Filtering works correctly
- ✅ Pagination respects filter

## 🔍 Debugging Tips

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "incidents"
3. Check:
   - Request URL: Should be `http://localhost:5128/api/incidents`
   - Request Headers: Should include `Authorization: Bearer {token}`
   - Response Status: Should be 200 for success
   - Response Body: Should have `data` and `pagination` properties

### Check Console Logs
- ✅ No MSW logs (like `🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===`)
- ✅ API errors show detailed messages
- ✅ No CORS errors

### Common Issues

#### Issue 1: 401 Unauthorized
**Cause:** Missing or invalid auth token
**Fix:** 
- Check if user is logged in
- Verify token in localStorage: `localStorage.getItem('authToken')`
- Re-login if needed

#### Issue 2: 404 Not Found
**Cause:** Backend not running or wrong URL
**Fix:**
- Verify backend is running on port 5128
- Check API URL in `src/config/api.ts`

#### Issue 3: CORS Error
**Cause:** Backend CORS not configured
**Fix:** Verify backend `Program.cs` has CORS configured for frontend origin

#### Issue 4: Field Mismatch
**Cause:** Backend/frontend field names don't match
**Fix:** Check backend uses camelCase serialization (already configured)

## 📊 Database Verification

### Check Database Directly
```sql
-- Verify incidents exist
SELECT COUNT(*) FROM Incidents WHERE RecordIsDeletedYN = 0;

-- Check a specific incident
SELECT * FROM Incidents WHERE IncidentId = 1;

-- Check stolen items
SELECT * FROM StolenItems WHERE IncidentId = 1;
```

## ✅ Success Criteria

All tests pass when:
- ✅ CRUD operations work without errors
- ✅ All fields save and load correctly
- ✅ Pagination and search work
- ✅ No MSW handlers are called
- ✅ Data persists in database
- ✅ Error messages are user-friendly

## 🚀 Next Steps

After successful testing:
1. Remove `[AllowAnonymous]` from IncidentController
2. Add proper authorization policies
3. Add email notifications for incident creation/updates
4. Implement audit logging
5. Add unit tests for API endpoints

