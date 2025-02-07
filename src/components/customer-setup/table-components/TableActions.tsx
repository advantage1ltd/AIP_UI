import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

interface TableActionsProps {
  title: string
  searchQuery: string
  onSearchChange: (value: string) => void
  onNew: () => void
  searchPlaceholder: string
  newButtonText: string
}

export function TableActions({ 
  title,
  searchQuery, 
  onSearchChange, 
  onNew,
  searchPlaceholder,
  newButtonText
}: TableActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1 w-full sm:w-[400px]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input 
            placeholder={searchPlaceholder}
            className="pl-10 h-11 text-base bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-[#324053] focus:ring-2 focus:ring-[#324053]/20 rounded-lg shadow-sm" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <Button 
        onClick={onNew} 
        style={{ backgroundColor: '#324053' }} 
        className="h-11 px-6 hover:opacity-90 shadow-sm"
      >
        <Plus className="mr-2 h-5 w-5" />
        {newButtonText}
      </Button>
    </div>
  )
}
