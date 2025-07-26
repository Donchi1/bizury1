"use client"

import { useState, useEffect } from "react"
import { Download, Eye, CreditCard, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useOrderStore } from "@/lib/store/orderStore"
import { useAuthStore } from "@/lib/store/auth"
import InnerLoading from "@/components/layout/InnerLoading"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { toast } from "sonner"

// Add Billing type for mapped billing data
export interface Billing {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod?: string;
  items: { name: string; price: number; quantity: number }[];
  billingAddress?: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  };
}

export default function BillingPage() {
  const { orders, loading: ordersLoading } = useOrderStore();
  const [sortBy, setSortBy] = useState("newest")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1);


  // Map orders to billing format
  const billings: Billing[] = orders.map(order => ({
    id: order.id,
    orderId: order.order_number,
    date: order.created_at,
    dueDate: order.created_at, // You can adjust if you have a due date field
    amount: order.subtotal,
    tax: order.tax_amount,
    total: order.total_amount,
    status: order.payment_status, // or order.status
    paymentMethod: order.payment_method,
    items: (order as any)?.items ?? (order as any)?.order_items ?? [], // fallback for items property
    billingAddress: order.billing_address,
  }))


  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "overdue":
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBillings = billings.filter((billing) => {
    const matchesStatus = filterStatus === "all" || billing.status === filterStatus
    const matchesSearch =
      (billing.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (billing.orderId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      ((billing.items ?? []) as { name?: string }[]).some((item: { name?: string }) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const sortedBillings = [...filteredBillings].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "amount-high":
        return b.total - a.total
      case "amount-low":
        return a.total - b.total
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const totalAmount = billings.reduce((sum, bill) => sum + (bill.total || 0), 0)
  const paidAmount = billings.filter((b) => b.status === "confirmed").reduce((sum, bill) => sum + (bill.total || 0), 0)
  const pendingAmount = billings
    .filter((b) => b.status === "pending" || b.status === "failed" || b.status === "cancelled")
    .reduce((sum, bill) => sum + (bill.total || 0), 0)

  const handleExportBillings = () => {
    const csvContent = [
      ["Bill ID", "Order ID", "Date", "Amount", "Tax", "Total", "Status", "Payment Method"],
      ...billings.map((bill) => [
        bill.id,
        bill.orderId,
        bill.date,
        bill.amount.toString(),
        bill.tax.toString(),
        bill.total.toString(),
        bill.status,
        bill.paymentMethod,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `billings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast("Export Complete", {
      description: "Your billing data has been exported successfully.",
    })
  }

  const handleViewDetails = (billing: Billing) => {
    setSelectedBilling(billing)
    setIsDetailsOpen(true)
  }

  const handleDownloadInvoice = (billing: Billing) => {
    // Generate invoice content
    const invoiceContent = `
INVOICE

Bill ID: ${billing.id}
Order ID: ${billing.orderId}
Date: ${new Date(billing.date).toLocaleDateString()}
Due Date: ${new Date(billing.dueDate).toLocaleDateString()}

Bill To:
${billing.billingAddress?.name || ''}
${billing.billingAddress?.address || ''}
${billing.billingAddress?.city || ''}, ${billing.billingAddress?.state || ''} ${billing.billingAddress?.zip_code || ''}
${billing.billingAddress?.country || ''}

Items:
${billing.items.map((item) => `${item.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}`).join("\n")}

Subtotal: $${billing.amount.toFixed(2)}
Tax: $${billing.tax.toFixed(2)}
Total: $${billing.total.toFixed(2)}

Payment Method: ${billing.paymentMethod}
Status: ${billing.status.toUpperCase()}
    `

    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${billing.id}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast("Invoice Downloaded", {
      description: `Invoice ${billing.id} has been downloaded successfully.`,
    })
  }

  // Pagination logic
  const BILLINGS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedBillings.length / BILLINGS_PER_PAGE);
  const paginatedBillings = sortedBillings.slice(
    (currentPage - 1) * BILLINGS_PER_PAGE,
    currentPage * BILLINGS_PER_PAGE
  );

  if (ordersLoading) return <InnerLoading />


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing Details</h1>
        <p className="text-gray-600">View and manage all your order billings</p>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search billings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                <SelectItem value={status.toLowerCase()}>{`${status} ${status === "All" ? "Status" : ""}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount-high">Amount: High to Low</SelectItem>
              <SelectItem value="amount-low">Amount: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={handleExportBillings}>
          <Download className="h-4 w-4 mr-2" />
          Export Billings
        </Button>
      </div>

      {/* Billings List */}
      <div className="space-y-6">
        {paginatedBillings.map((billing) => (
          <Card key={billing.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Bill {billing.id}</span>
                    <Badge className={getStatusColor(billing.status)}>{billing.status}</Badge>
                  </CardTitle>
                  <CardDescription>Order: {billing.orderId}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${billing.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-medium">{new Date(billing.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{new Date(billing.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{billing.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-medium">{billing.items.length} items</p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${billing.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${billing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${billing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(billing)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(billing)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                {billing.status === "pending" && <Button size="sm">Pay Now</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
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

      {sortedBillings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No billings found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "No billings match your search criteria"
                : "You don't have any billings yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Billing Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Billing Details - {selectedBilling?.id}</DialogTitle>
            <DialogDescription>Complete billing information and invoice details</DialogDescription>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bill ID</p>
                  <p className="font-semibold">{selectedBilling.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedBilling.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-semibold">{new Date(selectedBilling.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{new Date(selectedBilling.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h4 className="font-medium mb-2">Billing Address</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedBilling.billingAddress?.name || ''}</p>
                  <p>{selectedBilling.billingAddress?.address || ''}</p>
                  <p>
                    {selectedBilling.billingAddress?.city || ''}, {selectedBilling.billingAddress?.state || ''} {selectedBilling.billingAddress?.zip_code || ''}
                  </p>
                  <p>{selectedBilling.billingAddress?.country || ''}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-3">Items Billed</h4>
                <div className="space-y-2">
                  {selectedBilling.items.map((item: Billing["items"][0], index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{selectedBilling.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedBilling.status)}>{selectedBilling.status}</Badge>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedBilling.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedBilling.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedBilling.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedBilling)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                {selectedBilling.status === "pending" && <Button>Pay Now</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
