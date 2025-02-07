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

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
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
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>
      <div className="rounded-md border bg-slate-50/50 dark:bg-slate-900/20">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
              <th 
                className="h-12 px-4 text-left align-middle font-medium text-white cursor-pointer hover:bg-slate-700/50"
                onClick={() => sortData('customerName')}
              >
                Customer Name {getSortIcon('customerName')}
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium text-white cursor-pointer hover:bg-slate-700/50"
                onClick={() => sortData('store')}
              >
                Store {getSortIcon('store')}
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium text-white cursor-pointer hover:bg-slate-700/50"
                onClick={() => sortData('officerName')}
              >
                Officer Name {getSortIcon('officerName')}
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium text-white cursor-pointer hover:bg-slate-700/50"
                onClick={() => sortData('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                className="h-12 px-4 text-right align-middle font-medium text-white cursor-pointer hover:bg-slate-700/50"
                onClick={() => sortData('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((report) => (
                <tr key={report.id} className="border-b transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  <td className="p-4 align-middle">{report.customerName}</td>
                  <td className="p-4 align-middle">{report.store}</td>
                  <td className="p-4 align-middle">{report.officerName}</td>
                  <td className="p-4 align-middle">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="p-4 align-middle text-right">£{report.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
