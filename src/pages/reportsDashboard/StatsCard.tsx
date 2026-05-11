/** Summary metric card used on the reports overview tab. */
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Dashboard components
export const StatsCard = ({ title, value, icon: Icon, change, changeType, backgroundClass }: {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  backgroundClass: string // Added prop for background
}) => {
  // Determine text color based on changeType for the change text
  const changeTextColor = 
    changeType === "positive" ? "text-emerald-200" :
    changeType === "negative" ? "text-rose-200" :
    "text-slate-300"; // Neutral

  return (
    <Card className={cn(
      `bg-gradient-to-br text-white shadow-lg`,
      backgroundClass // Use the passed background class
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
            {change && (
              <p className={cn(
                "text-xs font-medium mt-1",
                changeTextColor // Apply specific color to change text only
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-lg bg-white/20" // Use a consistent semi-transparent white background for the icon
          )}>
            <Icon className="h-5 w-5" /> {/* Icon color will be white due to parent text-white */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
