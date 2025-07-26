import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle, ChevronDown, Clock, XCircle } from "lucide-react"
import { ReactNode } from "react"

type BulkActionItem = {
  label: string
  value: string
  icon?: ReactNode
  variant?: "default" | "destructive" | "outline" | "ghost"
}

type BulkActionProps = {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (action: string) => void
  actions?: BulkActionItem[]
  className?: string
  title?: string
}

const defaultActions: BulkActionItem[] = [
  {
    label: "Mark as Pending",
    value: "pending",
    icon: <Clock className="mr-2 h-4 w-4" />,
  },
  {
    label: "Mark as Completed",
    value: "success",
    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-600" />,
  },
  {
    label: "Mark as Failed",
    value: "failed",
    icon: <XCircle className="mr-2 h-4 w-4 text-red-600" />,
    variant: "destructive",
  },
]

export function BulkAction({
  title = "Bulk Actions",
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions = defaultActions,
  className = "",
}: BulkActionProps) {
  if (selectedCount === 0) return null

  return (
    <div className={`flex items-center gap-2 flex-col lg:flex-row justify-between bg-blue-50 p-4 ${className}`}>
      <div className="flex items-center justify-between  w-full ">
        <div className="font-medium">
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="hover:bg-blue-100"
        >
          Clear selection
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full lg:w-auto">
          <Button variant="default" size="sm">
            Bulk Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.value}
              onClick={() => onBulkAction(action.value)}
              className={action.variant === "destructive" ? "text-destructive" : ""}
            >
              {action.icon || null}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
