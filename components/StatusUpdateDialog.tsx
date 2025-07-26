"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface StatusUpdateDialogProps<T> {
  item: T & { id: string; status: string }
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => Promise<void>
  type: 'transaction' | 'payout'
  statusOptions?: Array<{ value: string; label: string }>
}

export function StatusUpdateDialog<T>({
  item,
  onClose,
  onUpdateStatus,
  type,
  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]
}: StatusUpdateDialogProps<T>) {
  const [status, setStatus] = useState(item.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === item.status) {
      onClose()
      return
    }

    try {
      setIsUpdating(true)
      await onUpdateStatus(item.id, status)
      toast({
        title: "Success",
        description: `${type === 'transaction' ? 'Transaction' : 'Payout'} status updated successfully.`,
      })
      onClose()
    } catch (error) {
      console.error(`Error updating ${type} status:`, error)
      toast({
        title: "Error",
        description: `Failed to update ${type} status. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update {type} status</DialogTitle>
          <DialogDescription>
            Update the status of this {type} to reflect its current state in the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isUpdating}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || status === item.status}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StatusUpdateDialog
