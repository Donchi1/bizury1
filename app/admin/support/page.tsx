"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  MoreVertical,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const mockTickets = [
  {
    id: "TKT-001",
    title: "Unable to complete payment for order",
    description: "I'm trying to pay for my order but the payment keeps failing. I've tried multiple cards.",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    category: "payment",
    priority: "high",
    status: "open",
    assigned_to: "Admin User",
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T14:22:00Z",
    order_id: "ORD-001",
    messages: [
      {
        id: 1,
        sender: "customer",
        message: "I'm trying to pay for my order but the payment keeps failing. I've tried multiple cards.",
        timestamp: "2024-01-20T10:30:00Z",
      },
      {
        id: 2,
        sender: "admin",
        message: "Hello John, I'm sorry to hear about the payment issue. Let me check your order details.",
        timestamp: "2024-01-20T11:15:00Z",
      },
    ],
  },
  {
    id: "TKT-002",
    title: "Product not as described",
    description: "The iPhone I received is not the color I ordered. I ordered Space Black but received Silver.",
    customer_name: "Jane Smith",
    customer_email: "jane.smith@example.com",
    category: "product",
    priority: "medium",
    status: "in_progress",
    assigned_to: "Support Agent 1",
    created_at: "2024-01-19T16:45:00Z",
    updated_at: "2024-01-20T09:30:00Z",
    order_id: "ORD-002",
    messages: [
      {
        id: 1,
        sender: "customer",
        message: "The iPhone I received is not the color I ordered. I ordered Space Black but received Silver.",
        timestamp: "2024-01-19T16:45:00Z",
      },
    ],
  },
  {
    id: "TKT-003",
    title: "Shipping delay inquiry",
    description: "My order was supposed to arrive yesterday but I haven't received any updates.",
    customer_name: "Mike Johnson",
    customer_email: "mike.johnson@example.com",
    category: "shipping",
    priority: "low",
    status: "resolved",
    assigned_to: "Support Agent 2",
    created_at: "2024-01-18T11:20:00Z",
    updated_at: "2024-01-19T15:45:00Z",
    order_id: "ORD-003",
    messages: [
      {
        id: 1,
        sender: "customer",
        message: "My order was supposed to arrive yesterday but I haven't received any updates.",
        timestamp: "2024-01-18T11:20:00Z",
      },
      {
        id: 2,
        sender: "admin",
        message: "I've checked with our shipping partner and your package is on its way. Tracking updated.",
        timestamp: "2024-01-19T15:45:00Z",
      },
    ],
  },
  {
    id: "TKT-004",
    title: "Account verification issues",
    description: "I uploaded my documents for KYC verification but it's been pending for a week.",
    customer_name: "Sarah Wilson",
    customer_email: "sarah.wilson@example.com",
    category: "account",
    priority: "medium",
    status: "open",
    assigned_to: "KYC Team",
    created_at: "2024-01-17T14:30:00Z",
    updated_at: "2024-01-17T14:30:00Z",
    order_id: null,
    messages: [
      {
        id: 1,
        sender: "customer",
        message: "I uploaded my documents for KYC verification but it's been pending for a week.",
        timestamp: "2024-01-17T14:30:00Z",
      },
    ],
  },
  {
    id: "TKT-005",
    title: "Refund request for cancelled order",
    description: "I cancelled my order but haven't received the refund yet. It's been 5 business days.",
    customer_name: "David Brown",
    customer_email: "david.brown@example.com",
    category: "refund",
    priority: "high",
    status: "escalated",
    assigned_to: "Finance Team",
    created_at: "2024-01-16T09:15:00Z",
    updated_at: "2024-01-20T08:45:00Z",
    order_id: "ORD-005",
    messages: [
      {
        id: 1,
        sender: "customer",
        message: "I cancelled my order but haven't received the refund yet. It's been 5 business days.",
        timestamp: "2024-01-16T09:15:00Z",
      },
    ],
  },
]

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [filteredTickets, setFilteredTickets] = useState(mockTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer_email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority
    })

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, categoryFilter, statusFilter, priorityFilter])

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : ticket,
        ),
      )

      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      })
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newMessage = {
        id: selectedTicket.messages.length + 1,
        sender: "admin",
        message: replyMessage,
        timestamp: new Date().toISOString(),
      }

      const updatedTicket = {
        ...selectedTicket,
        messages: [...selectedTicket.messages, newMessage],
        updated_at: new Date().toISOString(),
        status: selectedTicket.status === "open" ? "in_progress" : selectedTicket.status,
      }

      setTickets(tickets.map((ticket) => (ticket.id === selectedTicket.id ? updatedTicket : ticket)))
      setSelectedTicket(updatedTicket)
      setReplyMessage("")

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the customer.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-purple-100 text-purple-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "escalated":
        return <XCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
    avgResponseTime: "2.5 hours",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support requests and inquiries</p>
        </div>

        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <div className="text-sm text-gray-600">Open</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.escalated}</div>
            <div className="text-sm text-gray-600">Escalated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets by ID, title, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.id}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{ticket.title}</div>
                      {ticket.order_id && <div className="text-xs text-blue-600">Order: {ticket.order_id}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-sm text-gray-500">{ticket.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      <Tag className="h-3 w-3 mr-1" />
                      {ticket.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <Badge className={getStatusColor(ticket.status)} variant="secondary">
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{ticket.assigned_to}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(ticket.created_at).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(ticket.created_at).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setIsViewModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View & Reply
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ticket.status === "open" && (
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "in_progress")}>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </DropdownMenuItem>
                        )}
                        {(ticket.status === "open" || ticket.status === "in_progress") && (
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "resolved")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                        )}
                        {ticket.status !== "escalated" && (
                          <DropdownMenuItem onClick={() => handleUpdateTicketStatus(ticket.id, "escalated")}>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Escalate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>View ticket information and send replies</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6 py-4">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <strong>Ticket ID:</strong> {selectedTicket.id}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge className={getStatusColor(selectedTicket.status)} variant="secondary">
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <strong>Customer:</strong> {selectedTicket.customer_name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedTicket.customer_email}
                </div>
                <div>
                  <strong>Category:</strong>{" "}
                  <Badge variant="secondary" className="capitalize">
                    {selectedTicket.category}
                  </Badge>
                </div>
                <div>
                  <strong>Priority:</strong>{" "}
                  <Badge className={getPriorityColor(selectedTicket.priority)} variant="secondary">
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <strong>Assigned To:</strong> {selectedTicket.assigned_to}
                </div>
                {selectedTicket.order_id && (
                  <div>
                    <strong>Related Order:</strong> {selectedTicket.order_id}
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedTicket.title}</h3>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Conversation */}
              <div className="space-y-4">
                <h4 className="font-semibold">Conversation</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {selectedTicket.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {message.sender === "admin" ? "Support Team" : selectedTicket.customer_name}
                          </span>
                          <span className="text-xs opacity-75">{new Date(message.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Section */}
              <div className="space-y-3">
                <h4 className="font-semibold">Send Reply</h4>
                <Textarea
                  placeholder="Type your reply to the customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
