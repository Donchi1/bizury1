"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import { useNotificationStore } from "@/lib/store/notificationStore"
import useAdminStore, { type SearchResults } from "@/lib/store/admin/adminStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, LogOut, Wallet, Banknote, DollarSign } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Store,
  CreditCard,
  MessageSquare,
  FileText,
  TrendingUp,
  Shield,
  Settings as SettingIcon,
  Menu as MenuIcon,
  X,
  Bell as BellIcon,
  User as UserIcon,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth"
import { signOut } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Stores", href: "/admin/stores", icon: Store },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  {name: "Notifications", href: "/admin/notifications", icon: BellIcon},
  {name: "Contacts", href: "/admin/contacts", icon: MessageSquare},
  {name: "Cards", href: "/admin/cards", icon: CreditCard},
  {name: "Wallets", href: "/admin/wallets", icon: Wallet},
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Reports", href: "/admin/reports", icon: TrendingUp },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
]

// Search Results Component
const SearchResults = ({ results, loading, onSelect }: { results: SearchResults[], loading: boolean, onSelect: (result: SearchResults) => void }) => {
  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Searching...
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No results found
      </div>
    )
  }

  return (
    <div className="py-2">
      {results.map((result) => (
        <div
          key={result.id}
          className="px-4 py-2 hover:bg-accent cursor-pointer"
          onClick={() => onSelect(result)}
        >
          <div className="font-medium">{result.title}</div>
          <div className="text-xs text-muted-foreground">
            {result.type}
          </div>
        </div>
      ))}
    </div>
  )
}

// Notifications Dropdown
const NotificationsDropdown = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore()
  const { user } = useAuthStore()
  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)
    }
  }, [user?.id])

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user?.id) {
      await markAllAsRead(user.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex justify-between items-center px-2 py-1.5">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`px-2 py-2 ${!notification.is_read ? 'bg-accent/50' : ''}`}
                onClick={(e) => handleMarkAsRead(notification.id, e)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// User Dropdown
const UserDropdown = () => {
  const { profile } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  if (!profile) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt={profile.email} />
            <AvatarFallback>
              {profile.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{profile?.username}</div>
          <div className="text-xs text-muted-foreground">
            {profile?.role || 'Admin'}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/admin')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Overview</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
          <SettingIcon className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState<SearchResults[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { search } = useAdminStore()
  const { profile } = useAuthStore()



  useEffect(() => {
    if (!profile){
      router.replace('/auth/signin')
    }
    if(profile?.role !== 'admin'){
      router.replace('/dashboard')
    }
  }, [profile])

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await search(debouncedSearch)
        setSearchResults(results)
      } catch (error) {
        toast.error('Failed to perform search')
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearch, search])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('')
        setSearchResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSelect = (result: any) => {
    // Handle navigation based on result type
    // Example: router.push(`/admin/${result.type}/${result.id}`)
    setSearchQuery('')
    setSearchResults([])
  }

  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-red-100 text-red-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-red-100 text-red-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex min-h-full flex-col">
          <header className="bg-white shadow">
            <div className=" px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden mr-2"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900 lg:block hidden">Dashboard</h1>
                </div>

                <div className="flex-1 max-w-2xl px-4 relative" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users, products, orders..."
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {(searchResults.length > 0 || isSearching) && (
                      <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md shadow-lg border">
                        <SearchResults
                          results={searchResults}
                          loading={isSearching}
                          onSelect={handleSearchSelect}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <NotificationsDropdown />
                  <UserDropdown />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
