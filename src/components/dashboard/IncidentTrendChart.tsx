import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', incidents: 40 },
  { name: 'Feb', incidents: 30 },
  { name: 'Mar', incidents: 45 },
  { name: 'Apr', incidents: 25 },
  { name: 'May', incidents: 35 },
  { name: 'Jun', incidents: 20 },
]

export const IncidentTrendChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Incident Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.375rem'
                }}
              />
              <Area
                type="monotone"
                dataKey="incidents"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}