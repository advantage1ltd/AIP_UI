import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { Lead } from "@/types/leads"

interface LeadFilterProps {
  filters: {
    status?: Lead['status'];
  };
  onFilterChange: (filters: { status?: Lead['status'] }) => void;
}

const LEAD_STATUSES = [
  "New Lead",
  "Qualified",
  "Negotiation",
  "Won",
  "Lost"
] as const

export function LeadFilter({ filters, onFilterChange }: LeadFilterProps) {
  const handleClearFilters = () => {
    onFilterChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {Object.keys(filters).length > 0 && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filter Leads</h4>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="ghost"
                className="h-8 px-2 text-muted-foreground"
                onClick={handleClearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange({ ...filters, status: value as Lead['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
