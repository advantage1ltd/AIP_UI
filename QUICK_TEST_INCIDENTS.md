# Quick Test: Verify Incidents API Connection

## ✅ Current Status
- MSW incident handlers: **REMOVED** ✓
- API service: **Using real backend** ✓
- Authentication: **Token included** ✓
- Backend URL: **http://localhost:5128/api** ✓

## 🧪 Quick Test Steps

### Step 1: Navigate to Incidents Page
1. Open the application
2. Navigate to **Operations → Incident Reports** (or the incidents page)
3. Open **Browser DevTools** (F12)

### Step 2: Check Network Tab
1. Go to **Network** tab
2. Filter by "incidents"
3. Look for request to: `http://localhost:5128/api/incidents`

**Expected:**
- ✅ Request URL: `http://localhost:5128/api/incidents?page=1&pageSize=10`
- ✅ Request Method: `GET`
- ✅ Request Headers: Should include `Authorization: Bearer {token}`
- ✅ Status: `200 OK` (or `401` if not logged in)
- ✅ Response: JSON with `data` array and `pagination` object

### Step 3: Check Console
**What you should NOT see:**
- ❌ `🔍 [MSW] === INCIDENTS LIST HANDLER CALLED ===`
- ❌ Any MSW-related logs for incidents

**What you SHOULD see:**
- ✅ Network request logs (if enabled)
- ✅ API response logs
- ✅ Any error messages (if backend is down)

### Step 4: Test Create Operation
1. Click **"New Incident"** button
2. Fill in required fields
3. Click **"Save"**
4. Check Network tab for `POST http://localhost:5128/api/incidents`

**Expected:**
- ✅ Status: `201 Created` or `200 OK`
- ✅ Response contains the created incident
- ✅ Incident appears in the list

### Step 5: Verify Database
```sql
-- Check if incident was created
SELECT TOP 5 * FROM Incidents ORDER BY CreatedAt DESC;

-- Check stolen items if any
SELECT * FROM StolenItems WHERE IncidentId IN (SELECT TOP 1 IncidentId FROM Incidents ORDER BY CreatedAt DESC);
```

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution:**
- Make sure you're logged in
- Check `localStorage.getItem('authToken')` in console
- Re-login if token is missing

### Issue: 404 Not Found
**Solution:**
- Verify backend is running: `dotnet run` in AIP_Backend folder
- Check backend is on port 5128
- Verify endpoint: `http://localhost:5128/api/incidents`

### Issue: CORS Error
**Solution:**
- Backend CORS should already be configured
- Check `Program.cs` has CORS policy for frontend origin

### Issue: Empty List (No Errors)
**Solution:**
- Database might be empty
- Create a test incident
- Check database directly with SQL query

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Network tab shows requests to `localhost:5128/api/incidents`
2. ✅ No MSW logs for incidents
3. ✅ Data persists after page refresh
4. ✅ CRUD operations work without errors
5. ✅ Database contains the incidents you create



