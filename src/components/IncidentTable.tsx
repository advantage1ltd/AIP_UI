import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

interface IncidentReport {
  id: string
  customerName: string
  store: string
  officerName: string
  date: string
  amount: number
}

interface IncidentTableProps {
  data: IncidentReport[]
}

export function IncidentTable({ data }: IncidentTableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-900 border-b-0">
            <TableHead className="text-white font-semibold">Store</TableHead>
            <TableHead className="text-white font-semibold">Officer</TableHead>
            <TableHead className="text-white font-semibold">Date</TableHead>
            <TableHead className="text-white font-semibold text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.store}</TableCell>
              <TableCell>{report.officerName}</TableCell>
              <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">£{report.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
