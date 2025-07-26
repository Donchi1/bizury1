"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Plus, Eye, Edit, Ban, CheckCircle, Download, Star, Trash2, RefreshCw, XCircle, Trash, Box, CheckCheck, Clock, DollarSign, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
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
import { useAdminStoresStore } from "@/lib/store/admin/storesStore"
import InnerLoading from "@/components/layout/InnerLoading"
import { Store } from "@/lib/types"
import { StoreForm } from "@/components/admin/store/StoreForm"
import { toast } from "sonner"
import { storeTypes } from "@/lib/mock-data"
import MerchantForm from "@/components/MerchantForm"
import { deleteImage } from "@/lib/utils"
import { BulkAction } from "@/components/admin/layout/BulkAction"
import { CardStats } from "@/components/ui/card-stats"

export default function AdminStoresPage() {
  const {
    stores,
    isLoading,
    fetchStores,
    deleteStore,
    deleteStores,
    approveStore,
    suspendStore,
    activateStore,
    createStore,
    updateStore
  } = useAdminStoresStore()

  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStores, setSelectedStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loadingStore, setLoadingStore] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  // Fetch stores on mount
  useEffect(() => {
    loadStore()
  }, [fetchStores])


  const loadStore = async () => {
    setLoadingStore(true)
    try {
      await fetchStores()
      setLoadingStore(false)
    } catch (error) {
      toast.error("Error", {
        description: "Failed to log store.",
      })
    }
    setLoadingStore(false)
  }

  // Filter stores based on search and filters
  useEffect(() => {
    const filtered = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || store.category === categoryFilter
      const matchesStatus = statusFilter === "all" || store.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })

    setFilteredStores(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [stores, searchTerm, categoryFilter, statusFilter])

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / itemsPerPage))
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Owner,Email,Category,Status,Products,Orders,Revenue,Rating,Commission,Date\n" +
      filteredStores.map(store =>
        `${store.id},${store.name},${store.owner?.full_name},${store.owner?.email},${store.category},${store.status},${store.products?.length},${store.total_revenue},${store.rating},${10},${store.created_at}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `stores_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast("Export Successful", {
      description: "Stores data has been exported.",
    })
  }

  const handleSelectStore = (store: Store) => {
    setSelectedStores((prev) => (prev.includes(store) ? prev.filter((each) => each.id !== store.id) : [...prev, store]))
  }

  const handleSelectAll = () => {
    setSelectedStores(selectedStores.length === filteredStores.length ? [] : filteredStores)
  }

  const handleBulkAction = async (action: "approve" | "suspend" | "delete" | "activate") => {
    if (selectedStores.length === 0) {
      toast.success("No stores selected", {
        description: "Please select stores to perform bulk actions.",
      })
      return
    }

    try {
      switch (action) {
        case "approve":
          await Promise.all(selectedStores.map(each => approveStore(each.id)))
          toast.success("Stores Approved", {
            description: `${selectedStores.length} stores have been approved.`,
          })
          setSelectedStores([])
          break;
        case "suspend":
          await Promise.all(selectedStores.map(each => suspendStore(each.id)))
          toast("Stores Suspended", {
            description: `${selectedStores.length} stores have been suspended.`,
          })
          setSelectedStores([])
          break;
        case "delete":
          setOpenDeleteModal(true)
          break;
        case "activate":
          await Promise.all(selectedStores.map(each => activateStore(each.id)))
          toast("Stores Activated", {
            description: `${selectedStores.length} stores have been activated.`,
          })
          setSelectedStores([])
          break;
        default:
          break;
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to perform bulk action.",
      })
    }
  }

  const handleDeleteStore = async () => {
    if (!storeToDelete) return

    try {
      await deleteStore(storeToDelete)
      setStoreToDelete(null)
      toast("Store Deleted", {
        description: "The store has been deleted successfully.",
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to delete store.",
      })
    }
  }

  const handleDeleteMultipleStores = async () => {
    if (!selectedStores.length) return

    try {
      await deleteStores(selectedStores.map(each => each.id))
      await Promise.all(selectedStores.map(each => {
        if (each.banner_url) {
          deleteImage(each.banner_url)
        }
        if (each.logo_url) {
          deleteImage(each.logo_url)
        }
      }))
      setSelectedStores([])
      toast("Stores Deleted", {
        description: `${selectedStores.length} stores have been deleted.`,
      })
    } catch (error) {
      toast("Error", {
        description: "Failed to delete stores.",
      })
    }
  }

  // Calculate stats
  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.status === "active").length,
    pending: stores.filter((s) => s.status === "pending").length,
    suspended: stores.filter((s) => s.status === "suspended").length,
    totalRevenue: stores.reduce((sum, s) => sum + s?.total_revenue!, 0),
    totalCommission: stores.reduce((sum, s) => sum + (s.total_revenue! * 10) / 100, 0),
  }

  // Get unique categories for filter
  const categories = [...new Set(storeTypes)]

  if (loadingStore) return <InnerLoading />


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Store Management</h1>
          <p className="text-gray-600">Manage all stores, applications, and performance</p>
        </div>

        <div className="flex gap-2 items-center flex-col lg:flex-row w-full lg:w-auto">
          <Button variant="outline" onClick={handleExport} disabled={isLoading} className="w-full lg:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Stores
          </Button>
          <Button variant="outline" onClick={loadStore} className="w-full lg:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingStore ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button disabled={isLoading} onClick={() => setIsCreateDialogOpen(true)} className="w-full lg:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Stores", value: stats.total, color: "text-gray-900", icon: Box, desc: `total of ${stats.total} stores`, iconBgColor: "bg-gray-100" },
          { label: "Active", value: stats.active, color: "text-green-600", icon: CheckCircle, desc: `${stats.active} active stores`, iconBgColor: "bg-green-100" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600", icon: Clock, desc: `${stats.pending} pending stores`, iconBgColor: "bg-yellow-100" },
          { label: "Suspended", value: stats.suspended, color: "text-red-600", icon: XCircle, desc: `${stats.suspended} suspended stores`, iconBgColor: "bg-red-100" },
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`, color: "text-orange-600", icon: DollarSign, desc: `${stats.totalRevenue} of total revenue stores`, iconBgColor: "bg-orange-100" },
          { label: "Total Commission", value: `$${(stats.totalCommission / 1000).toFixed(1)}k`, color: "text-blue-600", icon: Banknote, desc: `${stats.totalCommission} stores`, iconBgColor: "bg-blue-100" },
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
        {/* <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Stores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.totalCommission.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Commission</div>
          </CardContent>
        </Card> */}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search stores by name, owner, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category} {category === "All" ? "Categories" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader className="px-4">
          <CardTitle>All Stores ({filteredStores.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">

            {selectedStores.length > 0 && (
              <BulkAction
                actions={[
                  {
                    label: "Approve",
                    value: "approve",
                    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-300" />,
                  },
                  {
                    label: "Activate",
                    value: "activate",
                    icon: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
                  },
                  {
                    label: "Suspend",
                    value: "suspend",
                    icon: <XCircle className="mr-2 h-4 w-4 text-red-300" />,
                    variant: "destructive",
                  },
                  {
                    label: "Delete",
                    value: "delete",
                    icon: <Trash2 className="mr-2 h-4 w-4 text-red-500 " />,
                    variant: "destructive",
                  },
                ]}
                title="Update Stores"
                selectedCount={selectedStores.length}
                onClearSelection={() => {
                  setSelectedStores([]);
                }}
                onBulkAction={(action) => {
                  handleBulkAction(action as "approve" | "activate" | "suspend" | "delete")
                  if (action === "delete") {
                    setOpenDeleteModal(true)
                  }
                }}
                className="px-4"
              />
            )}


          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox checked={selectedStores.length === filteredStores.length} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <Checkbox checked={selectedStores.includes(store)} onCheckedChange={() => handleSelectStore(store)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={store.logo_url || "/placeholder.svg"}
                        alt={store.name}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-gray-500">{store.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{store.owner?.full_name}</div>
                      <div className="text-sm text-gray-500">{store.owner?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{store.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={
                          store.status === "active"
                            ? "default"
                            : store.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {store.status}
                      </Badge>
                      {/* <div className="text-xs text-gray-500">{store.status}</div> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {store.rating} ({store.reviews?.length})
                      </div>
                      <div className="text-sm text-gray-500">{store.products?.length} products</div>
                      <div className="text-sm text-gray-500">{store?.products?.[0]?.bought_past_month} orders</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${store?.total_revenue?.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">{10}% commission</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(store.created_at).toLocaleDateString()}</div>
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
                            setSelectedStore(store)
                            setIsViewModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStore(store)
                          setIsEditDialogOpen(true)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Store
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {store.status === "pending" && (
                          <DropdownMenuItem onClick={() => approveStore(store.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Store
                          </DropdownMenuItem>
                        )}
                        {store.status === "active" && (
                          <DropdownMenuItem onClick={() => suspendStore(store.id)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend Store
                          </DropdownMenuItem>
                        )}
                        {store.status === "suspended" && (
                          <DropdownMenuItem onClick={() => activateStore(store.id)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Activate Store
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => {
                            setStoreToDelete(store.id)
                            setOpenDeleteModal(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Store
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <strong>
                {filteredStores.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredStores.length)}
              </strong>{" "}
              of <strong>{filteredStores.length}</strong> stores
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

      {/* View Store Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Store Details</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStore(selectedStore)
                  setIsViewModalOpen(false)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            <DialogDescription>
              {selectedStore?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStore && (
            <div className="grid gap-6 py-4">
              <div className="flex items-start space-x-4">
                <Image
                  src={selectedStore.logo_url || "/placeholder.svg"}
                  alt={selectedStore.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedStore.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedStore.description}</p>
                  <div className="flex items-center space-x-2 mt-3">
                    <Badge variant="secondary">{selectedStore.category}</Badge>
                    <Badge
                      variant={
                        selectedStore.status === "active"
                          ? "default"
                          : selectedStore.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {selectedStore.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Store Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Owner:</strong> {selectedStore.owner?.full_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedStore.owner?.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedStore.phone}
                    </div>
                    <div>
                      <strong>Website:</strong> {selectedStore?.website_url}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedStore.address}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Rating:</strong> {selectedStore.rating}/5 ({selectedStore.reviews?.length} reviews)
                    </div>
                    <div>
                      <strong>Products:</strong> {selectedStore.products?.length}
                    </div>
                    <div>
                      <strong>Orders:</strong> {selectedStore.products?.[0].bought_past_month}
                    </div>
                    <div>
                      <strong>Revenue:</strong> ${selectedStore.total_revenue?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Commission Rate:</strong> 10%
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Created:</strong> {new Date(selectedStore.created_at).toLocaleString()}
                </div>
                {selectedStore.updated_at && (
                  <div>
                    <strong>Approved:</strong> {new Date(selectedStore?.updated_at).toLocaleString()}
                  </div>
                )}
                <div>
                  <strong>Last Active:</strong> {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action cannot be undone. This will permanently delete the ${selectedStores.length > 0 ? "stores" : "store"} and all its data from the database`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={selectedStores ? handleDeleteMultipleStores : handleDeleteStore}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-3rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <StoreForm
              loading={isLoading}
              store={selectedStore}
              onCancel={() => setIsEditDialogOpen(false)}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                // The store list will update automatically through the store subscription
              }}
              updateStore={updateStore}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Create Store Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-3rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
          </DialogHeader>
          <MerchantForm loading={isLoading} createStore={createStore} onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
