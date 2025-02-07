import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { Trophy, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfficerStats {
  id: string
  name: string
  incidents: number
  valueSaved: number
  responseRate: number
  status: 'excellent' | 'good' | 'needs-improvement' | 'non-reporter'
}

interface OfficerPerformanceProps {
  data: readonly OfficerStats[]
}

type ViewMode = 'top-performers' | 'non-reporters'

export function OfficerPerformance({ data }: OfficerPerformanceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('top-performers')

  const getStatusColor = (status: OfficerStats['status']) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'good':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'needs-improvement':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'non-reporter':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    }
  }

  const getStatusText = (status: OfficerStats['status']) => {
    switch (status) {
      case 'excellent':
        return 'Excellent'
      case 'good':
        return 'Good'
      case 'needs-improvement':
        return 'Needs Improvement'
      case 'non-reporter':
        return 'Non-Reporter'
    }
  }

  const filteredData = data.filter(officer => {
    if (viewMode === 'top-performers') {
      return ['excellent', 'good'].includes(officer.status)
    } else {
      return ['needs-improvement', 'non-reporter'].includes(officer.status)
    }
  }).sort((a, b) => {
    if (viewMode === 'top-performers') {
      // Sort by value saved (descending) for top performers
      return b.valueSaved - a.valueSaved
    } else {
      // Sort by response rate (ascending) for non-reporters
      return a.responseRate - b.responseRate
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button
          variant={viewMode === 'top-performers' ? 'default' : 'outline'}
          onClick={() => setViewMode('top-performers')}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Top Performers
        </Button>
        <Button
          variant={viewMode === 'non-reporters' ? 'default' : 'outline'}
          onClick={() => setViewMode('non-reporters')}
          className="flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          Non-Reporters
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">Officer</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Incidents</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Value Saved</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Response Rate</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((officer) => (
              <tr key={officer.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-medium">{officer.name}</td>
                <td className="p-4 align-middle">{officer.incidents}</td>
                <td className="p-4 align-middle">£{officer.valueSaved.toLocaleString()}</td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={officer.responseRate} 
                      className={cn(
                        "w-[60px]",
                        officer.responseRate >= 90 ? '[&>div]:bg-green-500' :
                        officer.responseRate >= 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      {officer.responseRate}%
                    </span>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <Badge className={getStatusColor(officer.status)}>
                    {getStatusText(officer.status)}
                  </Badge>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  No officers found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        {viewMode === 'top-performers' ? (
          <p>Showing top performing officers sorted by value saved</p>
        ) : (
          <p>Showing officers that need attention sorted by response rate</p>
        )}
      </div>
    </div>
  )
}
