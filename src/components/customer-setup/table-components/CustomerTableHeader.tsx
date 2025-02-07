import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CustomerTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Company Name</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
}