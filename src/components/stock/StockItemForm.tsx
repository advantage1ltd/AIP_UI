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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={item?.name} required />
      </div>
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" defaultValue={item?.sku} required />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={item?.category} required />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input 
          id="quantity" 
          name="quantity" 
          type="number" 
          defaultValue={item?.quantity} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="minimumStock">Minimum Stock Level</Label>
        <Input 
          id="minimumStock" 
          name="minimumStock" 
          type="number" 
          defaultValue={item?.minimumStock} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="unitPrice">Unit Price (£)</Label>
        <Input 
          id="unitPrice" 
          name="unitPrice" 
          type="number" 
          step="0.01" 
          defaultValue={item?.unitPrice} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={item?.description} 
          required 
        />
      </div>
      <Button type="submit" className="w-full">
        {item ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  )
}