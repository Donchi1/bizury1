"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import NotificationRow from "./NotificationRow"
import { Bell } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useContentStore } from "@/lib/store/admin/contentStore"

export default function NotificationsTable() {
  const { notifications,adminNotifications, tab, selectedIds, selectAll } = useContentStore()
  const allSelected =  tab === "admin" ? adminNotifications.length > 0 && selectedIds.length === adminNotifications.length : notifications.length > 0 && selectedIds.length === notifications.length
  const someSelected =  tab === "admin" ? adminNotifications.length > 0 && selectedIds.length > 0 && selectedIds.length < adminNotifications.length : notifications.length > 0 && selectedIds.length > 0 && selectedIds.length < notifications.length



  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-2 text-sm font-medium">No notifications found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No Notifications Found. Please create or adjust your filters.
        </p>
      </div>
    )
  }

  return (

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={() => selectAll(!allSelected)}
                aria-label="Select all"
                className={cn("translate-y-[2px]", {
                  'opacity-50': someSelected
                })}

              />
            </TableHead>
            <TableHead>Notification</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tab === "admin" ? adminNotifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          )) : notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </TableBody>
      </Table>
  )
}
