import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"

interface TableActionsProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onNewEmployee: () => void
}

export function TableActions({ searchQuery, onSearchChange, onNewEmployee }: TableActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="relative w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search employees..." 
          className="pl-9 bg-white/50 border-none" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={onNewEmployee} 
        style={{ backgroundColor: '#324053' }}
        className="hover:opacity-90"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        New Employee
      </Button>
    </div>
  )
}