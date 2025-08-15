import { http, HttpResponse } from 'msw';
import { PageAccessSettings } from '@/api/pageAccess';
import { BASE_API_URL } from '@/config/api';

// Helper function to load from db.json with localStorage fallback
const loadFromDb = async (): Promise<PageAccessSettings> => {
  try {
    // First try to load any saved settings from localStorage
    const savedSettings = localStorage.getItem('db_pageAccess_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      console.log('📖 [Settings] Loaded saved settings from localStorage');
      
      // Still need to get availablePages from db.json
      const dbResponse = await fetch('/db.json');
      const db = await dbResponse.json();
      
      return {
        pageAccessByRole: parsedSettings.pageAccessByRole,
        availablePages: db.pageAccess?.availablePages || []
      };
    }
    
    // Fallback to original db.json
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    
    if (!db.pageAccess) {
      throw new Error('No page access settings found in db.json');
    }
    
    return {
      pageAccessByRole: db.pageAccess.pageAccessByRole,
      availablePages: db.pageAccess.availablePages
    };
  } catch (error) {
    console.error('Failed to load from db.json:', error);
    throw error;
  }
};

// Helper function to save to db.json (simulated persistence)
// In a real app, this would POST to a backend API that updates the database
const saveToDb = async (settings: PageAccessSettings): Promise<void> => {
  try {
    // First, load the current db.json data
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    
    // Update the pageAccess section with new settings
    if (!db.pageAccess) {
      db.pageAccess = {};
    }
    
    db.pageAccess.pageAccessByRole = settings.pageAccessByRole;
    
    // Store the updated settings in localStorage as a simulation of persistence
    // In a real application, this would be handled by the backend
    localStorage.setItem('db_pageAccess_settings', JSON.stringify(settings));
    
    console.log('💾 [Settings] Simulated save to database:', {
      roles: Object.keys(settings.pageAccessByRole),
      adminAccess: settings.pageAccessByRole.Administrator?.length || 0
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to save to database:', error);
    throw error;
  }
};

// Settings handlers
export const settingsHandlers = [
  // GET /api/pageaccess/settings
  http.get('/api/pageaccess/settings', async () => {
    try {
      console.log('🔍 [Settings] MSW Handler: Loading page access settings from db.json');
      
      // Load settings directly from db.json
      const settings = await loadFromDb();
      
      console.log('📝 [Settings] MSW Handler: Loaded settings:', {
        roles: Object.keys(settings.pageAccessByRole),
        totalPages: settings.availablePages.length,
        adminPages: settings.pageAccessByRole.Administrator?.length || 0
      });
      
      return HttpResponse.json({ data: settings });
    } catch (error) {
      console.error('❌ [Settings] MSW Handler: Error getting page access:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/pageaccess/settings
  http.put('/api/pageaccess/settings', async ({ request }) => {
    try {
      const settings = await request.json() as PageAccessSettings;
      console.log('💾 [Settings] Saving page access settings:', {
        roles: Object.keys(settings.pageAccessByRole),
        adminAccess: settings.pageAccessByRole.Administrator?.length || 0
      });
      
      // Save to database (in production, this would update the real database)
      await saveToDb(settings);
      
      return HttpResponse.json({
        success: true,
        message: 'Page access settings updated successfully'
      });
    } catch (error) {
      console.error('❌ [Settings] Error updating page access:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 