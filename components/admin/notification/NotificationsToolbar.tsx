"use client"

import { CheckCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { BulkAction } from "../layout/BulkAction"
import { useContentStore } from "@/lib/store/admin/contentStore"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { ButtonLoading } from "@/components/ui/loading"

export default function NotificationsToolbar() {
  const { selectedIds, clearSelection, bulkMarkAsRead, bulkDelete, isLoading } = useContentStore()
  const [openDelete, setOpenDelete] = useState(false)

  const hasSelections = selectedIds.length > 0
  // const allSelected = tab === "admin" ? adminNotifications.length > 0 && selectedIds.length === adminNotifications.length : notifications.length > 0 && selectedIds.length === notifications.length


  const handleMarkAsRead = async () => {
    try {
      await bulkMarkAsRead()
      toast.success(`Marked ${selectedIds.length} notifications as read`)
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const handleDelete = () => {
    setOpenDelete(true)
  }


  const confirmDelete = async () => {

    try {
      await bulkDelete()
      toast.success(`Deleted ${selectedIds.length} notifications`)
    } catch (error) {
      toast.error("Failed to delete notifications")
    }
  }

  return (
    <>
      {hasSelections && (
        <BulkAction
          actions={[
            {
              label: "Mark as read",
              value: "read",
              icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            },
            {
              label: "Delete",
              value: "delete",
              icon: <Trash2 className="h-4 w-4 text-red-500" />,
            },
          ]}
          selectedCount={selectedIds.length}
          onClearSelection={clearSelection}
          onBulkAction={(action) => action === "read" ? handleMarkAsRead() : handleDelete()}
          title="Bulk Actions"
        />

      )}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your notification and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDelete(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {isLoading ? <ButtonLoading text="Deleting..." /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
