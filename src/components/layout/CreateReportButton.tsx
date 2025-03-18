import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface CreateReportButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export const CreateReportButton = ({ className = '', fullWidth = false }: CreateReportButtonProps) => {
  return (
    <Button 
      className={`${fullWidth ? 'w-full' : 'w-[180px]'} bg-white hover:bg-white/90 text-black flex items-center justify-start gap-2 h-9 px-3 rounded-[20px] ${className}`} 
      size="default"
    >
      <div className="bg-red-500 rounded-full p-0.5">
        <Plus className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-xs font-medium">Create Report</span>
    </Button>
  );
}; 