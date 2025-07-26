"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AlertCircle, Check, Trash2, MoreHorizontal, Mail, Bell, AlertTriangle, CheckCircle } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import { useContentStore } from "@/lib/store/admin/contentStore"
import { Notification } from "@/lib/store/notificationStore"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'account':
      return <Bell className="h-4 w-4 text-blue-500" />
    case 'transaction':
      return <Check className="h-4 w-4 text-emerald-500" />
    default:
      return <Mail className="h-4 w-4 text-gray-500" />
  }
}

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'alert':
      return 'destructive'
    case 'account':
      return 'outline'
    case 'transaction':
      return 'default'
    default:
      return 'secondary'
  }
}

export default function NotificationRow({ notification }: { notification: Notification }) {
  const { selectedIds, toggleSelect, deleteNotification, updateNotification } = useContentStore()
  const isSelected = selectedIds.includes(notification.id)
  
  const handleRead = async (read: boolean) => {
    try {
      await updateNotification(notification.id, { 
        is_read: read,
        updated_at: new Date().toISOString()
      })
      toast.success('Marked as read')
    } catch (error) {
      toast.error('Failed to update notification')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this notification?')) return
    
    try {
      await deleteNotification(notification.id)
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  return (
    <TableRow >
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelect(notification.id)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("font-medium truncate", {
                'font-semibold': !notification.is_read
              })}>
                {notification.title}
              </p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {notification.message}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getTypeBadgeVariant(notification.type)}>
          {notification.type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={notification.is_read ?   'default' : 'outline'}>
          {notification.is_read ? 'Read' : 'Unread'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {!notification.is_read ? (
              <DropdownMenuItem onClick={() => handleRead(true)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Set as read</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleRead(false)}>
                <CheckCircle className="mr-2 h-4 w-4 text-amber-500" />
                <span>Set as unread</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
