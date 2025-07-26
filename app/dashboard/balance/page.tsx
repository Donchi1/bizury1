"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store/auth"
import { useRechargeStore } from "@/lib/store/rechargeStore"
import { useOrderStore } from "@/lib/store/orderStore"
import { useWithdrawalStore } from "@/lib/store/withdrawalStore"
import { formatDate } from "date-fns"
import { startOfMonth, subMonths, isAfter, isBefore, endOfMonth } from "date-fns"



export default function BalancePage() {
  const [showBalance, setShowBalance] = useState(true)
  const { profile, user } = useAuthStore()
  const {recharges, getRechargesByStatus}  = useRechargeStore()
  const {orders, getOrdersByStatus} = useOrderStore()
  const { withdrawals } = useWithdrawalStore();

  const totalDeposits = useMemo(() => {
    return getRechargesByStatus("success")
    .reduce((sum, a) => sum + a.amount, 0)
  }, [recharges])

  const totalSpent = useMemo(() => {
    return getOrdersByStatus?.("confirmed")!
    .reduce((sum, a) => sum + Math.abs(a.total_amount), 0)
  }, [orders])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "purchase":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />
    }
  }

  // Normalize to a common structure
  const normalizedWithdrawals = [...withdrawals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)
    .map(w => ({
      id: w.id,
      type: "withdrawal",
      amount: -Math.abs(w.amount), // withdrawals are negative
      description: `Withdrawal via ${w.method}`,
      date: w.created_at,
      status: w.status,
    }));

  const normalizedOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)
    .map(o => ({
      id: o.id,
      type: "order",
      amount: -Math.abs(o.total_amount), // orders are negative
      description:`Order ${o.order_number || o.id}`,
      date: o.created_at,
      status: o.status,
    }));

  const normalizedRecharges = [...recharges]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)
    .map(r => ({
      id: r.id,
      type: "recharge",
      amount: Math.abs(r.amount), // recharges are positive
      description: r.description || `Recharge via ${r.method}`,
      date: r.created_at,
      status: r.status,
    }));

  // Combine and sort all together
  const recentActivity = [
    ...normalizedWithdrawals,
    ...normalizedOrders,
    ...normalizedRecharges,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = new Date();
  const months = [0, 1, 2].map(i => subMonths(now, i));

  // Helper: get all orders in a given month
  function getOrdersForMonth(monthDate: Date) {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return orders.filter(o => {
      const d = new Date(o.created_at);
      return isAfter(d, start) && isBefore(d, end);
    });
  }

  // Calculate spending for each of the last 3 months
  const monthlySpendings = months.map(monthDate => {
    const monthOrders = getOrdersForMonth(monthDate);
    return monthOrders.reduce((sum, o) => sum + Math.abs(o.total_amount), 0);
  });

  const averageMonthlySpending =
    monthlySpendings.length > 0
      ? monthlySpendings.reduce((a, b) => a + b, 0) / monthlySpendings.length
      : 0;

  const thisMonthSpending = monthlySpendings[0] || 0;
  const savingsThisMonth = averageMonthlySpending - thisMonthSpending;
  const recommendedTopUp = averageMonthlySpending;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Current Balance</h1>
        <p className="text-gray-600">Your real-time account balance and recent activity</p>
      </div>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-2">Available Balance</p>
              <div className="flex items-center space-x-4">
                <p className="text-5xl font-bold">
                  {showBalance ? `$${profile?.wallet_balance?.toFixed(2) || "0.00"}` : "••••••"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/20"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-orange-100 mt-2">Last updated: {formatDate(new Date(profile?.updated_at!), "MMM d, yyyy")}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-orange-100 text-sm">Account Status</p>
                <Badge className="bg-green-500 text-white mt-1">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">${totalDeposits.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-blue-600">${totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-purple-600">${profile?.wallet_balance.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your balance with these quick actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" asChild>
              <a href="/dashboard/recharge">
                <TrendingUp className="h-6 w-6" />
                <span>Add Funds</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href="/dashboard/withdrawals">
                <TrendingDown className="h-6 w-6" />
                <span>Withdraw</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href="/dashboard/wallet">
                <CreditCard className="h-6 w-6" />
                <span>Manage Wallets</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href="/dashboard/cards">
                <CreditCard className="h-6 w-6" />
                <span>Manage Cards</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest balance changes</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/recharge">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${activity.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {activity.amount > 0 ? "+" : ""}${Math.abs(activity.amount).toFixed(2)}
                  </p>
                  <Badge className="bg-green-100 text-green-800 text-xs">{activity.status}</Badge>
                </div>
              </div>
            )): (
              <p className="text-center text-gray-500">No recent activity yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Balance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Insights</CardTitle>
          <CardDescription>Understanding your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Average Monthly Spending</p>
                <p className="text-sm text-blue-700">Based on last 3 months</p>
              </div>
              <p className="text-xl font-bold text-blue-900">${averageMonthlySpending.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Savings This Month</p>
                <p className="text-sm text-green-700">Compared to average</p>
              </div>
              <p className="text-xl font-bold text-green-900">{savingsThisMonth >= 0 ? "+" : "-"}${Math.abs(savingsThisMonth).toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-900">Recommended Top-up</p>
                <p className="text-sm text-orange-700">To maintain balance</p>
              </div>
              <p className="text-xl font-bold text-orange-900">${recommendedTopUp.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
