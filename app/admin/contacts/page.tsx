"use client"

import { useState, useEffect } from "react"
import {
  MoreVertical,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  RefreshCw,
  Mail,
  MessageSquarePlus,
  User,
  Users,
  CheckCircle,
  Trash,
  CheckCheck,
  AlertCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"
import { format } from "date-fns"
import { useContactStore } from "@/lib/store/admin/contactStore"
import { ContactForm } from "@/lib/types"
import { CardStats } from "@/components/ui/card-stats"
import { BulkAction } from "@/components/admin/layout/BulkAction"

const mockContacts = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    company: "TechCorp Inc.",
    position: "CEO",
    status: "active",
    source: "website",
    category: "customer",
    address: "123 Business St, New York, NY 10001",
    notes: "Interested in enterprise solutions",
    last_contact: "2024-01-20T14:30:00Z",
    created_at: "2024-01-15T10:00:00Z",
    tags: ["enterprise", "decision-maker"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-0124",
    company: "Design Studio",
    position: "Creative Director",
    status: "active",
    source: "referral",
    category: "prospect",
    address: "456 Creative Ave, Los Angeles, CA 90210",
    notes: "Looking for design tools",
    last_contact: "2024-01-19T16:45:00Z",
    created_at: "2024-01-12T09:30:00Z",
    tags: ["design", "creative"],
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+1-555-0125",
    company: "StartupXYZ",
    position: "CTO",
    status: "inactive",
    source: "event",
    category: "lead",
    address: "789 Innovation Dr, San Francisco, CA 94105",
    notes: "Met at tech conference",
    last_contact: "2024-01-10T11:20:00Z",
    created_at: "2024-01-08T14:15:00Z",
    tags: ["startup", "tech"],
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1-555-0126",
    company: "Marketing Pro",
    position: "Marketing Manager",
    status: "active",
    source: "social_media",
    category: "customer",
    address: "321 Marketing Blvd, Chicago, IL 60601",
    notes: "Regular customer, very satisfied",
    last_contact: "2024-01-18T13:15:00Z",
    created_at: "2024-01-05T08:45:00Z",
    tags: ["marketing", "regular"],
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1-555-0127",
    company: "Consulting Group",
    position: "Senior Consultant",
    status: "active",
    source: "cold_call",
    category: "prospect",
    address: "654 Consulting Way, Boston, MA 02108",
    notes: "Interested in consulting services",
    last_contact: "2024-01-17T15:30:00Z",
    created_at: "2024-01-10T12:00:00Z",
    tags: ["consulting", "senior"],
  },
]



export default function AdminContactsPage() {
  const { contacts, fetchContacts, loading, error, updateContact, deleteContact, bulkUpdateStatus, bulkDelete } = useContactStore()
  const [filteredContacts, setFilteredContacts] = useState<ContactForm[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isLocalLoading, setIsLocalLoading] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const [selectedContact, setSelectedContact] = useState<ContactForm | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    loadContacts()
  }, [fetchContacts])

  const loadContacts = async () => {
    try {
      setIsLocalLoading(true)
      await fetchContacts()
    } catch (error) {
      toast.error('Failed to load contact submissions')
    } finally {
      setIsLocalLoading(false)
    }
  }

  useEffect(() => {
    const filtered = contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
    setFilteredContacts(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [contacts, searchTerm, statusFilter])

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === filteredContacts.length ? [] : filteredContacts.map((c) => c.id)
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) {
      toast.error("No contacts selected", {
        description: "Please select contacts to perform bulk actions.",
      })
      return
    }
    try {
      if (action !== "delete") {
        await bulkUpdateStatus(selectedContacts, action as ContactForm['status'])
        toast.success("Contacts Activated", {
          description: `${selectedContacts.length} contacts have been ${action}.`,
        })
      }else{
        setSelectedContact(contacts.find(contact => contact.id === selectedContacts[0]) as any)
      }

      setSelectedContacts([])
    } catch (error) {
      toast.error("Error", {
        description: "Failed to perform bulk action.",
      })
    }
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Phone,Company,Subject,Status,Category,Source,Company,Notes,Last Contact,Created\n" +
      filteredContacts.map(contact =>
        `${contact.id},${contact.name},${contact.email},${contact.phone},${contact.company},${contact.subject},${contact.status},${contact.company},${contact.notes},${contact?.updated_at},${contact.created_at}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `contacts_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Export Successful", {
      description: "Contacts data has been exported.",
    })
  }



  const handleViewContact = (contact: ContactForm) => {
    setSelectedContact(contact)
    setIsViewModalOpen(true)
  }

  const handleDeleteContact = (contactId: string) => {
    setSelectedContact(contacts.find(contact => contact.id === contactId) as any)
  }

  const confirmDelete = async () => {
    try {
      if (selectedContacts.length > 1) {
        await bulkDelete(selectedContacts)
        toast.success("Contacts Deleted", {
          description: `${selectedContacts.length} contacts have been deleted.`,
        })
      } else if (selectedContact) {
        await deleteContact(selectedContact.id)
        toast.success("Contact Deleted", {
          description: `Contact ${selectedContact.name} has been deleted.`,
        })
      }
      setSelectedContact(null)
      setSelectedContacts([])

    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete contact.",
      })
    }
  }

  // const handleFormSubmit = async (data: any) => {
  //   if (!editingContact) return
  //   // Update contact
  //   await updateContact(editingContact.id, data)
  //   toast.success("Contact updated", { description: `Contact ${data.name} has been updated.` })

  //   setIsFormOpen(false)
  //   setEditingContact(null)
  // }

  const handleAddNote = async () => {
    if (!selectedContact || !newNote.trim()) return

    try {
      const updatedNotes = selectedContact.notes
        ? `${selectedContact.notes}\n\n${format(new Date(), 'MMM d, yyyy h:mm a')}: ${newNote}`
        : `${format(new Date(), 'MMM d, yyyy h:mm a')}: ${newNote}`

      // Update contact
      await updateContact(selectedContact.id, { notes: updatedNotes })
      setNewNote("")
      toast.success("Note added successfully")
      setIsViewModalOpen(false)
    } catch (error) {
      toast.error("Failed to add note")
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleStatusUpdate = async (contact: ContactForm, status: ContactForm['status']) => {
    if (!contact) {
      toast.error("Contact not found")
      return
    }
    try {
      await updateContact(contact.id, { status })
      toast.success("Contact status updated")
    } catch (error) {
      toast.error("Failed to update contact status")
    }
  }

  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    in_progress: contacts.filter((c) => c.status === "in_progress").length,
    customers: contacts.filter((c) => c.company).length,
    resolved: contacts.filter((c) => c.status === "resolved").length,
    spam: contacts.filter((c) => c.status === "spam").length,
  }

  const getStatusBadge = (status: ContactForm['status']) => {
    switch (status) {
      case "new":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">In Progress</Badge>
      case "resolved":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Resolved</Badge>
      case "spam":
        return <Badge variant="destructive">Spam</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-gray-600">Manage all contacts and customer relationships.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadContacts}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLocalLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* <Button onClick={handleAddContact}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button> */}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Contacts", value: stats.total, color: "text-gray-900", icon: Users, description: "Total number of contacts" },
          { label: "New", value: stats.new, color: "text-green-600", icon: CheckCircle, description: "New contacts" },
          { label: "In Progress", value: stats.in_progress, color: "text-red-600", icon: Clock, description: "In progress contacts" },
          { label: "Customers", value: stats.customers, color: "text-blue-600", icon: User, description: "Customer contacts" },
          { label: "Resolved", value: stats.resolved, color: "text-orange-600", icon: CheckCheck, description: "Resolved contacts" },
          { label: "Spam", value: stats.spam, color: "text-purple-600", icon: Trash, description: "Spam contacts" },
        ].map((stat) => (
          <CardStats
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={<stat.icon />}
            description={stat.description}
            borderColor={stat.color}
            textColor={stat.color}
            iconBgColor={stat.color}
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
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts by name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="cold_call">Cold Call</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {selectedContacts.length > 0 && (
            <BulkAction
              onClearSelection={() => setSelectedContacts([])}
              selectedCount={selectedContacts.length}
              onBulkAction={handleBulkAction}
              actions={[
                { label: "Resolve", value: "resolved", icon: <CheckCircle className="text-green-500" /> },
                { label: "Spam", value: "spam", icon: <AlertCircle className="text-red-500" /> },
                { label: "In Progress", value: "in_progress", icon: <Clock className="text-yellow-500" /> },
                { label: "Delete", value: "delete", icon: <Trash className="text-red-500" /> },
              ]}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                    <div className="text-sm text-gray-500">{contact.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contact.company}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contact.status as ContactForm['status'])}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">website</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(contact?.updated_at!).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                          <Eye className="mr-2 h-4 w-4 text-blue-500" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(contact, "in_progress")}>
                          <Clock className="mr-2 h-4 w-4 text-yellow-500" /> In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(contact, "resolved")}>
                          <CheckCheck className="mr-2 h-4 w-4 text-green-500" /> Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(contact, "spam")}>
                          <AlertCircle className="mr-2 h-4 w-4 text-red-500" /> Spam
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Send Email
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground pl-4">
              Showing{" "}
              <strong>
                {filteredContacts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredContacts.length)}
              </strong>{" "}
              of <strong>{filteredContacts.length}</strong> 
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows</span>
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
                <PaginationContent >
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

      {/* View Contact Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedContact.name}
                  {getStatusBadge(selectedContact.status as ContactForm['status'])}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-muted-foreground">Email</h4>
                    <p>{selectedContact.email}</p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <h4 className="text-sm text-muted-foreground">Phone</h4>
                      <p>{selectedContact.phone}</p>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div>
                      <h4 className="text-sm text-muted-foreground">Company</h4>
                      <p>{selectedContact.company}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm text-muted-foreground">Submitted</h4>
                    <p>{new Date(selectedContact.created_at).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-sm text-muted-foreground">Message</h4>
                    <p>{selectedContact.message}</p>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Notes</h3>
                    {!isAddingNote && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingNote(true)}
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    )}
                  </div>

                  {isAddingNote && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a note about this contact..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingNote(false)
                            setNewNote("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || loading}
                        >
                          {loading ? 'Adding...' : 'Save Note'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedContact?.notes && (
                    <div className="space-y-2">
                      <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
                        {selectedContact.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteModal} onOpenChange={(open) => setOpenDeleteModal(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteModal(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 