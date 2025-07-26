"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageLoading } from "@/components/ui/loading"
import Image from "next/image"
import { Truck, ShoppingCart, AlertCircle, Clock, MapPin, DollarSign, User, StoreIcon, ArrowLeft, ArrowRight } from "lucide-react"
import { useOrderStore } from "@/lib/store/orderStore"
import { useAuthStore } from "@/lib/store/auth"
import { toast } from "sonner"
import Link from "next/link"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function TrackOrderPage() {

  const searchParams = useSearchParams()

  const {
    trackedOrder,
    loading,
    trackOrder,
    setLoading
  } = useOrderStore()

  const [trackingInput, setTrackingInput] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderId = searchParams.get("order")
    if (orderId) {
      if (orderId) {
        setTrackingInput(orderId)
        fetchOrder(orderId)
      }
    }
  }, [searchParams])

  console.log(trackedOrder)

  const fetchOrder = async (identifier: string) => {
    if (!identifier) {
      setError("Please enter your order number or tracking number.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await trackOrder(identifier)
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("An error occurred while fetching your order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleManualTrack = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrder(trackingInput)
  }

  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getPaymentStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const constructDate = (date: string) => {
    const newDate = new Date(date)
    newDate.setMinutes(newDate.getMinutes() + 20)
    return newDate.toISOString()
  }
  function getTimeline(order: any) {

    const timeline = [
      {
        label: "Pending",
        date: order.status === 'pending' ? order.created_at : '',
        completed: order.status === 'pending',
      },
      {
        label: "Confirmed",
        date: order.status === 'confirmed' ? constructDate(order.created_at) : '',
        completed: order.status === 'confirmed',
      },
      {
        label: "Processing",
        date: order.status === 'processing' ? constructDate(order.updated_at) : '',
        completed: order.status === 'processing',
      },
      {
        label: "Shipped",
        date: order.status === 'shipped' ? order.shipped_at : '',
        completed: order.status === 'shipped',
      },
      {
        label: 'cancelled',
        date: order.status === 'cancelled' ? order.updated_at : '',
        completed: order.status === 'cancelled',
      },
      {
        label: 'Delivered',
        date: order.status === 'delivered' ? order.delivered_at : '',
        completed: order.status === 'delivered',
      },
    ]
    return timeline
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
      {loading ? (
        <PageLoading text="Fetching order information..." />
      ) : trackedOrder ? (
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                {/* {trackedOrder.store_logo && (
                <Image 
                  src={trackedOrder.store_logo} 
                  alt={trackedOrder.store_name || 'Store'} 
                  width={48} 
                  height={48} 
                  className="rounded" 
                />
              )} */}
                <div className="flex-1">
                  {/* <h4 className="font-semibold">{trackedOrder.store_name || 'Store'}</h4> */}
                  <p className="text-xs text-muted-foreground">Order #{trackedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order Status:</p>
                  <Badge className={getStatusColor(trackedOrder.status)}>
                    {trackedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Status:</p>
                  <Badge className={getPaymentStatusColor(trackedOrder.payment_status)}>
                    {trackedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {trackedOrder.order_items?.length || 0} items
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(trackedOrder.total_amount || 0)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(trackedOrder.created_at || new Date().toISOString())}
                </span>
              </div>

              {trackedOrder.tracking_number && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground">{trackedOrder.tracking_number}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(trackedOrder.tracking_number || '')
                      toast.success('Tracking number copied to clipboard')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}

              {/* Timeline */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Order Timeline</h3>
                <ol className="relative border-l border-gray-200">
                  {getTimeline(trackedOrder).map((event, idx) => (
                    <li key={idx} className="mb-4 ml-4 flex-col flex items-left justify-center">
                      <div className={`absolute w-3 h-3 rounded-full -left-1.5 border ${event.completed ? 'bg-green-500 border-green-500' : 'bg-gray-300 border-gray-300'
                        }`}></div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${event.completed ? 'text-green-700' : 'text-gray-500'
                          }`}>
                          {event.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.date ? formatDate(event.date) : '—'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Order Items */}
              {trackedOrder.order_items?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold mb-1">Order Items</h3>
                  <div className="space-y-4">
                    {trackedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded">
                        {item.product?.image_url && (
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.product?.image_url}
                              alt={item.product?.title || 'Product'}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.title || 'Product'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item?.price || 0)}
                          </p>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item?.total || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </h4>
                  {trackedOrder.shipping_address ? (
                    <div className="text-sm space-y-1">
                      <p>{trackedOrder.shipping_address.name}</p>
                      <p>{trackedOrder.shipping_address.address}</p>
                      <p>
                        {trackedOrder.shipping_address.city}, {trackedOrder.shipping_address.state} {trackedOrder.shipping_address.zip_code}
                      </p>
                      <p>{trackedOrder.shipping_address.country}</p>
                      {trackedOrder.shipping_address.phone && (
                        <p className="mt-2">📞 {trackedOrder.shipping_address.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shipping address provided</p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Information
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Status:</strong> {trackedOrder.payment_status || 'N/A'}</p>
                    <p><strong>Method:</strong> {trackedOrder.payment_method ?
                      trackedOrder.payment_method.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') : 'N/A'}
                    </p>
                    <p><strong>Total:</strong> {formatCurrency(trackedOrder.total_amount || 0)}</p>
                    {trackedOrder.created_at && (
                      <p><strong>Paid on:</strong> {formatDate(trackedOrder.created_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2 items-center justify-between mt-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/orders">
                Back to Orders
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Track Your Order</h3>
            <p className="text-muted-foreground mb-4">
              Enter your order number or tracking number to view your order status and details.
            </p>
            <form onSubmit={handleManualTrack} className="space-y-4">
              <Input
                placeholder="Enter order # or tracking #"
                value={trackingInput}
                onChange={(e) => {
                  setTrackingInput(e.target.value)
                  setError(null)
                }}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Track Order
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
            <div className="pt-4 text-sm text-muted-foreground">
              <p>Can't find your order? Check your email for order confirmation or contact support.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
