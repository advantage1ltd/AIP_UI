import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail, CheckSquare, Edit2, Clock } from 'lucide-react';

interface PatrolLogHeaderProps {
  showEditForm: boolean;
  onToggleEditForm: () => void;
  onMarkAsClosed: () => void;
  onEmailParty: () => void;
  isRowSelected: boolean;
}

export const PatrolLogHeader: React.FC<PatrolLogHeaderProps> = ({
  showEditForm,
  onToggleEditForm,
  onMarkAsClosed,
  onEmailParty,
  isRowSelected
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Patrol Log</h1>
              <p className="text-xs sm:text-sm text-gray-500">Manage and track patrol activities</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Button 
              variant={showEditForm ? "default" : "outline"} 
              className={`${showEditForm ? "bg-blue-600 text-white" : "text-gray-600"} transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9`}
              onClick={onToggleEditForm}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              {showEditForm ? 'Hide Form' : 'Edit Form'}
            </Button>
            <Button 
              variant="outline" 
              className="text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9"
              onClick={onMarkAsClosed}
              disabled={!isRowSelected}
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Mark Record As Closed</span>
              <span className="sm:hidden">Mark Closed</span>
            </Button>
            <Button 
              variant="outline" 
              className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9"
              onClick={onEmailParty}
              disabled={!isRowSelected}
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Email Relevant Party</span>
              <span className="sm:hidden">Email Party</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 