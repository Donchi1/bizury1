"use client"

import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  Activity,
  UserCheck,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import useAdminStore from "@/lib/store/admin/adminStore"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import InnerLoading from "@/components/layout/InnerLoading"

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0d0d0'];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [localLoading, setLocalLoading] = useState(false)

  const { 
    dashboardStats, 
    recentActivities, 
    fetchDashboardData, 
    isLoading, 
    error 
  } = useAdminStore()

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true)
      try {
        await fetchDashboardData()
      } catch (error) {
        toast.error( "Error",{
          description: "Failed to load analytics data",
        })
      } finally {
        setLocalLoading(false)
      }
    }
    
    loadData()
  }, [fetchDashboardData, toast])

  // Process data for charts
  const getSalesData = () => {
    // In a real app, you would fetch time-series data based on the selected timeRange
    // For now, we'll return some sample data points based on the dashboard stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    return months.map((month, index) => ({
      date: month,
      sales: Math.floor(Math.random() * 1000) + 500, // Replace with actual data
      revenue: Math.floor(Math.random() * 10000) + 1000, // Replace with actual data
    }))
  }

  const getCategoryData = () => {
    // In a real app, you would fetch category data
    // For now, we'll return some sample data
    return [
      { name: "Electronics", value: 45, fill: COLORS[0] },
      { name: "Apparel", value: 25, fill: COLORS[1] },
      { name: "Home Goods", value: 15, fill: COLORS[2] },
      { name: "Books", value: 10, fill: COLORS[3] },
      { name: "Other", value: 5, fill: COLORS[4] },
    ]
  }

  const getTopProducts = () => {
    // In a real app, you would fetch top products
    // For now, we'll return some sample data
    return [
      { name: "Wireless Headphones", sales: 1200 },
      { name: "Smartwatch", sales: 950 },
      { name: "Yoga Mat", sales: 800 },
      { name: "Coffee Maker", sales: 650 },
      { name: "Running Shoes", sales: 500 },
    ]
  }

  const handleExport = () => {
    // In a real app, you would generate and download a report
    toast("Export started",{
      description: "Your analytics report is being generated and will download shortly.",
    })
  }

  if (localLoading) return <InnerLoading />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-lg font-medium">Failed to load analytics data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  const stats = [
    { 
      title: "Total Revenue", 
      value: formatPrice(dashboardStats?.financial?.total_revenue || 0), 
      change: "+20.1%", 
      Icon: DollarSign 
    },
    { 
      title: "New Customers", 
      value: `+${dashboardStats?.users?.new_today || 0}`, 
      change: dashboardStats?.users?.growth ? `+${dashboardStats.users.growth}%` : "N/A", 
      Icon: Users 
    },
    { 
      title: "Total Orders", 
      value: dashboardStats?.orders?.total || 0, 
      change: "+8.3%", 
      Icon: ShoppingCart 
    },
    { 
      title: "Active Now", 
      value: dashboardStats?.users?.active || 0, 
      change: "+3.2%", 
      Icon: TrendingUp 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of your platform's performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, change, Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales & Revenue Overview</CardTitle>
            <CardDescription>Monthly performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getSalesData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Area
                  dataKey="sales"
                  type="monotone"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={getCategoryData()} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={getTopProducts()} 
                layout="vertical" 
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-full p-2">
                      {activity.type === 'order' ? (
                        <ShoppingCart className="h-5 w-5 text-gray-500" />
                      ) : activity.type === 'user' ? (
                        <UserCheck className="h-5 w-5 text-gray-500" />
                      ) : activity.type === 'product' ? (
                        <Package className="h-5 w-5 text-gray-500" />
                      ) : activity.type === 'payment' ? (
                        <DollarSign className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}