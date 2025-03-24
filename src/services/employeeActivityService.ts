import type { ActivitySource, ActivitySyncStatus, EmployeeActivity } from '@/types/employee';
import { ACTIVITY_SOURCES } from '@/config/activityConfig';

class EmployeeActivityService {
  private activities: EmployeeActivity[] = [];
  private baseUrl: string = 'https://your-api-base-url.com';
  private syncStatus: Record<ActivitySource, ActivitySyncStatus> = Object.fromEntries(
    Object.keys(ACTIVITY_SOURCES).map(source => [
      source as ActivitySource,
      { source: source as ActivitySource, status: 'inactive', lastSynced: null }
    ])
  ) as Record<ActivitySource, ActivitySyncStatus>;

  async fetchEmployeeActivities(employeeId?: string): Promise<EmployeeActivity[]> {
    // In a real implementation, this would fetch from an API
    return employeeId
      ? this.activities.filter(activity => activity.employeeId === employeeId)
      : this.activities;
  }

  async fetchActivitySources(): Promise<Record<ActivitySource, ActivitySyncStatus>> {
    // In a real implementation, this would fetch from an API
    return this.syncStatus;
  }

  async createActivity(data: Omit<EmployeeActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeActivity> {
    const newActivity: EmployeeActivity = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.activities.unshift(newActivity);
    return newActivity;
  }

  async updateActivity(id: string, data: Partial<EmployeeActivity>): Promise<EmployeeActivity> {
    const index = this.activities.findIndex(activity => activity.id === id);
    if (index === -1) {
      throw new Error('Activity not found');
    }

    const updatedActivity: EmployeeActivity = {
      ...this.activities[index],
      ...data,
      updatedAt: new Date(),
    };
    this.activities[index] = updatedActivity;
    return updatedActivity;
  }

  async deleteActivity(id: string): Promise<void> {
    const index = this.activities.findIndex(activity => activity.id === id);
    if (index === -1) {
      throw new Error('Activity not found');
    }
    this.activities.splice(index, 1);
  }

  async syncActivitiesFromSource(source: ActivitySource): Promise<void> {
    // In a real implementation, this would sync with external systems
    try {
      this.syncStatus[source] = {
        ...this.syncStatus[source],
        status: 'active',
        lastSynced: new Date(),
      };
    } catch (error) {
      this.syncStatus[source] = {
        ...this.syncStatus[source],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      throw error;
    }
  }

  // Automated data extraction
  async extractActivitiesFromHR(startDate: Date, endDate: Date): Promise<EmployeeActivity[]> {
    const response = await fetch(`${this.baseUrl}/api/extract-hr-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract activities from HR system');
    }
    return response.json();
  }

  async extractActivitiesFromTraining(): Promise<EmployeeActivity[]> {
    const response = await fetch(`${this.baseUrl}/api/extract-training-activities`);
    if (!response.ok) {
      throw new Error('Failed to extract activities from training system');
    }
    return response.json();
  }

  async extractActivitiesFromLeave(): Promise<EmployeeActivity[]> {
    const response = await fetch(`${this.baseUrl}/api/extract-leave-activities`);
    if (!response.ok) {
      throw new Error('Failed to extract activities from leave system');
    }
    return response.json();
  }

  // Utility methods
  async uploadAttachment(activityId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/activities/${activityId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
    
    const { url } = await response.json();
    return url;
  }

  async generateActivityReport(employeeId: string, startDate: Date, endDate: Date): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/activities/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, startDate, endDate }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate activity report');
    }
    
    return response.blob();
  }
}

export const employeeActivityService = new EmployeeActivityService(); 