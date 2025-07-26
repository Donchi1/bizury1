"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Trash2, Settings, Filter, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNotificationStore } from "@/lib/store/notificationStore"
import { useAuthStore } from "@/lib/store/auth"

export default function NotificationsPage() {
  const { profile } = useAuthStore()
  const userId = profile?.id
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications,
    unsubscribe,
  } = useNotificationStore()
  const [filterType, setFilterType] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchNotifications(userId)
      subscribeToNotifications(userId)
      return () => unsubscribe()
    }
  }, [userId])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800"
      case "promotion":
        return "bg-green-100 text-green-800"
      case "payment":
        return "bg-purple-100 text-purple-800"
      case "message":
        return "bg-orange-100 text-orange-800"
      case "security":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return "📦"
      case "promotion":
        return "🎉"
      case "payment":
        return "💳"
      case "message":
        return "💬"
      case "security":
        return "🔒"
      default:
        return "🔔"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === "all") return true
    if (filterType === "unread") return !notification.is_read
    return notification.type === filterType
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Add the handleViewDetails function
  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your orders, messages, and account activity
            {unreadCount > 0 && <Badge className="ml-2 bg-orange-500">{unreadCount} unread</Badge>}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => userId && markAllAsRead(userId)} disabled={loading}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {/* <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button> */}
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter((n) => n.type === "order").length}
            </div>
            <div className="text-sm text-gray-600">Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.type === "promotion").length}
            </div>
            <div className="text-sm text-gray-600">Promotions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {notifications.filter((n) => n.type === "message").length}
            </div>
            <div className="text-sm text-gray-600">Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="order">Orders</SelectItem>
            <SelectItem value="promotion">Promotions</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading notifications...</h3>
              <p className="text-gray-500">Please wait while we fetch your notifications.</p>
            </CardContent>
          </Card>
        ) : filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-all hover:shadow-md ${!notification.is_read ? "border-orange-200 bg-orange-50" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      <Badge className={getTypeColor(notification.type)} variant="secondary">
                        {notification.type}
                      </Badge>
                      {!notification.is_read && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!notification.is_read && (
                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {notification.data?.actionUrl && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(notification)}>
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {filterType === "all"
                ? "You're all caught up! No notifications to show."
                : `No ${filterType} notifications found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add the details modal at the end of the component before the closing div */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotification?.message}
              <br />
              {selectedNotification?.created_at && (
                <span className="text-sm text-gray-500">{new Date(selectedNotification.created_at).toLocaleString()}</span>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
