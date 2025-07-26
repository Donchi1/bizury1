"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  ArrowLeft, 
  MessageSquare 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/store/auth"
import { useSellingStore } from "@/lib/store/sellingStore"
import { PageLoading } from "@/components/ui/loading"
import OrderProductDisplay from "@/components/ui/dashboard/OrderProductDisplay"
import { toast } from "sonner"
import { OrderItemWithDetails } from "@/lib/types"


export default function ShopOrdersPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { 
    storeOrders, 
    store,
    fetchOrdersByStore, 
    updateStoreOrder, 
    deleteStoreOrder, 
    loading: storeLoading 
  } = useSellingStore()
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<OrderItemWithDetails | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders when component mounts or store changes
  useEffect(() => {
    const loadOrders = async () => {
      if (!profile?.id) return

      setLoading(true)
      setError(null)
      try {
        // If we don't have a store yet, fetch it first
        if (store?.id) {
          await fetchOrdersByStore(store.id)
        }
      } catch (err) {
        setError('Failed to load storeOrders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    loadOrders()
  }, [profile?.id, store?.id, fetchOrdersByStore])


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = storeOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle delete order
  const handleDelete = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This cannot be undone.")) {
      return
    }
    
    try {
      setLoading(true)
      await deleteStoreOrder(orderId)
      //setOrders(prev => prev.filter(order => order.id !== orderId))
      setDetailsOpen(false)
      toast.success('Order deleted successfully')
    } catch (err) {
      console.error('Failed to delete order:', err)
      toast.error('Failed to delete order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle status update
  const handleStatusChange = async (orderId: string, newStatus: OrderItemWithDetails['status']) => {
    try {
      setLoading(true)
      await updateStoreOrder(orderId, { status: newStatus })
      
      toast.success(`Order status updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update order status:', err)
      toast.error('Failed to update order status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading || storeLoading) {
    return <PageLoading text="Loading store storeOrders..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-red-700 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/shop")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Store Orders</h1>
            <p className="text-muted-foreground">Manage and fulfill your store orders</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search storeOrders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'When you receive orders, they will appear here.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={order.customer?.avatar_url} />
                      <AvatarFallback>
                        {(order.customer?.full_name as string)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.full_name} • {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedOrder(order)
                        setDetailsOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">{order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Order Details</DialogTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(selectedOrder.id)}
                      disabled={loading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.order_number} • {formatDate(selectedOrder.created_at)}
                </p>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">

                          <OrderProductDisplay
                            items={selectedOrder.order_items.map((item) => ({
                              id: item?.id!,
                              product_name: item.product.title,
                              quantity: item.quantity,
                              total_price: item.total,
                              image_url: item.product?.image_url!
                            }))}
                          />
                        <div className="border-t pt-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(selectedOrder.total_amount)}</span>
                          </div>
                          <div className="flex justify-between mt-2 font-medium">
                            <span>Total</span>
                            <span>{formatCurrency(selectedOrder.total_amount)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Update Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={selectedOrder.status === 'processing' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                          disabled={loading || ['delivered', 'cancelled', 'refunded'].includes(selectedOrder.status)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Processing
                        </Button>
                        <Button 
                          variant={selectedOrder.status === 'shipped' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                          disabled={loading || ['delivered', 'cancelled', 'refunded'].includes(selectedOrder.status)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Shipped
                        </Button>
                        <Button 
                          variant={selectedOrder.status === 'delivered' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                          disabled={loading || ['cancelled', 'refunded'].includes(selectedOrder.status)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Delivered
                        </Button>
                        <Button 
                          variant={selectedOrder.status === 'cancelled' ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                          disabled={loading || ['delivered', 'refunded'].includes(selectedOrder.status)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedOrder.customer?.avatar_url} />
                          <AvatarFallback>
                            {(selectedOrder.customer?.full_name as string)
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedOrder.customer?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Customer</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {selectedOrder.customer?.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedOrder.customer?.email}</span>
                          </div>
                        )}
                        {selectedOrder.customer?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{selectedOrder.customer?.phone}</span>
                          </div>
                        )}
                        {selectedOrder.shipping_address && (
                          <div className="flex items-start text-sm">
                            <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span>{selectedOrder.shipping_address?.address}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Customer
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}