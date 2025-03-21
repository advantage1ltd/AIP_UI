import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { PatrolLogFormField } from './PatrolLogFormField';

interface PatrolLogDownloadProps {
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  csvData: any[];
}

export const PatrolLogDownload: React.FC<PatrolLogDownloadProps> = ({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  csvData
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 md:p-6 rounded-xl border border-blue-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-blue-200 p-1.5 sm:p-2 rounded-lg">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-blue-900">Download Data</h2>
          <p className="text-xs text-blue-700">Export patrol logs within a specific date range</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-blue-900">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full h-8 sm:h-9 px-3 py-1.5 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-xs sm:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-blue-900">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full h-8 sm:h-9 px-3 py-1.5 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-xs sm:text-sm"
          />
        </div>
        <div className="sm:col-span-2 md:col-span-1 flex flex-col justify-end">
          <CSVLink 
            data={csvData} 
            filename={`patrol_log_${startDate}_${endDate || 'current'}.csv`}
            className="w-full"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="w-3.5 h-3.5 mr-2" />
              Download CSV
            </Button>
          </CSVLink>
        </div>
        <div className="md:col-span-1 flex items-center text-center md:text-left">
          <p className="text-xs sm:text-sm text-blue-700 italic w-full">
            Leave dates empty for current month's data
          </p>
        </div>
      </div>
    </div>
  );
}; 