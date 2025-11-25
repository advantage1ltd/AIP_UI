import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Debug Panel Component
 * This component shows localStorage data for debugging purposes.
 * User data is managed through the real backend API via userService.
 */
export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  
  const refreshData = () => {
    // Only show localStorage data - user data comes from real API
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    setLocalStorageData({
      authToken: authToken ? '***' : null,
      hasUser: !!user,
      userRole,
      // Note: User data is fetched from real backend API
    });
  };
  
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);
  
  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600"
        onClick={() => setIsOpen(true)}
      >
        Show Debug Panel
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 p-4 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Debug Panel</h3>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshData}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Local Storage (Auth):</h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Note: User data is managed through the real backend API.</p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}; 