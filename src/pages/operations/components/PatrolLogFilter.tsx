import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatrolLogFilterProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
  itemType: string;
  onItemTypeChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showCompletedRecords: boolean;
  onToggleCompletedRecords: () => void;
  onPatrolSystem: () => void;
}

export const PatrolLogFilter: React.FC<PatrolLogFilterProps> = ({
  selectedMonth,
  onMonthChange,
  itemType,
  onItemTypeChange,
  searchTerm,
  onSearchChange,
  showCompletedRecords,
  onToggleCompletedRecords,
  onPatrolSystem
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">Filter Options</h2>
          <p className="text-xs text-gray-500">Refine the patrol logs display</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-3">
        {/* Month filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Month</label>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm border-gray-300">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="February-2023" className="text-xs sm:text-sm">February 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Item type filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">Item Type</label>
          <Select value={itemType} onValueChange={onItemTypeChange}>
            <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm border-gray-300">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Both" className="text-xs sm:text-sm">Both</SelectItem>
              <SelectItem value="Internal" className="text-xs sm:text-sm">Internal</SelectItem>
              <SelectItem value="External" className="text-xs sm:text-sm">External</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search box */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:flex-1 lg:ml-auto">
          <label className="text-xs font-medium text-gray-700">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-full h-8 sm:h-9 text-xs sm:text-sm border-gray-300"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:ml-2">
          <Button 
            variant="outline"
            className={`h-8 sm:h-9 text-xs sm:text-sm border-gray-300 ${
              showCompletedRecords 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={onToggleCompletedRecords}
          >
            {showCompletedRecords ? 'View Active' : 'View Completed'}
          </Button>
          <Button 
            variant="outline"
            onClick={onPatrolSystem}
            className="h-8 sm:h-9 text-xs sm:text-sm border-gray-300 hover:bg-gray-50"
          >
            Patrols
          </Button>
        </div>
      </div>
    </div>
  );
}; 