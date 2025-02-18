import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const IncidentGraph = () => {
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()
  const [incidentType, setIncidentType] = React.useState('')

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incident Analytics</h1>
        <div className="flex gap-4">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
            placeholder="Start date"
          />
          <DatePicker
            date={endDate}
            setDate={setEndDate}
            placeholder="End date"
          />
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theft">Theft</SelectItem>
              <SelectItem value="vandalism">Vandalism</SelectItem>
              <SelectItem value="trespass">Trespass</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {/* Graph content will go here */}
            <p>Incident analytics dashboard coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IncidentGraph 