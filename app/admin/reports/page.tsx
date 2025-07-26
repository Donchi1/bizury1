"use client"

import { useState, useEffect } from "react"
import { Download, DollarSign, Users, BarChart3, Calendar, Filter, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import  useAdminStore  from "@/lib/store/admin/adminStore"
import { useAdminOrdersStore } from "@/lib/store/admin/ordersStore"
import { useAdminProductsStore } from "@/lib/store/admin/productsStore"
import { format } from "date-fns"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import InnerLoading from "@/components/layout/InnerLoading"

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("financial")
  const [timeRange, setTimeRange] = useState("30days")
  const [reportType, setReportType] = useState("summary")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Get data from stores
  const { dashboardStats, fetchDashboardData, recentActivities } = useAdminStore()
  const { orders, fetchOrders } = useAdminOrdersStore()
  const { products, fetchProducts } = useAdminProductsStore()

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchOrders(),
          fetchProducts()
        ])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchDashboardData, fetchOrders, fetchProducts, toast])

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "financial":
        return dashboardStats?.financial ? [
          { store: "Total Revenue", commission: dashboardStats.financial.total_revenue, rate: 0 },
          { store: "Monthly Revenue", commission: dashboardStats.financial.monthly_revenue, rate: 0 },
          { store: "Pending Payouts", commission: dashboardStats.financial.pending_payouts, rate: 0 }
        ] : []
      case "sales":
        // Get top 5 products by price as a simple example
        return products && products.length > 0 
          ? [...products]
              .sort((a, b) => (b.initial_price || 0) - (a.initial_price || 0))
              .slice(0, 5)
              .map(p => ({
                name: p.title,
                sales: p.bought_past_month || 0,
                revenue: (p.initial_price || 0) * (p.bought_past_month || 0),
                growth: 0 // You would calculate this based on historical data
              }))
          : []
      case "customer":
        // Simple customer segments based on order counts
        return dashboardStats?.users ? [
          { segment: "Total Customers", count: dashboardStats.users.total, avg_value: 0 },
          { segment: "Active Customers", count: dashboardStats.users.active, avg_value: 0 },
          { segment: "New Today", count: dashboardStats.users.new_today, avg_value: 0 }
        ] : []
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  const totalPages = Math.ceil(currentData.length / itemsPerPage)
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when changing tabs
  }, [activeTab])

  const generateReport = async (type: string, format: string = "json") => {
    setIsLoading(true)
    try {
      const reportData = {
        financial: {
          total_revenue: dashboardStats?.financial?.total_revenue || 0,
          monthly_revenue: dashboardStats?.financial?.monthly_revenue || 0,
          pending_payouts: dashboardStats?.financial?.pending_payouts || 0,
          commissions: currentData,
        },
        sales: {
          top_products: currentData,
          total_products: products?.length || 0,
          total_revenue: dashboardStats?.financial?.total_revenue || 0,
        },
        customer: {
          total_customers: dashboardStats?.users?.total || 0,
          active_customers: dashboardStats?.users?.active || 0,
          new_customers_today: dashboardStats?.users?.new_today || 0,
          customer_segments: currentData,
        },
        generated_at: new Date().toISOString(),
        time_range: timeRange,
        report_type: reportType,
      }

      if (format === "csv") {
        // Generate CSV format
        let csvContent = "data:text/csv;charset=utf-8,"
        
        if (type === "financial") {
          csvContent += "Metric,Value\n" +
            `Total Revenue,${reportData.financial.total_revenue}\n` +
            `Monthly Revenue,${reportData.financial.monthly_revenue}\n` +
            `Pending Payouts,${reportData.financial.pending_payouts}`
        } else if (type === "sales") {
          csvContent = "Product,Sales,Revenue\n" +
            (reportData.sales.top_products || []).map((product: any) => 
              `"${product.name}",${product.sales},${product.revenue}`
            ).join("\n")
        } else if (type === "customer") {
          csvContent = "Segment,Count\n" +
            (reportData.customer.customer_segments || []).map((segment: any) => 
              `"${segment.segment}",${segment.count}`
            ).join("\n")
        }
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${type}-report-${timeRange}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Generate JSON format
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-report-${timeRange}.json`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast({
        title: "Report Generated",
        description: `${type} report has been generated and downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchOrders(),
        fetchProducts()
      ])
      toast({
        title: "Data Refreshed",
        description: "Report data has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600">Generate and view detailed financial and business reports</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => generateReport(activeTab, "json")} 
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={() => generateReport(activeTab, "csv")} 
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="sales">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="customer">
            <Users className="h-4 w-4 mr-2" />
            Customer
          </TabsTrigger>
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardStats?.financial?.total_revenue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">All time revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardStats?.financial?.monthly_revenue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Current month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardStats?.financial?.pending_payouts?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Awaiting processing</div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Key financial metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right">${dashboardStats?.financial?.total_revenue?.toLocaleString() || '0'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monthly Revenue</TableCell>
                    <TableCell className="text-right">${dashboardStats?.financial?.monthly_revenue?.toLocaleString() || '0'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pending Payouts</TableCell>
                    <TableCell className="text-right">${dashboardStats?.financial?.pending_payouts?.toLocaleString() || '0'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.products?.total?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dashboardStats?.products?.active?.toLocaleString() || '0'} active
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.products?.out_of_stock?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.products?.pending_approval?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Awaiting review</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((item: any, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sales}</TableCell>
                        <TableCell>${item.revenue?.toLocaleString() || '0'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No sales data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Reports */}
        <TabsContent value="customer" className="space-y-6">
          {/* Customer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.users?.total?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">All time customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.users?.active?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Active this month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.users?.new_today?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">New signups</div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Breakdown of customers by segment</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((segment: any, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{segment.segment}</TableCell>
                        <TableCell>{segment.count?.toLocaleString() || '0'}</TableCell>
                        <TableCell>
                          {dashboardStats?.users?.total 
                            ? `${Math.round((segment.count / dashboardStats.users.total) * 100)}%` 
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No customer data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
