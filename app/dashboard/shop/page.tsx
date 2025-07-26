"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Store, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Eye,
  Edit,
  Star,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/store/auth"
import { PageLoading, ButtonLoading } from "@/components/ui/loading"
import Image from "next/image"
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useSellingStore } from "@/lib/store/sellingStore"
import { Product } from "@/lib/types"
import InnerLoading from "@/components/layout/InnerLoading"

interface StoreData {
  id: string
  store_name: string
  store_description: string
  store_logo: string
  store_banner: string
  status: 'active' | 'pending' | 'blocked'
  store_level: number
  account_balance: number
  products: any[]
  followers: string[]
  contact_email: string
  contact_phone: string
  website_url: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  is_verified: boolean
  created_at: string
}

interface StoreMetrics {
  totalSales: number
  totalSalesToday: number
  totalOrders: number
  todayOrders: number
  cumulativeOrderQuantity: number
  salesProfit: number
  todayProfit: number
  numberOfProducts: number
  numberOfFollowers: number
  averageRating: number
  totalReviews: number
}

export default function MyStorePage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { store, loading, error, fetchStoreByUser } = useSellingStore()
  const [timeRange, setTimeRange] = useState("today")
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id)return 
    (async () => {
       setLocalLoading(true)
      await fetchStoreByUser(profile.id)
      setLocalLoading(false)
    })()
  }, [profile?.id,setLocalLoading, fetchStoreByUser])

  console.log(store)

  // Metrics
  const metrics = store ? {
    totalSales: store.products?.reduce((sum, p) => sum + ((p.final_price || 0) * (p.bought_past_month || 0)), 0),
    totalOrders: store.products?.reduce((sum, p) => sum + (p.bought_past_month || 0), 0),
    todayOrders: 0, // Needs per-day data
    cumulativeOrderQuantity: store.products?.reduce((sum, p) => sum + (p.bought_past_month || 0), 0),
    salesProfit: 0, // Needs cost/profit data
    todayProfit: 0, // Needs per-day data
    numberOfProducts: store.products?.length,
    numberOfFollowers: store.followers?.length || 0,
    averageRating: store.products?.length ? (store.products?.reduce((sum, p) => sum + (p.rating || 0), 0) / store.products?.length) : 0,
    totalReviews: store.products?.reduce((sum, p) => sum + (p.reviews_count || 0), 0),
  } : null;

  // Chart Data (static, or aggregate if you have per-date sales)
  const chartData = [
    { date: "This Month", sales: metrics?.totalSales || 0, orders: metrics?.totalOrders || 0, profit: metrics?.salesProfit || 0 }
  ];

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-3))",
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (localLoading) return <InnerLoading />

  if (!store || !metrics) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
        <p className="text-gray-600 mb-6">You don't have a store yet. Create one to get started.</p>
        <Button onClick={() => router.push("/dashboard/apply-merchant")}>Create Store</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary to-primary/90 rounded-lg overflow-hidden">
          <Image width={800} height={800} 
            src={store.banner_url || "/images/image-23.jpg"} 
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        <div className="absolute bottom-4 left-6 flex items-end space-x-4">
          <Avatar className="h-20 w-20 border-4 border-white">
            <AvatarImage src={store.logo_url} alt={store.name} />
            <AvatarFallback className="text-2xl font-bold bg-orange-500 text-white">
              {store.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <Badge className={getStatusColor(store.status)}>
                {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
              </Badge>
              {store.is_verified && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Star className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-orange-100">{store.description}</p>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/shop/edit")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Store
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/shop/messages")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages & Orders
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(store.total_sales)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Store Level</p>
                <p className="text-2xl font-bold text-blue-600">Level {store.rating}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.numberOfProducts}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold text-pink-600">{metrics.numberOfFollowers}</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Overview</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics?.totalSales!)}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Today's Sales</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.todayProfit)}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(metrics.totalOrders!)}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(metrics.todayOrders)}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Sales Profit</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.salesProfit)}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Today's Profit</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.todayProfit)}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Order Quantity</p>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(metrics.cumulativeOrderQuantity!)}</p>
                  <p className="text-xs text-muted-foreground">Units sold</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <p className="text-2xl font-bold text-yellow-600">{metrics.averageRating.toFixed(1)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">({Math.round(metrics.totalReviews || 0)} reviews)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <p className="font-medium">{store.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{store.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{store.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {store.address}, {store.city}, {store.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(store.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

         
        </div>
      </div>
      <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="gap-2 flex-col lg:flex-row flex justify-between items-center">
              <Button className="w-full" onClick={() => router.push("/dashboard/wholesale")}>
                <Package className="h-4 w-4 mr-2" />
                Add Products
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/shop/orders")}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Manage Orders
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/shop/messages")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Customer Messages
              </Button>
            </CardContent>
          </Card>
      {/* Recent Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Products</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/shop/products")}>View All</Button>
              <Button size="sm" onClick={() => router.push("/dashboard/wholesale")}>Add Products</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(store.products as Product[])?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {store.products?.slice(0, 3).map((product) => (
                <div key={product.asin} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{product.title}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/shop/products?product=${product.asin}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(product.final_price || 0)}</p>
                  <p className="text-sm text-muted-foreground">Stock: {product.availability} units</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No products added yet</p>
              <Button onClick={() => router.push("/dashboard/wholesale")}>Add Your First Product</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Performance</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          {payload.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs font-medium">
                                {item.name}: ${item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#salesGradient)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#ordersGradient)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                fill="url(#profitGradient)"
                fillOpacity={0.3}
              />
              <ChartLegend
                content={({ payload }) => (
                  <div className="flex items-center justify-center gap-6 pt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
} 