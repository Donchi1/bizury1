"use client"

import { useState, useEffect } from "react"
import { Bell, AlertCircle, CheckCircle, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NotificationsTable from "@/components/admin/notification/NotificationsTable"
import NotificationsToolbar from "@/components/admin/notification/NotificationsToolbar"
import { useContentStore } from "@/lib/store/admin/contentStore"
import { CardStats } from "@/components/ui/card-stats"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store/auth"
import { Notification } from "@/lib/store/notificationStore"
import InnerLoading from "@/components/layout/InnerLoading"

type TabType = 'admin' | 'users'

export default function NotificationsPage() {
  const { notifications, fetchNotifications, setTab, tab, fetchAdminNotifications, adminNotifications } = useContentStore()
  const { profile } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])


  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedOrders = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const stats = {
    total: notifications.length + adminNotifications.length,
    unread: notifications.filter(n => !n.is_read).length + adminNotifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length + adminNotifications.filter(n => n.is_read).length,
    adminNotifications: adminNotifications.length,
    notifications: notifications.length,
  }

  // Apply tab filter
  useEffect(() => {
    const filter = tab === "admin" ? adminNotifications : notifications

    const filtered = filter.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || statusFilter === "read" ? notification.is_read : !notification.is_read

      return matchesSearch && matchesStatus
    })
    setFilteredNotifications(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [notifications, adminNotifications, searchTerm, statusFilter])

  // Initial data fetch
  useEffect(() => {
    loadNotifications()
  }, [fetchNotifications, fetchAdminNotifications])

  const loadNotifications = async () => {
    try {
      setLocalLoading(true)
      await fetchNotifications()
      await fetchAdminNotifications(profile?.id!)
      setLocalLoading(false)
    } catch (error) {
      toast.error('Failed to load notifications')
      setLocalLoading(false)
    }
  }

  if (localLoading) {
    return <InnerLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage and monitor system notifications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <CardStats
          title="Admin Notifications"
          value={stats.adminNotifications}
          description="Admin notifications"
          icon={<Bell />}
          textColor="text-gray-600"
          iconBgColor="bg-gray-100"
          borderColor="border-gray-200"
        />
        <CardStats
          title="Users Notifications"
          value={stats.notifications}
          description="User notifications"
          icon={<Bell />}
          textColor="text-blue-600"
          iconBgColor="bg-blue-100"
          borderColor="border-gray-200"
          
        />
        <CardStats
          title="Unread Notifications"
          value={stats.unread}
          description="Unread notifications"
          icon={<AlertCircle />}
          textColor="text-red-600"
          iconBgColor="bg-red-100"
          borderColor="border-gray-200"
        />
        <CardStats
          title="Read Notifications"
          value={stats.read}
          description="Read notifications"
          icon={<CheckCircle />}
          textColor="text-green-600"
          iconBgColor="bg-green-100"
          borderColor="border-gray-200"
        />

      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <TabsList>
            <TabsTrigger className="w-full lg:w-auto" value="admin">Admin</TabsTrigger>
            <TabsTrigger className="w-full lg:w-auto" value="users">Users</TabsTrigger>
          </TabsList>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Input
              placeholder="Search notifications..."
              className="w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'read' | 'unread')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={tab} className="space-y-4">
          <Card>
            <CardHeader className="px-4">
              <CardTitle className="text-lg">Notifications</CardTitle>

            </CardHeader>
            <CardContent className="px-0">
              <NotificationsToolbar />
              <NotificationsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}