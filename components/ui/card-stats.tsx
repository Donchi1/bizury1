import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description: string
  borderColor?: string
  textColor?: string
  iconBgColor?: string
}

export function CardStats({
  title,
  value,
  icon,
  description,
  borderColor = "border-gray-200",
  textColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
}: StatsCardProps) {
  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
          </div>
          {icon && <div className={`p-3 rounded-full ${iconBgColor} ${textColor}`}>
            {icon}
          </div>}
        </div>
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}