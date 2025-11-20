# Incident Report Loading Fix

## Issue Summary

The incident report page was failing to load incidents due to a configuration mismatch:

### Root Cause
1. **MSW was disabled** in `main.tsx` (transitioning to real backend API)
2. **All MSW handlers were commented out** in `handlers.ts`
3. **No backend Incident Controller exists** - the backend doesn't have an incidents endpoint yet
4. **Frontend trying to call non-existent endpoint** - causing API failures

## Files Changed

### 1. `src/main.tsx`
**Changed:** Re-enabled MSW in development mode for endpoints without backend implementation

```typescript
async function startApp() {
  // Enable MSW for endpoints without backend implementation (e.g., incidents)
  if (import.meta.env.DEV) {
    const { initMockServiceWorker } = await import('./mocks/browser')
    await initMockServiceWorker()
    console.log('🚀 Starting application with MSW for missing backend endpoints...')
  } else {
    console.log('🚀 Starting application with real backend API...')
  }
  // ... rest of code
}
```

**Why:** MSW is needed until the backend has all required endpoints implemented.

### 2. `src/mocks/handlers.ts`
**Changed:** Uncommented handlers for endpoints without backend implementation

```typescript
export const handlers = [
  // Active handlers for endpoints without backend implementation
  ...incidentHandlers,         // ← Re-enabled
  ...dashboardHandlers,         // ← Re-enabled
  ...siteVisitHandlers,         // ← Re-enabled
  ...safeDuressWordsHandlers,   // ← Re-enabled
  ...holidayRequestHandlers,    // ← Re-enabled
  ...customerSatisfactionHandlers, // ← Re-enabled
  ...bankHolidayHandlers,       // ← Re-enabled
  ...regionsHandlers,           // ← Re-enabled
  ...sitesHandlers,             // ← Re-enabled
  ...mysteryShopperHandlers,    // ← Re-enabled
  ...dailyActivityHandlers,     // ← Re-enabled
  ...dailyActivityAnalyticsHandlers, // ← Re-enabled
  ...settingsHandlers,          // ← Re-enabled
  ...dailyOccurrenceBookHandlers, // ← Re-enabled
  
  // Commented out - using real backend
  // ...customerHandlers,       // Backend ready ✅
  // ...userHandlers,           // Backend ready ✅
  // ...headerHandlers,
  // ...employeeDiaryHandlers,
  // ...employeeHandlers        // Backend ready ✅
]
```

**Why:** These handlers provide mock data for features where the backend endpoints don't exist yet.

## Verification

### Database Structure
The incidents data exists in `db.json` at the correct path:

```json
{
  "dashboard": {
    "incidents": [
      {
        "id": "INC001",
        "customerId": 21,
        "date": "2025-01-15",
        "regionName": "East Midlands",
        "siteName": "Leicester Central",
        // ... more fields
      },
      // ... more incidents
    ]
  }
}
```

### Handler Configuration
The incident handlers correctly reference the database:

```typescript
const dbIncidents = db.dashboard?.incidents || []
```

## Expected Behavior After Fix

1. ✅ Incidents will load successfully on the incident report page
2. ✅ MSW will intercept `/api/incidents` calls in development
3. ✅ Data will be filtered by customer ID based on user role
4. ✅ Pagination, search, and filtering will work correctly
5. ✅ No impact on backend-ready endpoints (employees, users, customers)

## Testing Steps

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Check console for MSW initialization:**
   - Should see: `🚀 Starting application with MSW for missing backend endpoints...`
   - Should see: `✅ [MSW] Started successfully`

3. **Navigate to Incident Report page**
   - Login with test credentials
   - Navigate to `/incident-report` or appropriate incident page
   - Verify incidents load correctly
   - Check console for successful API calls

4. **Verify filtering works:**
   - Test search functionality
   - Test pagination
   - Test customer/site filtering

## Backend Migration Plan

When the backend Incident Controller is ready:

### Step 1: Create Backend Incident Controller
Create `AIP_Backend/Controllers/IncidentController.cs` with:
- `GET /api/incidents` - List incidents with pagination
- `GET /api/incidents/{id}` - Get single incident
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/{id}` - Update incident
- `DELETE /api/incidents/{id}` - Delete incident
- `GET /api/incidents/graph-data` - Graph data endpoint
- `GET /api/incidents/types-summary` - Types summary endpoint
- `GET /api/incidents/regions` - Regions endpoint

### Step 2: Create Incident Model and DTOs
- Create `Models/Incident.cs`
- Create DTOs for requests/responses
- Add database migration

### Step 3: Update Frontend API Service
Update `src/services/api/incidents.ts` to use `BASE_API_URL`:

```typescript
import { BASE_API_URL } from '@/config/api'

export const incidentsApi = {
  getIncidents: async (params?: GetIncidentsParams): Promise<IncidentsResponse> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })
    }
    
    const response = await fetch(`${BASE_API_URL}/incidents?${searchParams.toString()}`, {
      headers: getHeaders()
    })
    // ... rest of code
  },
  // ... other methods
}
```

### Step 4: Disable MSW Handler
Comment out `...incidentHandlers` from `handlers.ts` array.

### Step 5: Test with Real Backend
Verify all incident functionality works with the real backend.

## Current Status

- ✅ Frontend: Ready and working with MSW
- ⏳ Backend: Needs Incident Controller implementation
- ✅ Database: Has sample incident data
- ✅ MSW Handlers: Active and functional
- ✅ No linting errors
- ✅ Development mode: MSW enabled
- ✅ Production mode: MSW disabled (will fail until backend ready)

## Notes

- MSW only runs in development mode (`import.meta.env.DEV`)
- Production builds will need the real backend endpoints
- This hybrid approach (MSW + Real Backend) allows gradual migration
- Backend endpoints that exist (employees, users, customers) use real API
- Backend endpoints that don't exist (incidents, etc.) use MSW

## Related Files

- `src/main.tsx` - MSW initialization
- `src/mocks/handlers.ts` - Handler registration
- `src/mocks/incidentHandlers.ts` - Incident mock handlers
- `src/services/api/incidents.ts` - Frontend API service
- `db.json` - Mock data source
- `src/pages/operations/IncidentReportPage.tsx` - Main incident page

