import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface IncidentReport {
  id: string
  customerName: string
  store: string
  officerName: string
  date: string
  amount: number
}

interface DataTableProps {
  data: IncidentReport[]
}

export function IncidentTable({ data }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IncidentReport | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const sortData = (key: keyof IncidentReport) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key, direction })
  }

  const filteredAndSortedData = useMemo(() => {
    let processed = [...data]

    // Debug logging
    console.log('Data received in IncidentTable:', data)

    // If data is empty, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      processed = processed.filter(
        item =>
          item.customerName.toLowerCase().includes(query) ||
          item.store.toLowerCase().includes(query) ||
          item.officerName.toLowerCase().includes(query) ||
          new Date(item.date).toLocaleDateString().toLowerCase().includes(query) ||
          item.amount.toString().includes(query)
      )
    }

    // Sort
    if (sortConfig.key) {
      processed.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue
        }

        // Convert string dates to Date objects for comparison
        if (sortConfig.key === 'date') {
          const aDate = new Date(aValue as string)
          const bDate = new Date(bValue as string)
          return sortConfig.direction === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime()
        }

        return 0
      })
    }

    return processed
  }, [data, searchQuery, sortConfig])

  const getSortIcon = (key: keyof IncidentReport) => {
    if (sortConfig.key !== key) return '↕'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div>
      <div className="flex items-center justify-between py-2 md:py-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] text-xs md:text-sm lg:w-[250px]"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-[13px] md:text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th 
                className="h-10 px-2 text-left align-middle font-semibold tracking-tight text-muted-foreground cursor-pointer hover:bg-muted/70 md:h-12 md:px-4"
                onClick={() => sortData('customerName')}
              >
                <div className="flex items-center gap-1">
                  Customer {getSortIcon('customerName')}
                </div>
              </th>
              <th 
                className="h-10 px-2 text-left align-middle font-semibold tracking-tight text-muted-foreground cursor-pointer hover:bg-muted/70 md:h-12 md:px-4"
                onClick={() => sortData('store')}
              >
                <div className="flex items-center gap-1">
                  Store {getSortIcon('store')}
                </div>
              </th>
              <th 
                className="h-10 px-2 text-left align-middle font-semibold tracking-tight text-muted-foreground cursor-pointer hover:bg-muted/70 md:h-12 md:px-4"
                onClick={() => sortData('officerName')}
              >
                <div className="flex items-center gap-1">
                  Officer {getSortIcon('officerName')}
                </div>
              </th>
              <th 
                className="h-10 px-2 text-left align-middle font-semibold tracking-tight text-muted-foreground cursor-pointer hover:bg-muted/70 md:h-12 md:px-4"
                onClick={() => sortData('date')}
              >
                <div className="flex items-center gap-1">
                  Date {getSortIcon('date')}
                </div>
              </th>
              <th 
                className="h-10 px-2 text-right align-middle font-semibold tracking-tight text-muted-foreground cursor-pointer hover:bg-muted/70 md:h-12 md:px-4"
                onClick={() => sortData('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount {getSortIcon('amount')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="tracking-normal">
            {filteredAndSortedData.length === 0 && data.length > 0 && (
              <tr>
                <td colSpan={5} className="h-12 text-center text-sm text-amber-600">
                  Data available but filtered out: {data.length} records found
                </td>
              </tr>
            )}
            
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((report) => (
                <tr key={report.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-2 align-middle font-medium leading-relaxed md:p-4">{report.customerName}</td>
                  <td className="p-2 align-middle text-muted-foreground leading-relaxed md:p-4">{report.store}</td>
                  <td className="p-2 align-middle text-muted-foreground leading-relaxed md:p-4">{report.officerName}</td>
                  <td className="p-2 align-middle text-muted-foreground tabular-nums leading-relaxed md:p-4">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 align-middle text-right font-medium tabular-nums leading-relaxed text-green-600 dark:text-green-400 md:p-4">
                    £{report.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  No results found. Data length: {data.length}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
