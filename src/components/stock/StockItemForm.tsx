import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StockItem } from "@/types/stock"

interface StockItemFormProps {
  item?: StockItem
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export const StockItemForm = ({ item, onSubmit }: StockItemFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-1 sm:space-y-2">
        <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={item?.name} 
          required 
          className="h-8 sm:h-10 text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="sku" className="text-sm sm:text-base">SKU</Label>
          <Input 
            id="sku" 
            name="sku" 
            defaultValue={item?.sku} 
            required 
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
          <Input 
            id="category" 
            name="category" 
            defaultValue={item?.category} 
            required 
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="quantity" className="text-sm sm:text-base">Quantity</Label>
          <Input 
            id="quantity" 
            name="quantity" 
            type="number" 
            defaultValue={item?.quantity} 
            required 
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="minimumStock" className="text-sm sm:text-base">Min Stock</Label>
          <Input 
            id="minimumStock" 
            name="minimumStock" 
            type="number" 
            defaultValue={item?.minimumStock} 
            required 
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="unitPrice" className="text-sm sm:text-base">Unit Price (£)</Label>
          <Input 
            id="unitPrice" 
            name="unitPrice" 
            type="number" 
            step="0.01" 
            defaultValue={item?.unitPrice} 
            required 
            className="h-8 sm:h-10 text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2">
        <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={item?.description} 
          required 
          className="min-h-[80px] text-sm sm:text-base"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 mt-2 sm:mt-4 text-sm sm:text-base"
      >
        {item ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  )
}