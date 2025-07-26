"use client"

import { useState, useEffect } from "react"
import { Minus, CreditCard, Clock, CheckCircle, XCircle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWithdrawalStore } from "@/lib/store/withdrawalStore"
import { useAuthStore } from "@/lib/store/auth"
import { useWalletStore } from "@/lib/store/walletStore"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import InnerLoading from "@/components/layout/InnerLoading"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Withdrawal } from "@/lib/types"

export default function WithdrawalsPage() {
  const { profile, setProfile } = useAuthStore();
  const { withdrawals, getWithdrawalsByUser, createWithdrawal, loading } = useWithdrawalStore();
  const { wallets, fetchWalletsByUser, loading: walletsLoading } = useWalletStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewWithdrawalOpen, setIsNewWithdrawalOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [newWithdrawal, setNewWithdrawal] = useState({
    amount: "",
    wallet_address: "",
    bank_name: "",
    account_number: "",
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "crypto_usdt_erc20":
        return "USDT (ERC20)"
      case "crypto_usdt_trc20":
        return "USDT (TRC20)"
      case "crypto_btc":
        return "Bitcoin"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method.replace(/_/g, " ").toUpperCase()
    }
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesTab = activeTab === "all" || withdrawal.status === activeTab
    const matchesSearch =
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMethodLabel(withdrawal.method).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (withdrawal.transactionHash && withdrawal.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "amount-high":
        return b.amount - a.amount
      case "amount-low":
        return a.amount - b.amount
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })


  // Fetch real withdrawals for the user
  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLocalLoading(true);
      await getWithdrawalsByUser(profile.id);
      await fetchWalletsByUser(profile.id);
      setLocalLoading(false);
    })();
  }, [getWithdrawalsByUser, fetchWalletsByUser]);

  const stats = {
    total: withdrawals.reduce((sum, w) => sum + w.amount, 0),
    success: withdrawals.filter((w) => w.status === "success").reduce((sum, w) => sum + w.amount, 0),
    pending: withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0),
    failed: withdrawals.filter((w) => w.status === "failed").length,
  }

  // Add Withdrawal handler
  const handleNewWithdrawal = async () => {
    setPinError("");
    if (!newWithdrawal.amount) {
      toast.error("Validation Error",{
        description: "Please fill in all required fields.",
      });
      return;
    }
    if (!selectedWalletId) {
      toast( "Select Wallet",{
        description: "Please select a wallet to withdraw to.",
      });
      return;
    }
    if (!profile?.withdrawal_pin) {
      //setIsPinModalOpen(true);
      setPinError("No withdrawal PIN. Please create one.");
      return;
    }
    if (enteredPin !== profile?.withdrawal_pin) {
      setPinError("Incorrect PIN. Please try again.");
      return;
    }
   if (Number(newWithdrawal.amount) > profile?.wallet_balance){
      toast.error("Insufficient balance.", {description: "Please add more funds to your wallet."})
      return
   }

    try {
      const selectedWallet = wallets.find(w => w.id === selectedWalletId);
      if (!selectedWallet) throw new Error("Wallet not found");
      const withdrawal = {
        user_id: profile.id,
        amount: Number.parseFloat(newWithdrawal.amount),
        currency: selectedWallet.currency,
        method: selectedWallet.type,
        status: 'pending' as const,
        date: new Date().toISOString(),
        processed_date: null,
        wallet_address: selectedWallet.address,
        transaction_hash: null,
        bank_name: selectedWallet.bank_name || null,
        account_number: selectedWallet.account_number || null,
        fee: Number.parseFloat(newWithdrawal.amount) * 0.02, // 2% fee
        net_amount: Number.parseFloat(newWithdrawal.amount) * 0.98,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await createWithdrawal(withdrawal);
      await getWithdrawalsByUser(profile.id);
      setNewWithdrawal({ amount: "", wallet_address: "", bank_name: "", account_number: "" });
      setEnteredPin("");
      setIsNewWithdrawalOpen(false);
      toast.success("Withdrawal Initiated",{
        description: "Your withdrawal request has been submitted and is pending.",
      });
    } catch (error) {
      toast("Error",{
        description: "Failed to initiate withdrawal. Please try again."
      });
    }
  };

  const handleViewDetails = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal)
    setIsDetailsOpen(true)
  }

  // Pagination logic
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(sortedWithdrawals.length / pageSize);
  const paginatedWithdrawals = sortedWithdrawals.slice((page - 1) * pageSize, page * pageSize);

  if (localLoading || loading || walletsLoading) return <InnerLoading />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Records</h1>
          <p className="text-gray-600">Track all your withdrawal transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isNewWithdrawalOpen} onOpenChange={setIsNewWithdrawalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Minus className="h-4 w-4 mr-2" />
                New Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Withdrawal</DialogTitle>
                <DialogDescription>Withdraw funds from your wallet to external accounts.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100.00"
                    value={newWithdrawal.amount}
                    onChange={(e) => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                  />
                </div>
                {/* Wallet selection */}
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Select Wallet *</Label>
                  {wallets.length === 0 ? (
                    <Button onClick={() => router.push("/dashboard/wallet")}>
                      Add Wallet
                    </Button>
                  ) : (
                    <Select
                      value={selectedWalletId}
                      onValueChange={setSelectedWalletId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name} ({wallet.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {/* Withdrawal PIN */}
 
                  <div className="grid gap-2">
                    <Label htmlFor="pin">Withdrawal PIN *</Label>
                    <div className=" flex items-center  h-10 w-full rounded-md border border-input bg-background  py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                    <Input
                      id="pin"
                      type="password"
                      maxLength={4}
                      value={enteredPin}
                      onChange={e => setEnteredPin(e.target.value)}
                      className="border-r-0 "
                      
                    />
                    <Button className="border border-primary text-primary" variant={"ghost"} asChild>
                      <a href="/dashboard/account">
                        {profile?.withdrawal_pin ? "Change PIN" : "Create PIN"}
                      </a>
                    </Button>
                    </div>
                    {pinError && <span className="text-red-500 text-xs">{pinError}</span>}
                  </div>
                
              </div>
              <DialogFooter>
                <Button onClick={handleNewWithdrawal}>
                  {loading ? "Loading..." : "Submit"}
                  </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards (styled like recharge page) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">${stats.success.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">${stats.pending.toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Not found design if no withdrawals */}
      {withdrawals.length < 1 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No withdrawal records found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeTab !== "all"
                ? "No records match your search criteria"
                : "You haven't made any withdrawals yet"}
            </p>

          </CardContent>
        </Card>
      ) : (
        <>
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" onClick={() => setActiveTab("pending")}>
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="success" onClick={() => setActiveTab("success")}>
                    Success
                  </TabsTrigger>
                  <TabsTrigger value="failed" onClick={() => setActiveTab("failed")}>
                    Failed
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search withdrawals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                    <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{withdrawal.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(withdrawal.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getMethodLabel(withdrawal.method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${withdrawal.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(withdrawal)}>View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination below the table */}
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }}
                      aria-disabled={page === 1}
                      tabIndex={page === 1 ? -1 : 0}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={e => { e.preventDefault(); setPage(i + 1) }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }}
                      aria-disabled={page === totalPages}
                      tabIndex={page === totalPages ? -1 : 0}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>)}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>View detailed information about this withdrawal.</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Withdrawal ID</Label>
                <Input value={selectedWithdrawal.id} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input value={`$${selectedWithdrawal.amount.toFixed(2)}`} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Method</Label>
                <Input value={getMethodLabel(selectedWithdrawal.method)} readOnly />
              </div>
              {selectedWithdrawal.method.startsWith("crypto_") && (
                <div className="grid gap-2">
                  <Label>Wallet Address</Label>
                  <Input value={selectedWithdrawal?.wallet_address!} readOnly />
                </div>
              )}
              {selectedWithdrawal.method === "bank_transfer" && (
                <>
                  <div className="grid gap-2">
                    <Label>Bank Name</Label>
                    <Input value={selectedWithdrawal?.bank_name!} readOnly />
                  </div>
                  <div className="grid gap-2">
                    <Label>Account Number</Label>
                    <Input value={selectedWithdrawal?.account_number!} readOnly />
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Label className="col-span-2">Status</Label>
                <Badge className={getStatusColor(selectedWithdrawal.status)}>
                  {getStatusIcon(selectedWithdrawal.status)}
                  {selectedWithdrawal.status.toUpperCase()}
                </Badge>
              </div>
              {selectedWithdrawal.status === "failed" && selectedWithdrawal?.failure_reason && (
                <div className="grid gap-2">
                  <Label>Failure Reason</Label>
                  <Input value={selectedWithdrawal?.failure_reason} readOnly />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Withdrawal PIN Modal (reuse logic from account page) */}
      {/* ... You can import and use the WithdrawalPinModal component here ... */}
    </div>
  )
}
