"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Package, Eye, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/store/auth"
import { useOrderStore } from "@/lib/store/orderStore"
import { PageLoading } from "@/components/ui/loading"
import Image from "next/image"
import OrderProductDisplay from "@/components/ui/dashboard/OrderProductDisplay"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { mockProducts } from "@/lib/mock-data"
import { Order, Product } from "@/lib/types"
import InnerLoading from "@/components/layout/InnerLoading"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



export default function OrdersPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { orders, fetchOrdersByUser } = useOrderStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [localLoading, setLocalLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const ORDERS_PER_PAGE = 10

  // Helper: join products to order items
  function joinProductsToOrder(order: Order) {
    const order_items = (order.order_items || []).map((item) => {
      // Use product from DB if available
      let product = item.product
  
      // Fallback to local mockProducts if product is null
      if (!product) {
        product = mockProducts.find(
          (p) => p.asin === item.asin
        )!
      }
  
      return {
        ...item,
        product: product || null, // Still allow null if no match found anywhere
      }
    })
  
    return { ...order, order_items }
  }
  

  useEffect(() => {
    if (!profile) return
    (async () => {
      setLocalLoading(true)
      await fetchOrdersByUser(profile.id)
      setLocalLoading(false)
    })()
  }, [profile?.id, fetchOrdersByUser])

  // Join products to all orders
  const ordersWithProducts = orders.map(joinProductsToOrder)

  // Filter and search logic
  const filteredOrders = ordersWithProducts.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.order_items || []).some(item =>
        (item?.product?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesStatus && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  )

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

  if (localLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders as a customer</p>
      </div>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-64 border rounded px-3 py-2"
        />
        <Select
          value={filterStatus}
          onValueChange={value => { setFilterStatus(value); setCurrentPage(1); }}

        >
          <SelectTrigger className="w-full sm:w-40 border rounded px-3 py-2">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-2">
                  {/* Show a preview of the first product image in the order */}
                  {order.order_items && order.order_items[0].product?.image_url && (
                    <Image src={order.order_items[0].product?.image_url} alt={order.order_items[0].product?.title} width={48} height={48} className="rounded" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">Order #{order.order_number}</h4>
                    <p className="text-xs text-muted-foreground">{order.order_items?.length || 0} items</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{formatCurrency(order.total_amount)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setDetailsOpen(true) }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/track-order?order=${order.id}`)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {/* Order Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium">{formatCurrency(selectedOrder.total_amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>{selectedOrder.payment_status}</Badge>
                  </div>
                </div>
              </div>
              {/* Products */}
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded">
                      {item.product && (
                        <Image src={item.product?.image_url!} alt={item.product?.title} width={40} height={40} className="rounded" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.product?.title}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                        <div className="text-xs text-muted-foreground">Unit Price: {formatCurrency(item.price)}</div>
                        {/* Optionally show store info per product: */}
                        {/* <div className="text-xs text-muted-foreground">Store: {item.store_name}</div> */}
                      </div>
                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => selectedOrder && router.push(`/track-order?order=${selectedOrder.id}`)}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
