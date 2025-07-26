"use client"

import { useState, useEffect } from "react"
import {
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  Download,
  Mail,
  Phone,
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  BadgeX,
  Users,
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
import { toast } from "sonner"
import { ProfileWithOrders, useAdminUsersStore } from "@/lib/store/admin/usersStore"
import { Profile } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserForm, UserFormValues } from "@/components/admin/user/user-form"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { createUser, deleteUser, updateUser } from "@/lib/actions"
import { AdminUserAttributes } from "@supabase/supabase-js"
import InnerLoading from "@/components/layout/InnerLoading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteImage } from "@/lib/utils"
import { CardStats } from "@/components/ui/card-stats"


export default function AdminUsersPage() {
  const {
    profiles,
    isLoading,
    fetchProfiles,
    createProfile,
    updateProfile,
  } = useAdminUsersStore()

  const [filteredUsers, setFilteredUsers] = useState<ProfileWithOrders[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ProfileWithOrders | null>(null)
  const [userToDelete, setUserToDelete] = useState<ProfileWithOrders | null>(null)
  const [userToView, setUserToView] = useState<ProfileWithOrders | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [localLoading, setLocalLoading] = useState(false)


  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [fetchProfiles])

  const loadUsers = async () => {
    try {
      setLocalLoading(true)
      await fetchProfiles()
      setLocalLoading(false)
    } catch (error) {
      toast.error("Failed to load users")
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )


  useEffect(() => {
    const filtered = profiles
      .filter((user) => {
        const matchesSearch =
          user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.phone?.includes(searchTerm)

        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter

        return matchesSearch && matchesRole && matchesStatus
      })
      // Sort users: active first, then by status, then by name
      .sort((a, b) => {
        // Define status priority
        const statusOrder = { active: 1, pending: 2, suspended: 3, blocked: 4 };
        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 5;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 5;

        // If status is the same, sort by name
        if (statusA === statusB) {
          return (a.full_name || '').localeCompare(b.full_name || '');
        }

        return statusA - statusB;
      });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset page on filter change
  }, [profiles, searchTerm, roleFilter, statusFilter]);

  const handleAddUser = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: ProfileWithOrders) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleViewUser = (user: ProfileWithOrders) => {
    setUserToView(user)
    setIsViewModalOpen(true)
  }

  const handleFormSubmit = async (data: UserFormValues) => {
    if (editingUser) {
      // Update user
      try {
        const updates: AdminUserAttributes = {}

        if (data.email) updates.email = data.email
        if (data.role) updates.role = data.role
        if (data.full_name) updates.user_metadata = { full_name: data.full_name }

        await updateUser(editingUser.id, updates)
        await updateProfile(editingUser.id, data as Profile)
        toast("User updated", { description: `User ${data.full_name} has been updated.` })
        setIsFormOpen(false)
        setEditingUser(null)
      } catch (error: any) {
        toast.error("Failed to update user", { description: error.message || "Something went wrong during update" })
      }
    } else {
      // Add new user
      try {
        const user = await createUser({
          email: data.email,
          password: data.password!,
          full_name: data.full_name,

        })
        if (user) {
          const { password, ...profileData } = data
          await createProfile({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name,
            phone: data.phone || "",
            postal_code: "",
            gender: "other",
            address: "",
            avatar_url: "",
            created_at: new Date().toISOString(),
            is_verified: false,
            role: data.role || "customer",
            status: "active",
            withdrawal_pin: "",
            username: user.email?.split("@")[0],
            wallet_balance: 0,
            state: "",
            country: "",
            date_of_birth: profileData.date_of_birth || "",
            referred_by: "",
            city: "",
            preferred_currency: "USD",
            language: "en"
          })
        }
        toast("User created", { description: `User ${data.full_name} has been created.` })
      } catch (error: any) {
        toast.error("Failed to create user", { description: error.message || "Something went wrong during creation" })
      }
      setIsFormOpen(false)
      setEditingUser(null)
    }
  }

  const handleSelectUser = (user: Profile) => {
    setSelectedUsers((prev) => (prev.includes(user) ? prev.filter((id) => id !== user) : [...prev, user]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers)
    }
  }

  const handleBulkAction = async (action: "activate" | "suspend" | "verify" | "delete" | "block", users: Profile[]) => {
    if (users.length === 0) {
      toast("No users selected", {
        description: "Please select users to perform bulk actions.",
      })
      return
    }
    try {
      switch (action) {
        case "activate":
          users.forEach(async (user) => {
            await updateProfile(user.id, { status: "active" } as Profile)
          })
          toast("Users Activated", {
            description: `${users.length} users have been activated.`,
          })
          break;
        case "suspend":
          users.forEach(async (user) => {
            await updateProfile(user.id, { status: "suspended" } as Profile)
          })
          toast("Users Suspended", {
            description: `${users.length} users have been suspended.`,
          })

          break;
        case "verify":
          users.forEach(async (user) => {
            await updateProfile(user.id, { is_verified: true } as Profile)
          })
          toast("Users Verified", {
            description: `${users.length} users have been verified.`,
          })

          break;
        case "delete":
          // Process deletions one by one to handle errors properly
          users.forEach(async (user) => {
            await deleteUser(user.id);
          })
          await fetchProfiles()
          toast.success("Users Deleted", {
            description: `${users.length} user${users.length > 1 ? 's' : ''} deleted successfully.`,
          });

          break;
        case "block":
          users.forEach(async (user) => {
            await updateProfile(user.id, { status: "blocked" } as Profile)
          })
          toast("Users Blocked", {
            description: `${users.length} users have been blocked.`,
          })

          break;
        default: return
      }

      setSelectedUsers([])
    } catch (error) {
      toast.error(`Error performing ${action} action`, {
        description: error instanceof Error ? error.message : 'Failed to complete action',
      });
    }
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Phone,Role,Status,Verified,Wallet Balance,Total Orders,Total Spent,Created At,Last Login,Address,Date of Birth,KYC Status\n" +
      filteredUsers.map(u =>
        `${u.id},"${u.full_name}",${u.email},${u.phone},${u.role},${u.status},${u.is_verified},${u.wallet_balance},${u.orders?.length},${u.orders?.reduce((total, order) => total + order.total_amount, 0)},${u.created_at},${u.updated_at},"${u.address}",${u.date_of_birth},${u.is_verified}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast("Export Successful", {
      description: "Users data has been exported to CSV.",
    })
  }

  const handleDeleteUser = (user: ProfileWithOrders) => {
    setUserToDelete(user)
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      const imageUrl = userToDelete.avatar_url
      await deleteUser(userToDelete.id)
      if (imageUrl) {
        await deleteImage(imageUrl)
      }
      await fetchProfiles()
      toast.success("User Deleted", {
        description: `User ${userToDelete} has been deleted.`,
      })
      setUserToDelete(null)
    }
  }

  const stats = {
    total: profiles.length,
    active: profiles.filter((u) => u.status === "active").length,
    customers: profiles.filter((u) => u.role === "customer").length,
    merchants: profiles.filter((u) => u.role === "merchant").length,
    verified: profiles.filter((u) => u.is_verified).length,
    totalBalance: profiles.reduce((sum, u) => sum + u.wallet_balance, 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "suspended": return <Badge variant="destructive">Suspended</Badge>
      case "blocked": return <Badge variant="destructive">Blocked</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Verified</Badge>
      case "pending": return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-primary text-white"
      case "merchant": return "bg-purple-600 text-white hover:bg-purple-700"
      default: return "bg-blue-600 text-white hover:bg-blue-700"
    }
  }

  if (localLoading) return <InnerLoading />


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage all platform users and their accounts</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            loadUsers()
          }}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: stats.total, color: "text-gray-900", icon: Users, description: "Total number of users", iconBgColor: "bg-gray-200", textColor: "text-gray-900" },
          { label: "Active", value: stats.active, color: "text-green-600", icon: BadgeCheck, description: "Active users", iconBgColor: "bg-green-200", textColor: "text-green-600" },
          { label: "Customers", value: stats.customers, color: "text-blue-600", icon: Users, description: "Customer users", iconBgColor: "bg-blue-200", textColor: "text-blue-600" },
          { label: "Merchants", value: stats.merchants, color: "text-purple-600", icon: Users, description: "Merchant users", iconBgColor: "bg-purple-200", textColor: "text-purple-600" },
          { label: "Verified", value: stats.verified, color: "text-orange-600", icon: BadgeCheck, description: "Verified users", iconBgColor: "bg-orange-200", textColor: "text-orange-600" },
          { label: "Total Balance", value: `$${(stats.totalBalance / 1000).toFixed(1)}k`, color: "text-indigo-600", icon: BadgeCheck, description: "Total balance", iconBgColor: "bg-indigo-200", textColor: "text-indigo-600" },
        ].map((stat) => (
          // <Card key={stat.label}>
          //   <CardContent className="p-4 text-center">
          //     <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          //     <div className="text-sm text-gray-600">{stat.label}</div>
          //   </CardContent>
          // </Card>
          <CardStats
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={<stat.icon />}
            borderColor="border-gray-200"
            textColor={stat.textColor}
            iconBgColor={stat.iconBgColor}
            description={stat.description}
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
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="mb-4 px-4 pt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedUsers.length} of {paginatedUsers.length} selected on this page.
            </p>
            {selectedUsers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>Bulk Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("activate", selectedUsers)}>Activate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("block", selectedUsers)}>Block</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("verify", selectedUsers)}>Mark as Verified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("suspend", selectedUsers)}>Suspend</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={() => handleBulkAction("delete", selectedUsers)} className="text-red-500">
                    Delete
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role & Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user)}
                      onCheckedChange={() => handleSelectUser(user)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10">
                        <Avatar>
                          <AvatarImage className="w-full" src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      {getStatusBadge(user.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">${user.wallet_balance?.toFixed(2) || 0}</TableCell>
                  <TableCell className="text-right">{user.orders?.length || 0}</TableCell>
                  <TableCell>{getKycBadge(user.is_verified ? "verified" : "pending")}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit User
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Send Email
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBulkAction(user.status === "active" ? "suspend" : "activate", [user])}>
                          {user.status === "active" ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction(user.status === "blocked" ? "activate" : "block", [user])}>
                          {user.status === "blocked" ? <ShieldAlert className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                          {user.status === "blocked" ? "Unblock" : "Block"}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={user.is_verified} onClick={() => {
                          setSelectedUsers([user])
                          handleBulkAction("verify", [user])
                        }}>
                          {user.is_verified ? <BadgeCheck className="mr-2 h-4 w-4" /> : <BadgeX className="mr-2 h-4 w-4" />}
                          {user.is_verified ? "Verified" : "Verify"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <strong>
                {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </strong>{" "}
              of <strong>{filteredUsers.length}</strong> users
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
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(p - 1, 1)) }} />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages)) }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user details below." : "Fill in the form to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            initialData={editingUser ? {
              full_name: editingUser.full_name!,
              email: editingUser.email,
              phone: editingUser?.phone! || "",
              role: editingUser.role as "customer" | "merchant" | "admin"
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{userToView?.full_name}</DialogTitle>
            <DialogDescription>User ID: {userToView?.id}</DialogDescription>
          </DialogHeader>
          {userToView && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg">
                  {userToView.full_name?.charAt(0)}
                </div>
                <div>
                  <p><strong>Email:</strong> {userToView.email}</p>
                  <p><strong>Phone:</strong> {userToView.phone}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Account Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Role:</strong> {userToView.role}</div>
                  <div><strong>Status:</strong> {getStatusBadge(userToView.status)}</div>
                  <div><strong>KYC:</strong> {getKycBadge(userToView.is_verified ? "verified" : "pending")}</div>
                  <div><strong>Verified:</strong> {userToView.is_verified ? "Yes" : "No"}</div>
                  <div><strong>Joined:</strong> {new Date(userToView.created_at).toLocaleDateString()}</div>
                  <div><strong>Last Login:</strong> {userToView?.updated_at ? new Date(userToView.updated_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Financials</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Wallet Balance:</strong> ${userToView.wallet_balance?.toFixed(2) || 0}</div>
                  <div><strong>Total Spent:</strong> ${userToView.orders?.reduce((total, order) => total + order.total_amount, 0)?.toFixed(2) || 0}</div>
                  <div><strong>Total Orders:</strong> {userToView.orders?.length || 0}</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Address:</strong> {userToView.address || 'N/A'}</div>
                  <div><strong>Date of Birth:</strong> {userToView.date_of_birth || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
