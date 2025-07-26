"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  MoreVertical,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  Pencil,
  ChevronDown,
  RefreshCw,
  Edit,
  DollarSign
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { BulkAction } from "@/components/admin/layout/BulkAction"

import { useAdminRechargesStore } from "@/lib/store/admin/rechargesStore"
import { useAdminWithdrawalsStore } from "@/lib/store/admin/withdrawalsStore"
import { Recharge, Withdrawal } from "@/lib/types"
import Image from "next/image"
import { toast } from "sonner"
import InnerLoading from "@/components/layout/InnerLoading"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { ButtonLoading } from "@/components/ui/loading";
import { CardStats } from "@/components/ui/card-stats";



export const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]



export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("recharges")
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  const {
    recharges,
    fetchRecharges,
    updateRecharge,
    isLoading: isLoadingRecharges
  } = useAdminRechargesStore()

  const {
    withdrawals,
    fetchWithdrawals,
    updateWithdrawal,
    isLoading: isLoadingWithdrawals
  } = useAdminWithdrawalsStore()

  const [filteredRecharges, setFilteredRecharges] = useState(recharges)
  const [filteredWithdrawals, setFilteredWithdrawals] = useState(withdrawals)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [transactionToUpdate, setTransactionToUpdate] = useState<Recharge | null>(null)
  const [WithdrawalToUpdate, setWithdrawalToUpdate] = useState<Withdrawal | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Recharge | Withdrawal | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination logic
  const currentData = activeTab === "Recharges" ? filteredRecharges : filteredWithdrawals
  const totalPages = Math.ceil(currentData.length / itemsPerPage)
  const paginatedRecharges = filteredRecharges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )


  useEffect(() => {
    loadRechargesAndWithdrawals()
  }, [])

  const loadRechargesAndWithdrawals = async () => {
    try {
      setIsLocalLoading(true)
      await fetchRecharges()
      await fetchWithdrawals()

    } catch (error) {
      toast("Error", {
        description: "Failed to load recharges and withdrawals",

      })
    } finally {
      setIsLocalLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "recharges") {
      const filtered = recharges.filter((txn) => {
        const matchesSearch =
          txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.amount?.toString().includes(searchTerm.toLowerCase()) ||
          txn.method?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || txn.status === statusFilter
        const matchesMethod = methodFilter === "all" || txn.method === methodFilter

        return matchesSearch && matchesStatus && matchesMethod
      })
      setFilteredRecharges(filtered)
    } else {
      const filtered = withdrawals.filter((withdrawal) => {
        const matchesSearch =
          withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.amount?.toString().includes(searchTerm.toLowerCase()) ||
          withdrawal.method?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter
        const matchesMethod = methodFilter === "all" || withdrawal.method === methodFilter

        return matchesSearch && matchesStatus && matchesMethod
      })
      setFilteredWithdrawals(filtered)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [activeTab, recharges, withdrawals, searchTerm, statusFilter, methodFilter])

  const handleExport = () => {
    if (activeTab === "recharges") {
      const csvContent = "data:text/csv;charset=utf-8," +
        "ID,User,Email,Amount,Method,Status,Fee,Date\n" +
        filteredRecharges.map(t => `${t.id},${t.user?.full_name},${t.user?.email},${t.amount},${t.method},${t.status},${t.fee},${t.created_at}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `Recharges_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      const csvContent = "data:text/csv;charset=utf-8," +
        "ID,User,Email,Amount,Currency,Net Amount,Method,Status,Date\n" +
        filteredWithdrawals.map(p => `${p.id},${p.user?.full_name},${p.user?.email},${p.amount},${p.currency},${p.net_amount},${p.method},${p.status},${p.created_at}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `Withdrawals_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast("Export Successful", {
      description: `${activeTab} data has been exported.`,
    })
  }

  const handleUpdateRechargestatus = async (transactionId: string, newStatus: string) => {
    await updateRecharge(transactionId, { status: newStatus as Withdrawal["status"] })
    toast("Status Updated", {
      description: `Transaction ${transactionId} status updated to ${newStatus}.`,
    })
    setTransactionToUpdate(null)
  }

  const handleUpdateWithdrawalStatus = async (withdrawalId: string, newStatus: string) => {
    await updateWithdrawal(withdrawalId, { status: newStatus as Withdrawal["status"] })
    toast("Status Updated", {
      description: `Withdrawal ${withdrawalId} status updated to ${newStatus}.`,
    })
    setWithdrawalToUpdate(null)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = activeTab === 'recharges'
        ? filteredRecharges.map(t => t.id)
        : filteredWithdrawals.map(w => w.id);
      setSelectedIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  const toggleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
      // Check if all items are now selected
      const allIds = activeTab === 'recharges'
        ? filteredRecharges.map(t => t.id)
        : filteredWithdrawals.map(w => w.id);
      setSelectAll(selectedIds.length + 1 === allIds.length);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
      setSelectAll(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const updatePromises = selectedIds.map(id => {
        return activeTab === 'recharges'
          ? updateRecharge(id, { status: newStatus as Recharge["status"] })
          : updateWithdrawal(id, { status: newStatus as Withdrawal["status"] });
      });

      await Promise.all(updatePromises);

      toast.success("Bulk Update Successful", {
        description: `Updated ${selectedIds.length} items to ${newStatus} status.`,
      });

      setSelectedIds([]);
      setSelectAll(false);
      setIsBulkActionOpen(false);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update selected items. Please try again.",
      });
    }
  };

  const handleEdit = (item: Recharge | Withdrawal) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedData: Partial<Recharge & Withdrawal>) => {
    if (!editingItem) return;

    try {

      if (activeTab === 'recharges') {
        await updateRecharge(editingItem.id, updatedData as Partial<Recharge>);
      } else {
        await updateWithdrawal(editingItem.id, updatedData as Partial<Withdrawal>);
      }

      toast("Update Successful", {
        description: `${activeTab === 'recharges' ? 'Recharge' : 'Withdrawal'} has been updated.`,
      });

      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast("Error", {
        description: `Failed to update ${activeTab === 'recharges' ? 'recharge' : 'withdrawal'}.`,
      });
    } 
  };


  const rechargeStats = {
    total: recharges.length,
    completed: recharges.filter((t) => t.status === "success").length,
    pending: recharges.filter((t) => t.status === "pending").length,
    failed: recharges.filter((t) => t.status === "failed").length,
    totalAmount: recharges
      .filter((t) => t.status === "success")
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    totalCommission: recharges
      .filter((t) => t.status === "success")
      .reduce((sum, t) => sum + (t.fee || 0), 0),
  }

  const withdrawalStats = {
    total: withdrawals.length,
    completed: withdrawals.filter((p) => p.status === "success").length,
    pending: withdrawals.filter((p) => p.status === "pending").length,
    processing: withdrawals.filter((p) => p.status === "failed").length,
    totalAmount: withdrawals.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalCommission: withdrawals.reduce((sum, p) => sum + (p.fee || 0), 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const renderRechargeRow = (txn: Recharge) => (
    <TableRow key={txn.id}>
      <TableCell>
        <Checkbox
          checked={selectedIds.includes(txn.id)}
          onCheckedChange={(checked) => toggleSelectItem(txn.id, checked as boolean)}
          aria-label={`Select transaction ${txn.id}`}
        />
      </TableCell>
      <TableCell className="font-medium">{txn.id}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Image
                src={txn.prove_url || ''}
                alt={txn.id}
                width={100}
                height={100}
                className="w-16 h-16 rounded-full"
              />
            </TooltipTrigger>
            <TooltipContent className="px-2 hidden md:block">
              <div className=" h-[50vh] overflow-y-auto">
                <Image
                  src={txn.prove_url || ''}
                  alt={txn.id}
                  width={200}
                  height={200}
                  className="size-full rounded-lg"
                />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>{txn.user?.full_name || 'N/A'}</TableCell>
      <TableCell>{txn.user?.email || 'N/A'}</TableCell>
      <TableCell>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: txn.currency || 'USD',
        }).format(txn.amount)}
      </TableCell>
      <TableCell>{txn.method || 'N/A'}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(txn.status)}>
          {getStatusIcon(txn.status)}
          <span className="ml-1">{txn.status}</span>
        </Badge>
      </TableCell>
      <TableCell>{txn.currency || 'N/A'}</TableCell>
      <TableCell>{new Date(txn.created_at).toLocaleString() || 'N/A'}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedRecharge(txn);
              setIsViewModalOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(txn)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {txn.status !== 'success' && (
              <DropdownMenuItem onClick={() => handleUpdateRechargestatus(txn.id, 'success')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            {txn.status !== 'pending' && (
              <DropdownMenuItem onClick={() => handleUpdateRechargestatus(txn.id, 'pending')}>
                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                Mark as Pending
              </DropdownMenuItem>
            )}
            {txn.status !== 'failed' && (
              <DropdownMenuItem onClick={() => handleUpdateRechargestatus(txn.id, 'failed')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Mark as Failed
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const renderWithdrawalRow = (withdrawal: Withdrawal) => (
    <TableRow key={withdrawal.id}>
      <TableCell>
        <Checkbox
          checked={selectedIds.includes(withdrawal.id)}
          onCheckedChange={(checked) => toggleSelectItem(withdrawal.id, checked as boolean)}
          aria-label={`Select withdrawal ${withdrawal.id}`}
        />
      </TableCell>
      <TableCell className="font-medium">{withdrawal.id}</TableCell>
      <TableCell>{withdrawal.user?.full_name || 'N/A'}</TableCell>
      <TableCell>{withdrawal.user?.email || 'N/A'}</TableCell>
      <TableCell>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(withdrawal.amount)}
      </TableCell>
      <TableCell>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(withdrawal.fee)}
      </TableCell>
      <TableCell>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(withdrawal.net_amount)}
      </TableCell>
      <TableCell>{withdrawal.method || 'N/A'}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(withdrawal.status)}>
          {getStatusIcon(withdrawal.status)}
          <span className="ml-1">{withdrawal.status}</span>
        </Badge>
      </TableCell>
      <TableCell>{new Date(withdrawal.created_at).toLocaleString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedWithdrawal(withdrawal);
              setIsViewModalOpen(true);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(withdrawal)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {withdrawal.status !== 'success' && (
              <DropdownMenuItem onClick={() => handleUpdateWithdrawalStatus(withdrawal.id, 'success')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            {withdrawal.status !== 'pending' && (
              <DropdownMenuItem onClick={() => handleUpdateWithdrawalStatus(withdrawal.id, 'pending')}>
                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                Mark as Pending
              </DropdownMenuItem>
            )}
            {withdrawal.status !== 'failed' && (
              <DropdownMenuItem onClick={() => handleUpdateWithdrawalStatus(withdrawal.id, 'failed')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Mark as Failed
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const renderTableBody = () => {
    if (activeTab === 'recharges') {
      return paginatedRecharges.length > 0 ? (
        paginatedRecharges.map(renderRechargeRow)
      ) : (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
            No Recharges found
          </TableCell>
        </TableRow>
      );
    } else {
      return paginatedWithdrawals.length > 0 ? (
        paginatedWithdrawals.map(renderWithdrawalRow)
      ) : (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
            No Withdrawals found
          </TableCell>
        </TableRow>
      );
    }
  };

  if (isLocalLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-600">Monitor Recharges, Withdrawals, and payment methods</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export {activeTab === "recharges" ? "Recharges" : "Withdrawals"}
          </Button>
          <Button variant="outline" onClick={loadRechargesAndWithdrawals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "recharges" ? "default" : "ghost"}
          onClick={() => {
            setActiveTab("recharges")
            setSelectedIds([])
            setSelectAll(false)
          }}
          className="rounded-md"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Recharges
        </Button>
        <Button
          variant={activeTab === "withdrawals" ? "default" : "ghost"}
          onClick={() => {
            setActiveTab("withdrawals")
            setSelectedIds([])
            setSelectAll(false)
          }}
          className="rounded-md"
        >
          <Banknote className="h-4 w-4 mr-2" />
          Withdrawals
        </Button>
      </div>

      {/* Stats for Recharges */}
      {activeTab === "recharges" && (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            {title: "Total", value: rechargeStats.total, icon: DollarSign, description: "Total Recharges", textColor: "text-gray-600", iconBgColor: "bg-gray-100"},
            {title: "Completed", value: rechargeStats.completed, icon: CheckCircle, description: "Completed Recharges", textColor: "text-green-600", iconBgColor: "bg-green-100"},
            {title: "Pending", value: rechargeStats.pending, icon: Clock, description: "Pending Recharges", textColor: "text-yellow-600", iconBgColor: "bg-yellow-100"},
            {title: "Failed", value: rechargeStats.failed, icon: XCircle, description: "Failed Recharges", textColor: "text-red-600", iconBgColor: "bg-red-100"},
            {title: "Total Amount", value: rechargeStats.totalAmount, icon: DollarSign, description: "Total Amount", textColor: "text-gray-600", iconBgColor: "bg-gray-100"},
            {title: "Total Commission", value: rechargeStats.totalCommission, icon: Banknote , description: "Total Commission", textColor: "text-gray-600", iconBgColor: "bg-gray-100"}
          ].map((stat) => (
            <CardStats
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={<stat.icon />}
              description={stat.description}
              borderColor="border-gray-200"
              textColor={stat.textColor}
              iconBgColor={stat.iconBgColor}
            />
          ))}
          
        </div>
      )}

      {/* Stats for Withdrawals */}
      {activeTab === "withdrawals" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            {title: "Total", value: withdrawalStats.total, icon: DollarSign, description: "Total Withdrawals", textColor: "text-gray-600", iconBgColor: "bg-gray-100"},
            {title: "Completed", value: withdrawalStats.completed, icon: CheckCircle, description: "Completed Withdrawals", textColor: "text-green-600", iconBgColor: "bg-green-100"},
            {title: "Pending", value: withdrawalStats.pending, icon: Clock, description: "Pending Withdrawals", textColor: "text-yellow-600", iconBgColor: "bg-yellow-100"},
            {title: "processing", value: withdrawalStats.processing, icon: Clock, description: "Processing Withdrawals", textColor: "text-blue-600", iconBgColor: "bg-blue-100"},
            {title: "Total Amount", value: withdrawalStats.totalAmount, icon: DollarSign, description: "Total Amount", textColor: "text-gray-600", iconBgColor: "bg-gray-100"},
            {title: "Total Commission", value: withdrawalStats.totalCommission, icon: Banknote , description: "Total Commission", textColor: "text-gray-600", iconBgColor: "bg-gray-100"}
          ].map((stat) => (
            <CardStats
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={<stat.icon />}
              description={stat.description}
              borderColor="border-gray-200"
              textColor={stat.textColor}
              iconBgColor={stat.iconBgColor}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={
                  activeTab === "recharges"
                    ? "Search Recharges by ID, user, email, or order..."
                    : "Search Withdrawals by ID, store, or owner..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="crypto_usdt_trc20">USDT TRC20</SelectItem>
                  <SelectItem value="crypto_usdt_erc20">USDT ERC20</SelectItem>
                  <SelectItem value="crypto_btc">Bitcoin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tables */}
      {activeTab === "recharges" ? (
        <Card>
          <CardHeader className="px-4">
            <CardTitle>Recharges ({filteredRecharges.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedIds.length > 0 && (
              <BulkAction
                selectedCount={selectedIds.length}
                onClearSelection={() => {
                  setSelectedIds([]);
                  setSelectAll(false);
                }}
                onBulkAction={handleBulkStatusUpdate}
                className="px-4"
              />
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Recharge ID</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>currency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <strong>
                  {filteredRecharges.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredRecharges.length)}
                </strong>{" "}
                of <strong>{filteredRecharges.length}</strong> Recharges
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
                    {[...Array(Math.ceil(filteredRecharges.length / itemsPerPage))].map((_, i) => (
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
                          setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredRecharges.length / itemsPerPage)))
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawals ({filteredWithdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedIds.length > 0 && (
              <BulkAction
                selectedCount={selectedIds.length}
                onClearSelection={() => {
                  setSelectedIds([]);
                  setSelectAll(false);
                }}
                onBulkAction={handleBulkStatusUpdate}
                className="px-4"
              />
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Withdrawal ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <strong>
                  {filteredWithdrawals.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)}
                </strong>{" "}
                of <strong>{filteredWithdrawals.length}</strong> Withdrawals
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
                    {[...Array(Math.ceil(filteredWithdrawals.length / itemsPerPage))].map((_, i) => (
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
                          setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredWithdrawals.length / itemsPerPage)))
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={() => {
        setIsViewModalOpen(false)
        setSelectedRecharge(null)
        setSelectedWithdrawal(null)
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-4rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete transaction information</DialogDescription>
          </DialogHeader>
          {selectedRecharge && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Transaction ID:</strong> {selectedRecharge.id}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <strong>Recharge Prove:</strong>
                    <span title="View Recharge Prove" className="cursor-pointer  ">
                      <a href={selectedRecharge.prove_url!} target="_blank" rel="noopener noreferrer">
                        <Eye className="size-8" />
                      </a>
                    </span>
                  </div>
                  <Image width={200} height={200} src={selectedRecharge.prove_url! || "/placeholder-logo.png"} alt="Recharge Prove" />
                </div>
                <div>
                  <strong>Customer:</strong> {selectedRecharge.user?.full_name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedRecharge.user?.email || 'N/A'}
                </div>
                <div>
                  <strong>Amount:</strong> {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedRecharge.currency || 'USD',
                  }).format(selectedRecharge.amount)}
                </div>
                <div>
                  <strong>Fee:</strong> {selectedRecharge.fee || 0}
                </div>
                <div>
                  <strong>Net Amount:</strong> {selectedRecharge.amount || 0}
                </div>
                <div>
                  <strong>Payment Method:</strong> {selectedRecharge.method.replace("_", " ")}
                </div>
                <div>
                  <strong>Wallet Address:</strong> {selectedRecharge?.metadata?.wallet_address || '-'}
                </div>
                <div>
                  <strong>Exchange Rate:</strong> {selectedRecharge?.metadata?.exchange_rate || '-'}
                </div>
                <div>
                  <strong>Reference:</strong> {selectedRecharge.reference_id || '-'}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge className={getStatusColor(selectedRecharge.status)} variant="secondary">
                    {selectedRecharge.status}
                  </Badge>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedRecharge.created_at).toLocaleString()}
                </div>
              </div>
              {selectedRecharge.updated_at && (
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedRecharge.updated_at).toLocaleString()}
                </div>
              )}
              <div>
                <strong>Description:</strong> {selectedRecharge.description || '-'}
              </div>
            </div>
          )}
          {selectedWithdrawal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Withdrawal ID:</strong> {selectedWithdrawal.id}
                </div>
                <div>
                  <strong>User Name:</strong> {selectedWithdrawal.user?.full_name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedWithdrawal.user?.email || 'N/A'}
                </div>
                <div>
                  <strong>Amount:</strong> {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(selectedWithdrawal.amount)}
                </div>
                <div>
                  <strong>Commission:</strong> {selectedWithdrawal.fee || 0}
                </div>
                <div>
                  <strong>Net Amount:</strong> {selectedWithdrawal.net_amount || 0}
                </div>
                <div>
                  <strong>Method:</strong> {selectedWithdrawal.method.replace("_", " ")}
                </div>
                <div className="col-span-2">
                  <strong>Wallet Address:</strong> {selectedWithdrawal?.wallet_address || '-'}
                </div>
                <div>
                  <strong>Bank Name:</strong> {selectedWithdrawal?.bank_name || '-'}
                </div>
                <div>
                  <strong>Account Number:</strong> {selectedWithdrawal?.account_number || '-'}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge className={getStatusColor(selectedWithdrawal.status)} variant="secondary">
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedWithdrawal.created_at).toLocaleString()}
                </div>
              </div>
              {selectedWithdrawal.updated_at && (
                <div>
                  <strong>Completed:</strong> {new Date(selectedWithdrawal.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/*Edit Recharge Modal*/}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {activeTab === 'recharges' ? 'Recharge' : 'Withdrawal'}</DialogTitle>
            <DialogDescription>
              Update the details of this {activeTab === 'recharges' ? 'recharge' : 'withdrawal'}.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  defaultValue={editingItem.amount}
                  className="col-span-3"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setEditingItem(prev => ({
                      ...prev!,
                      amount: isNaN(value) ? 0 : value
                    }));
                  }}
                />
              </div>
              {activeTab === 'withdrawals' && (
                <div >
                  <Label htmlFor="fee" className="text-right">
                    Fee
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    defaultValue={(editingItem as Withdrawal).fee}
                    className="col-span-3"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setEditingItem(prev => ({
                        ...prev!,
                        fee: isNaN(value) ? 0 : value
                      }));
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingItem.status}
                  onValueChange={(value) =>
                    setEditingItem(prev => ({
                      ...prev!,
                      status: value as any
                    }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {activeTab === 'withdrawals' && (
                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-right">
                    Wallet Address
                  </Label>
                  <Input
                    id="walletAddress"
                    defaultValue={(editingItem as Withdrawal).wallet_address || ''}
                    className="col-span-3"
                    onChange={(e) =>
                      setEditingItem(prev => ({
                        ...prev!,
                        wallet_address: e.target.value
                      }))
                    }
                  />
                </div>
              )}

            </div>
          )}
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
            disabled={isLoadingRecharges || isLoadingWithdrawals }
              type="submit"
              onClick={() => {
                if (editingItem) {
                  handleSaveEdit({
                    amount: editingItem.amount,
                    status: editingItem.status,
                    ...(activeTab === 'withdrawals' ? {
                      fee: (editingItem as Withdrawal).fee,
                      wallet_address: (editingItem as Withdrawal).wallet_address
                    } : {}),
                    // notes: editingItem.notes
                  });
                }
              }}
            >
              {isLoadingRecharges || isLoadingWithdrawals ? <ButtonLoading /> : 'Save changes'}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
