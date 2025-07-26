"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  User,
  ShoppingBag,
  CreditCard,
  MapPin,
  MessageSquare,
  Bell,
  Wallet,
  Store,
  Settings,
  Package,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Building,
  Newspaper,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  FileText,
  Heart,
  Menu,
  StoreIcon,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuthStore } from "@/lib/store/auth"
import { useWithdrawalStore } from "@/lib/store/withdrawalStore"
import { useRechargeStore } from "@/lib/store/rechargeStore"
import { useOrderStore } from "@/lib/store/orderStore"
import { Profile } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSellingStore } from "@/lib/store/sellingStore"


const customerMenuItems = [
  { icon: Home, label: "Dashboard Overview", href: "/dashboard", count: null },
  { icon: User, label: "My Account", href: "/dashboard/account", count: null },
  { icon: DollarSign, label: "Current Balance", href: "/dashboard/balance", count: null },
  { icon: Wallet, label: "Wallet Management", href: "/dashboard/wallet", count: null },
  { icon: CreditCard, label: "Card Management", href: "/dashboard/cards", count: null },
  { icon: FileText, label: "Billing Details", href: "/dashboard/billing", count: null },
  { icon: ShoppingBag, label: "My Orders", href: "/dashboard/orders", count: null },
  { icon: TrendingUp, label: "Recharge Records", href: "/dashboard/recharge", count: null },
  { icon: TrendingDown, label: "Withdrawal Records", href: "/dashboard/withdrawals", count: null },
  { icon: MessageSquare, label: "My Messages", href: "/dashboard/messages", count: null },
  { icon: Bell, label: "Site Notifications", href: "/dashboard/notifications", count: null },
  { icon: MapPin, label: "Shipping Address", href: "/dashboard/addresses", count: null },
  { icon: StoreIcon, label: "Apply For Merchant", href: "/dashboard/apply-merchant", count: null },
  { icon: Heart, label: "Followed Stores", href: "/dashboard/followed-stores", count: null },
  { icon: Eye, label: "Browsing History", href: "/dashboard/browsing-history", count: null },
]

const merchantMenuItems = [
  { icon: Building, label: "Wholesale Center", href: "/dashboard/wholesale", count: null },
]

const sellerMenuItems = [
  { icon: Store, label: "My Shop", href: "/dashboard/shop", count: null },
  { icon: Newspaper, label: "Store News", href: "/dashboard/shop/news", count: null },
  { icon: Package, label: "Product Management", href: "/dashboard/shop/products", count: null },
  { icon: ShoppingCart, label: "Store Order Management", href: "/dashboard/shop/orders", count: null },
  { icon: MessageSquare, label: "Customer Messages", href: "/dashboard/shop/messages", count: null },
  { icon: Settings, label: "Shop Settings", href: "/dashboard/shop/edit", count: null },
]

const adminMenuItems = [
  { icon: Users, label: "Users", href: "/dashboard/admin/users", count: null },
  { icon: Package, label: "Products", href: "/dashboard/admin/products", count: null },
  { icon: ShoppingBag, label: "Orders", href: "/dashboard/admin/orders", count: null },
  { icon: Store, label: "Stores", href: "/dashboard/admin/stores", count: null },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics", count: null },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", count: null },
]

function SidebarContent({ menuItems, profile, pathname, onLinkClick }: {
  menuItems: any[],
  profile: Profile,
  pathname: string,
  onLinkClick: React.MouseEventHandler<HTMLAnchorElement> | undefined,
}) {

  return (
    <>
      {/* User Info */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16  rounded-full flex items-center justify-center text-black font-bold text-xl">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{profile?.full_name || "User"}</h3>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={profile?.is_verified ? "default" : "secondary"} className="text-xs">
              {profile?.is_verified ? "Verified" : "Unverified"}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {profile?.role}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Menu */}
      <nav className="space-y-1 max-h-96 overflow-y-auto">
        {menuItems.map((item: any) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onLinkClick}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left hover:bg-orange-50 hover:text-orange-600 ${isActive ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500" : ""
                  }`}
              >
                <item.icon className={`h-4 w-4 mr-3 ${isActive ? "text-orange-600" : ""}`} />
                <span className={`flex-1 text-xs ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
                {item.count && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.count}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Wallet Balance */}
      <Separator className="my-6" />
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Wallet Balance</p>
            <p className="text-2xl font-bold">${profile?.wallet_balance?.toFixed(2) || "0.00"}</p>
          </div>
          <Wallet className="h-8 w-8 opacity-80" />
        </div>
        <Button size="sm" variant="secondary" className="w-full mt-3" asChild>
          <Link href="/dashboard/wallet" onClick={onLinkClick}>
            Manage Wallet
          </Link>
        </Button>
      </div>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuthStore()
  const { getWithdrawalsByUser } = useWithdrawalStore()
  const { getRechargesByUser } = useRechargeStore()
  const { fetchOrdersByUser } = useOrderStore()
  const { fetchStoreByUser } = useSellingStore()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()


  useEffect(() => {
    if (!profile) return
    getRechargesByUser(profile.id)
    getWithdrawalsByUser(profile.id)
    fetchOrdersByUser(profile.id)
    if(profile?.role === "merchant"){
      fetchStoreByUser(profile.id)
    }
  }, [loading, profile, getWithdrawalsByUser, fetchStoreByUser, getRechargesByUser, fetchOrdersByUser])


  const getMenuItems = () => {
    const baseItems = [...customerMenuItems]


    if (profile?.role === "merchant" || profile?.role === "admin" || profile?.role === "manager") {
      baseItems.filter(each => each.href !== "/dashboard/apply-merchant")
      baseItems.push(...sellerMenuItems)
      baseItems.push(...merchantMenuItems)
    }

    if (profile?.role === "admin" || profile?.role === "manager") {
      baseItems.filter(each => each.href !== "/dashboard/apply-merchant")
      baseItems.push(...adminMenuItems)
    }

    return baseItems
  }

  const menuItems = getMenuItems()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400"></div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm">
            <Avatar className="size-full">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{profile?.full_name || "User"}</h3>
              <p className="text-xs text-gray-500">${profile?.wallet_balance?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>Dashboard Menu</SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <SidebarContent
                  menuItems={menuItems}
                  profile={profile!}
                  pathname={pathname}
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <SidebarContent menuItems={menuItems} profile={profile!} pathname={pathname} onLinkClick={() => { }} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
