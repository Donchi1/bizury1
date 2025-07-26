"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Order } from "@/lib/types"


export function OrderDetails( {order} : {order : Order})  {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>
      case "shipped":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Shipped</Badge>
      case "delivered":
        return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "pending_payment":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Pending Payment</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order {order.id}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Customer:</div>
            <div>{order.customer?.full_name}</div>

            <div className="font-medium">Email:</div>
            <div>{order.customer?.email}</div>

            <div className="font-medium">Date:</div>
            <div>{new Date(order.created_at).toLocaleString()}</div>

            <div className="font-medium">Status:</div>
            <div>{getStatusBadge(order.status)}</div>
            <div className="font-medium">Payment Status:</div>
            <div>{getPaymentStatusBadge(order.payment_status)}</div>

            <div className="font-medium">Total:</div>
            <div className="font-bold">${order.total_amount.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      {order?.order_items && (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.product.title.slice(0, 30)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(product.quantity * product.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.shipping_address?.address || "Not provided"}</p>
            <p>{order.shipping_address?.city || "Not provided"}</p>
            <p>{order.shipping_address?.state || "Not provided"}</p>
            <p>{order.shipping_address?.zip_code || "Not provided"}</p>
            <p>{order.shipping_address?.country || "Not provided"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.billing_address?.address || "Same as shipping"}</p>
            <p>{order.billing_address?.city || "Same as shipping"}</p>
            <p>{order.billing_address?.state || "Same as shipping"}</p>
            <p>{order.billing_address?.zip_code || "Same as shipping"}</p>
            <p>{order.billing_address?.country || "Same as shipping"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 