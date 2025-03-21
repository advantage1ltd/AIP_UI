import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Building2, MapPin, Info } from 'lucide-react';

interface HeaderItem {
  label: string;
  icon?: React.ReactNode;
  hide?: 'md' | 'lg';
}

const HEADER_ITEMS: HeaderItem[] = [
  { label: 'Type' },
  { label: 'Log Date', icon: <Clock className="w-3.5 h-3.5 text-gray-500" /> },
  { label: 'Building', icon: <Building2 className="w-3.5 h-3.5 text-gray-500" /> },
  { label: 'Location', icon: <MapPin className="w-3.5 h-3.5 text-gray-500" /> },
  { label: 'Issue', icon: <Info className="w-3.5 h-3.5 text-gray-500" /> },
  { label: 'Additional Info', hide: 'md' },
  { label: 'Tracking No', hide: 'md' },
  { label: 'Status' },
  { label: 'Team', hide: 'md' },
  { label: 'Action' },
];

export const PatrolLogTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50 hover:bg-gray-50">
        {HEADER_ITEMS.map(({ label, icon, hide }) => (
          <TableHead 
            key={label} 
            className={`font-medium text-xs p-2 sm:p-3 text-gray-900 whitespace-nowrap ${
              hide === 'md' ? 'hidden md:table-cell' : 
              hide === 'lg' ? 'hidden lg:table-cell' : ''
            }`}
          >
            {icon ? (
              <div className="flex items-center gap-1.5">
                {icon}
                <span>{label}</span>
              </div>
            ) : (
              label
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}; 