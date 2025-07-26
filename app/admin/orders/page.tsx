"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Truck, Download, Search, RefreshCw, Eye, Filter, FileText, Trash, CheckCircle, XCircle, Box, BoxSelect, CheckCheck, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderDetails } from "@/components/admin/order/order-details"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "sonner"
import { useAdminOrdersStore } from "@/lib/store/admin/ordersStore"
import type { Order, OrderStatus } from "@/lib/types"
import InnerLoading from "@/components/layout/InnerLoading"
import { AlertDialogFooter, AlertDialogHeader, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialog } from "@/components/ui/alert-dialog"
import { ButtonLoading } from "@/components/ui/loading"
import { BulkAction } from "@/components/admin/layout/BulkAction"
import { CardStats } from "@/components/ui/card-stats"

export default function AdminOrdersPage() {
  const { orders, fetchOrders, updateOrder, deleteOrder, isLoading: isStoreLoading } = useAdminOrdersStore()
  const [isLoading, setIsLoading] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [updatingStatusOrder, setUpdatingStatusOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [orderToDelete, setOrderToDelete] = useState<Order["id"] | null>(null)



  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesPayment = paymentFilter === "all" || order.payment_method === paymentFilter
      return matchesSearch && matchesStatus && matchesPayment
    })
    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [orders, searchTerm, statusFilter, paymentFilter])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      await fetchOrders()
    } catch (error) {
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    setSelectedOrders(prevSelected =>
      prevSelected.length === filteredOrders.length
        ? []
        : filteredOrders.map(order => order.id)
    )
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  // 4. Update bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) {
      toast.error("No orders selected")
      return
    }

    try {
      const promises = selectedOrders.map(orderId =>
        action === "delete"
          ? deleteOrder(orderId)
          : updateOrder(orderId, {
            status: action.replace("mark_", ""),
            updated_at: new Date().toISOString()
          } as Order)
      )
      await Promise.all(promises)
      toast.success(`Updated ${selectedOrders.length} orders`)
      setSelectedOrders([])
    } catch (error) {
      toast.error(`Failed to ${action} orders`)
    }
  }

  // 5. Update status update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!updatingStatusOrder) return
    try {
      await updateOrder(updatingStatusOrder.id, {
        status: newStatus as OrderStatus,
        updated_at: new Date().toISOString()
      })
      toast.success(`Status updated to ${newStatus}`)
      setUpdatingStatusOrder(null)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  // 6. Update refresh handler
  const handleRefresh = async () => {
    try {
      await fetchOrders()
      toast.success("Orders refreshed")
    } catch (error) {
      toast.error("Failed to refresh")
    }
  }

  // 7. Update stats calculation
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  }

  // 8. Update status badge component
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "processing": return <Badge className="bg-blue-500">Processing</Badge>
      case "shipped": return <Badge className="bg-yellow-500">Shipped</Badge>
      case "delivered": return <Badge className="bg-green-500">Delivered</Badge>
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>
      case "pending_payment": return <Badge className="bg-orange-500">Pending Payment</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteOrder(orderToDelete!);
      toast.success('Order deleted successfully');
      setOrderToDelete(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (isLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600">Track and manage all customer orders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Orders", value: stats.total, color: "text-gray-900", icon: Box, desc: `${stats.processing + stats.shipped + stats.delivered + stats.cancelled} orders`, iconBgColor: "bg-gray-100" },
          { label: "Processing", value: stats.processing, color: "text-blue-600", icon: BoxSelect, desc: `${stats.processing} orders`, iconBgColor: "bg-blue-100" },
          { label: "Shipped", value: stats.shipped, color: "text-yellow-600", icon: CheckCheck, desc: `${stats.shipped} orders`, iconBgColor: "bg-yellow-100" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600", icon: CheckCircle, desc: `${stats.delivered} orders`, iconBgColor: "bg-green-100" },
          { label: "Cancelled", value: stats.cancelled, color: "text-red-600", icon: XCircle, desc: `${stats.cancelled} orders`, iconBgColor: "bg-red-100" },
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`, color: "text-orange-600", icon: DollarSign, desc: `${stats.totalRevenue} orders`, iconBgColor: "bg-orange-100" },
        ].map((stat) => (
          <CardStats
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={<stat.icon />}
            description={stat.desc}
            borderColor="border-gray-200"
            textColor={stat.color}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4">
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <BulkAction
            selectedCount={selectedOrders.length}
            onClearSelection={() => setSelectedOrders([])}
            onBulkAction={handleBulkAction}
            actions={[
              {
                label: "Mark as Shipped",
                value: "mark_shipped",
                icon: <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />,
              },
              {
                label: "Mark as Delivered",
                value: "mark_delivered",
                icon: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
              },
              {
                label: "Cancel Orders",
                value: "cancel",
                icon: <XCircle className="mr-2 h-4 w-4 text-red-600" />,
                variant: "destructive",
              },
            ]}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox checked={selectedOrders.length === filteredOrders.length} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => handleSelectOrder(order.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>{order.customer?.full_name}</div>
                    <div className="text-sm text-gray-500">{order.customer?.email}</div>
                  </TableCell>
                  <TableCell>{order?.order_items[0].product?.brand}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.payment_method}</TableCell>
                  <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{order.order_items?.length}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUpdatingStatusOrder(order)}>
                          <Truck className="mr-2 h-4 w-4" /> Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <strong>
                {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
              </strong>{" "}
              of <strong>{filteredOrders.length}</strong> orders
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page</span>
                <Select value={`${itemsPerPage}`} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={i + 1 === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(i + 1)
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* View Order Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription className="sr-only">View and manage order {viewingOrder?.id}</DialogDescription>
          </DialogHeader>
          {viewingOrder && <OrderDetails order={viewingOrder} />}
        </DialogContent>
      </Dialog>
      {/* Update Status Dialog */}
      <Dialog open={!!updatingStatusOrder} onOpenChange={(open) => !open && setUpdatingStatusOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Select the new status for order {updatingStatusOrder?.id}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select disabled={isStoreLoading} onValueChange={handleUpdateStatus} defaultValue={updatingStatusOrder?.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter

          >
            <Button onClick={() => !isStoreLoading ? setUpdatingStatusOrder(null) : {}}
              className="bg-primary hover:bg-primary/90"
              disabled={isStoreLoading}
            >
              {isStoreLoading ? <ButtonLoading  text="Updating..." /> : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>


      </Dialog>
      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isStoreLoading ? <ButtonLoading className="mr-2 h-4 w-4 animate-spin" text="Deleting..." /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 