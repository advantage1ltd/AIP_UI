import type { ActivitySource, ActivitySyncStatus, EmployeeActivity } from '@/types/employee';
import { ACTIVITY_SOURCES } from '@/config/activityConfig';

class EmployeeActivityService {
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Get all activities or filter by employee ID
  async fetchEmployeeActivities(employeeId?: string): Promise<EmployeeActivity[]> {
    try {
      const url = employeeId 
        ? `${this.baseUrl}/activities?employeeId=${employeeId}`
        : `${this.baseUrl}/activities`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform dates from strings to Date objects
      return data.map((activity: any) => ({
        ...activity,
        activityDate: new Date(activity.activityDate),
        nextReviewDate: activity.nextReviewDate ? new Date(activity.nextReviewDate) : undefined,
        actionDeadline: activity.actionDeadline ? new Date(activity.actionDeadline) : undefined,
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Get sync status for all activity sources
  async fetchActivitySources(): Promise<Record<ActivitySource, ActivitySyncStatus>> {
    try {
      const response = await fetch(`${this.baseUrl}/sync-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform lastSynced dates from strings to Date objects
      return Object.fromEntries(
        Object.entries(data).map(([source, status]: [string, any]) => [
          source,
          {
            ...status,
            lastSynced: status.lastSynced ? new Date(status.lastSynced) : null
          }
        ])
      ) as Record<ActivitySource, ActivitySyncStatus>;
    } catch (error) {
      console.error('Error fetching sync status:', error);
      // Fallback to default sync status if API fails
      return Object.fromEntries(
        Object.keys(ACTIVITY_SOURCES).map(source => [
          source as ActivitySource,
          { source: source as ActivitySource, status: 'inactive', lastSynced: null }
        ])
      ) as Record<ActivitySource, ActivitySyncStatus>;
    }
  }

  // Create a new activity
  async createActivity(data: Omit<EmployeeActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const activity = await response.json();
      
      // Transform dates from strings to Date objects
      return {
        ...activity,
        activityDate: new Date(activity.activityDate),
        nextReviewDate: activity.nextReviewDate ? new Date(activity.nextReviewDate) : undefined,
        actionDeadline: activity.actionDeadline ? new Date(activity.actionDeadline) : undefined,
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt)
      };
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Update an existing activity
  async updateActivity(id: string, data: Partial<EmployeeActivity>): Promise<EmployeeActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const activity = await response.json();
      
      // Transform dates from strings to Date objects
      return {
        ...activity,
        activityDate: new Date(activity.activityDate),
        nextReviewDate: activity.nextReviewDate ? new Date(activity.nextReviewDate) : undefined,
        actionDeadline: activity.actionDeadline ? new Date(activity.actionDeadline) : undefined,
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt)
      };
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  // Delete an activity
  async deleteActivity(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Sync with external data source
  async syncActivitiesFromSource(source: ActivitySource): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error syncing activities from ${source}:`, error);
      throw error;
    }
  }

  // Generate activity report
  async generateActivityReport(employeeId: string, startDate: Date, endDate: Date): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId, 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error generating activity report:', error);
      throw error;
    }
  }
  
  // Utility method to transform activity data
  private transformActivityDates(activity: any): EmployeeActivity {
    return {
      ...activity,
      activityDate: new Date(activity.activityDate),
      nextReviewDate: activity.nextReviewDate ? new Date(activity.nextReviewDate) : undefined,
      actionDeadline: activity.actionDeadline ? new Date(activity.actionDeadline) : undefined,
      createdAt: new Date(activity.createdAt),
      updatedAt: new Date(activity.updatedAt)
    };
  }
}

// Create and export a singleton instance
export const employeeActivityService = new EmployeeActivityService(); 