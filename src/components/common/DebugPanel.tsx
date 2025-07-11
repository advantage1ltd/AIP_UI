import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getStore, clearStore } from '@/mocks/handlers';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  
  const refreshData = async () => {
    const store = await getStore();
    setStoreData(store);
  };
  
  const handleClearStore = () => {
    clearStore();
    refreshData();
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
            variant="outline"
            onClick={handleClearStore}
          >
            Clear Store
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
            <h4 className="font-medium mb-2">Store Data:</h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {JSON.stringify(storeData, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Local Storage:</h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {JSON.stringify({
                msw_data_store: localStorage.getItem('msw_data_store'),
              }, null, 2)}
            </pre>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}; 