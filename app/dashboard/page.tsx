"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Package, CreditCard, TrendingUp, Star,Wallet2, Clock, CheckCircle, Truck, Wallet, ShoppingCart, Heart, Banknote } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth"
import Link from "next/link"
import { useCartStore } from "@/lib/store/cartStore"
import { useWishlistStore } from "@/lib/store/whiteListstore"
import { useWithdrawalStore } from "@/lib/store/withdrawalStore"
import { useOrderStore } from "@/lib/store/orderStore"
import { formatPrice } from "@/lib/utils"
import InnerLoading from "@/components/layout/InnerLoading"


const quickActions = [
  { icon: ShoppingBag, label: "Track Orders", href: "/dashboard/orders", color: "bg-blue-500" },
  { icon: Banknote, label: "Add Payment", href: "/dashboard/recharge", color: "bg-green-500" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet", color: "bg-orange-500" },
  { icon: CreditCard, label: "Cards", href: "/dashboard/cards", color: "bg-purple-500" },
]

export default function DashboardPage() {
  const { profile, user, loading:profileLoading } = useAuthStore()
  const { getTotalItems, getTotalPrice } = useCartStore()
  const { getWishlistCount } = useWishlistStore()
  const {getWithdrawalsByStatus} = useWithdrawalStore()
   const {loading: orderLoading, orders, getLatestOrders} = useOrderStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  
  // Use fallback data if profile is not loaded
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const walletBalance = profile?.wallet_balance || 0
  
  
  
  const totalPendingWithdrawals = getWithdrawalsByStatus("pending")?.reduce((acc, init) =>   acc + init.amount, 0) || 0;
  const latestOrders =  getLatestOrders(profile?.id!)
  
  
  if (orderLoading || profileLoading) return <InnerLoading />

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
        <p className="text-orange-100">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold">{getTotalItems()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href="/checkout">View Cart</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatPrice(profile?.wallet_balance || 0)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/balance">View Balance</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold">{getWishlistCount()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href="/wishlist">View Wishlist</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
                <p className="text-2xl font-bold">{formatPrice(totalPendingWithdrawals)}</p>{/* Replace with dynamic value if available */}
              </div>
              <Wallet className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/withdrawals">View Withdrawals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`${action.color} p-3 rounded-full text-white mb-3`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest order activity</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">View All Orders</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(latestOrders?.length as number) > 0  && latestOrders?.map((order) => (
              <div key={order.id} className="flex items-center gap-4 lg:gap-0 flex-col lg:flex-row justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} • {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-normal space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total_amount)}</p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/orders/${order.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - Remove this in production */}
      {/* <Card className="border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">Debug Info (Remove in production)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 space-y-1">
            <p>User: {user ? "✅ Loaded" : "❌ Not loaded"}</p>
            <p>Profile: {profile ? "✅ Loaded" : "❌ Not loaded"}</p>
            <p>Email: {user?.email || "Not available"}</p>
            <p>Name: {profile?.full_name || "Not available"}</p>
            <p>Role: {profile?.role || "Not available"}</p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
