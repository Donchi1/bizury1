"use client"

import { useEffect } from "react"
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Store,
  CreditCard,
  RefreshCw,
  Activity,
  Clock,
  XCircle,
  Ban,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { toast } from "sonner"
import useAdminStore from "@/lib/store/admin/adminStore"

export default function AdminDashboard() {
  const {
    dashboardStats,
    recentActivities,
    isLoading,
    error,
    fetchDashboardData,
    refreshData,
  } = useAdminStore()

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData()
    }
    
    loadData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshData()
      toast.info('Dashboard data refreshed automatically')
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchDashboardData, refreshData])

  const handleRefresh = async () => {
    const promise = refreshData()
    toast.promise(promise, {
      loading: 'Refreshing data...',
      success: 'Dashboard data refreshed!',
      error: (err) => `Error refreshing data: ${err.message}`,
    })
  }

  if (isLoading && !dashboardStats.users.total) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Refreshing...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to the super admin management panel</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardStats.users.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{dashboardStats.users.growth}% from last month
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {dashboardStats.users.new_today} new today
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardStats.products.total.toLocaleString()}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Active: {dashboardStats.products.active}</span>
                <span className="text-red-600">
                  Out of stock: {dashboardStats.products.out_of_stock}
                </span>
              </div>
              <Progress
                value={(dashboardStats.products.active / dashboardStats.products.total) * 100}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardStats.orders.total.toLocaleString()}</div>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Pending: {dashboardStats.orders.pending}</span>
                <span>Processing: {dashboardStats.orders.processing}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ${dashboardStats.financial.total_revenue.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Monthly: ${dashboardStats.financial.monthly_revenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Stores Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardStats.stores.total}</div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Active: {dashboardStats.stores.active}</span>
                <span>Pending: {dashboardStats.stores.pending}</span>
              </div>
              <div className="flex justify-between">
                <span>Blocked: {dashboardStats.stores.blocked}</span>
                <span>Inactive: {dashboardStats.stores.inactive}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payouts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ${dashboardStats.financial.pending_payouts.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                Manage Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/admin/orders">
                <ShoppingBag className="h-6 w-6 mb-2" />
                Manage Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/admin/stores">
                <Store className="h-6 w-6 mb-2" />
                Manage Stores
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      {/* Recent Activities */}
<Card className="border-0 shadow-sm">
  <CardHeader className="pb-3 border-b">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold flex items-center">
        <Activity className="h-5 w-5 mr-2 text-primary" />
        Recent Activities
      </CardTitle>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Link href="/admin/activities" className="flex items-center text-sm">
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    <div className="divide-y divide-border">
      {recentActivities.length > 0 ? (
        recentActivities.map((activity) => {
          const statusColors = {
            success: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
          };

          const statusIcons = {
            success: <CheckCircle className="h-4 w-4" />,
            pending: <Clock className="h-4 w-4" />,
            failed: <XCircle className="h-4 w-4" />,
            cancelled: <Ban className="h-4 w-4" />
          };

          return (
            <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    statusColors[activity.status as keyof typeof statusColors] || 'bg-gray-100'
                  }`}>
                   {statusIcons[activity.status as keyof typeof statusIcons] || <Activity className="h-4 w-4" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.status}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">
                      {activity.title}
                    </h4>
                    <div className="mr-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {activity.description?.amount && (
                        <p className="font-medium text-foreground">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(activity.description.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                  {activity.description?.method && (
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground mr-2">
                        {activity.description.method}
                      </span>
                      
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-3">
            <Activity className="h-full w-full opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground">No recent activities</p>
          <p className="text-xs text-muted-foreground mt-1">Activities will appear here</p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
    </div>
  )
}
