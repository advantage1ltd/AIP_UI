import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'

const IncidentReport = () => {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incident Reports</h1>
        <div className="flex gap-4">
          <DatePicker
            date={date}
            setDate={setDate}
            placeholder="Select date"
          />
          <Button>New Incident</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Incident list will go here */}
            <p>Incident reporting system coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IncidentReport 