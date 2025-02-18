import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { DatePicker } from '../../components/ui/date-picker'
import { Progress } from '../../components/ui/progress'

const SatisfactionReports = () => {
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Satisfaction Reports</h1>
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Overall Satisfaction</span>
                <span>85%</span>
              </div>
              <Progress value={85} />
            </div>
            {/* More satisfaction metrics will go here */}
            <p>Customer satisfaction reporting system coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SatisfactionReports 