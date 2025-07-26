"use client"

import { useState, useEffect } from "react"
import { Plus, Download, CreditCard, Clock, CheckCircle, XCircle, Wallet, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useRechargeStore } from "@/lib/store/rechargeStore"
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
import { useContentStore } from "@/lib/store/admin/contentStore"

type RechargeMethods = "crypto_usdt_erc20" | "crypto_usdt_trc20" | "crypto_btc" | "crypto_eth" | "bank_transfer"

// Platform wallet addresses and QR images for each crypto method
// const platformWallets: Record<string, { address: string; qr: string }> = {
//   crypto_usdt_erc20: {
//     address: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
//     qr: "/images/crypto/usdt-erc20-qr.png",
//   },
//   crypto_usdt_trc20: {
//     address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
//     qr: "/images/crypto/usdt-trc20-qr.png",
//   },
//   crypto_btc: {
//     address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
//     qr: "/images/crypto/btc-qr.png",
//   },
//   crypto_bnb: {
//     address: "bnb1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
//     qr: "/images/crypto/bnb-qr.png",
//   },
// }


export default function RechargePage() {
  const { profile } = useAuthStore();
  const { fetchContactInfo} = useContentStore();
  const { recharges, getRechargesByUser, loading, createRecharge } = useRechargeStore();
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewRechargeOpen, setIsNewRechargeOpen] = useState(false)
  const [selectedRecharge, setSelectedRecharge] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [newRecharge, setNewRecharge] = useState<{ amount: string, method: RechargeMethods, walletAddress: string }>({
    amount: "",
    method: "" as RechargeMethods,
    walletAddress: "",
  })

  const [platformWallets, setPlatformWallet] = useState<Record<string, {address: string, qr: string}>>({})
  const [receiptUrl, setReceiptUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  // Remove useToast

  // Pagination state (should be after sortedRecharges)
  const [page, setPage] = useState(1)
  const pageSize = 10
  // Filter by tab
  const filteredByTab = activeTab === "all"
    ? recharges
    : recharges.filter((r) => r.status === activeTab)
  // Filter by search
  const filteredBySearch = searchTerm
    ? filteredByTab.filter((r) =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.method && getMethodLabel(r.method).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : filteredByTab
  // Sort
  const sortedRecharges = [...filteredBySearch].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "amount-high":
        return b.amount - a.amount
      case "amount-low":
        return a.amount - b.amount
      default:
        return 0
    }
  })
  // Pagination
  const totalPages = Math.ceil(sortedRecharges.length / pageSize)
  const paginatedRecharges = sortedRecharges.slice((page - 1) * pageSize, page * pageSize)

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1)
  }, [activeTab, sortBy, searchTerm, recharges])

  // Fetch real recharges for the user
  useEffect(() => {
    if(!profile) return 
    (async() => {
      setLocalLoading(true)
     await getRechargesByUser(profile.id)
     setLocalLoading(false)
  })()
  }, [getRechargesByUser])

  useEffect(() => {
    (async() => {
      const contactInfo = await fetchContactInfo()
      if(contactInfo){
        setPlatformWallet({
          ["crypto_usdt_erc20"]:{ address: contactInfo.wallet_erc20_code, qr: contactInfo.usdt_wallet_erc20 },
          ["crypto_usdt_trc20"]:{ address: contactInfo.wallet_trc20_code, qr: contactInfo.usdt_wallet_trc20 },
          ["crypto_btc"]:{ address: contactInfo.btc_wallet_code, qr: contactInfo.btc_wallet },
          ["crypto_eth"]:{ address: contactInfo.eth_wallet_code, qr: contactInfo.eth_wallet },
        })
      }
    })()
  }, [fetchContactInfo])


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
      case "crypto_eth":
        return "Ethereum"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method.replace(/_/g, " ").toUpperCase()
    }
  }

  const stats = {
    total: recharges.reduce((sum, r) => sum + r.amount, 0),
    success: recharges.filter((r) => r.status === "success").reduce((sum, r) => sum + r.amount, 0),
    pending: recharges.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0),
    failed: recharges.filter((r) => r.status === "failed").length,
  }

  // Only allow these methods
  const allowedMethods = [
    "crypto_usdt_erc20",
    "crypto_usdt_trc20",
    "crypto_btc",
    "crypto_eth",
    "bank_transfer"
  ];

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data, error } = await supabase.storage
      .from("recharge-receipts")
      .upload(`receipts/${Date.now()}-${file.name}`, file)
    if (error) {
      toast.error("Upload failed", { description: error.message })
      setUploading(false)
      return
    }
    const { data: publicUrlData } = supabase.storage.from("recharge-receipts").getPublicUrl(data.path)
    setReceiptUrl(publicUrlData.publicUrl)
    setUploading(false)
  }

  const handleNewRecharge = async () => {
    if (!newRecharge.amount || !newRecharge.method) {
      toast.error("Validation Error", { description: "Please fill in all required fields." })
      return
    }
    if (newRecharge.method === "bank_transfer") {
      toast("Contact Support", { description: "Please contact support for bank transfer instructions." })
      return
    }
    if (!receiptUrl) {
      toast.error("Proof Required", { description: "Please upload your payment proof/receipt." })
      return
    }
    if (!profile) {
      toast.error("User not found", { description: "Please log in to initiate a recharge." })
      return;
    }
    try {
      await createRecharge({
        user_id: profile.id,
        amount: Number.parseFloat(newRecharge.amount),
        currency: "USD",
        method: newRecharge.method,
        status: "pending",
        created_at: new Date().toISOString(),
        fee: Number.parseFloat(newRecharge.amount) * 0.025,
        metadata: {
          exchangeRate: 1.0,
          walletAddress: newRecharge.walletAddress || null,
        },
        prove_url: receiptUrl,
      })
      setNewRecharge({ amount: "", method: "" as RechargeMethods, walletAddress: "" })
      setReceiptUrl("")
      setIsNewRechargeOpen(false)
      toast.success("Recharge Initiated", { description: "Your recharge request has been submitted successfully." })
    } catch (error) {
      toast.error("Error", { description: "Failed to initiate recharge. Please try again." })
    }
  }

  const handleExportRecords = () => {
    const csvContent = [
      ["ID", "Amount", "Method", "Status", "Date", "Fee", "Transaction Hash"],
      ...recharges.map((r) => [
        r.id,
        r.amount.toString(),
        getMethodLabel(r.method),
        r.status,
        new Date(r.created_at).toLocaleDateString(),
        r.fee.toString(),
        r.transaction_hash || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recharge-records-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Export Complete", { description: "Your recharge records have been exported successfully." })
  }

  const handleViewDetails = (recharge: any) => {
    setSelectedRecharge(recharge)
    setIsDetailsOpen(true)
  }

  if (localLoading) return <InnerLoading />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recharge Records</h1>
          <p className="text-gray-600">Track all your wallet recharge transactions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isNewRechargeOpen} onOpenChange={setIsNewRechargeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Recharge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-[calc(100vh-2rem)] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Recharge</DialogTitle>
                <DialogDescription>Add funds to your wallet using various payment methods.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100.00"
                    value={newRecharge.amount}
                    onChange={(e) => setNewRecharge({ ...newRecharge, amount: e.target.value })}
                    disabled={newRecharge.method === "bank_transfer"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select
                    value={newRecharge.method}
                    onValueChange={(value) => setNewRecharge({ ...newRecharge, method: value as RechargeMethods })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto_usdt_erc20">USDT (ERC20)</SelectItem>
                      <SelectItem value="crypto_usdt_trc20">USDT (TRC20)</SelectItem>
                      <SelectItem value="crypto_btc">Bitcoin</SelectItem>
                      <SelectItem value="crypto_eth">Ethereum</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newRecharge.method === "bank_transfer" ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 mt-2">
                    <strong>Bank Transfer:</strong> Please <a href="/customer-service" className="underline text-blue-600">contact support</a> for bank transfer instructions. Bank details will be provided by our team.
                  </div>
                ) : (
                  <>
                    {/* User wallet address for crypto */}
                    <div className="grid gap-2">
                      <Label htmlFor="wallet">Your Wallet Address</Label>
                      <Input
                        id="wallet"
                        placeholder="Enter your wallet address"
                        value={newRecharge.walletAddress}
                        onChange={(e) => setNewRecharge({ ...newRecharge, walletAddress: e.target.value })}
                      />
                    </div>
                    {/* Platform wallet info for crypto payments (show only if amount and method are set) */}
                    {newRecharge.amount && newRecharge.method.startsWith("crypto_") && platformWallets[newRecharge.method] && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Our {getMethodLabel(newRecharge.method)} Wallet:</span>
                          <span className="font-mono text-xs break-all">{platformWallets[newRecharge.method as RechargeMethods].address}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(platformWallets[newRecharge.method].address)
                              toast("Copied!", { description: "Wallet address copied to clipboard." })
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <img src={platformWallets[newRecharge.method].qr} alt="Wallet QR" className="w-20 h-20 rounded bg-white border" />
                          <span className="text-xs text-muted-foreground">Scan to pay or copy the address above. Send the exact amount. Your balance will update after confirmation.</span>
                        </div>
                      </div>
                    )}
                    {/* Amount summary for crypto */}
                    {newRecharge.amount && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span>${Number.parseFloat(newRecharge.amount || "0").toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fee (2.5%):</span>
                          <span>${(Number.parseFloat(newRecharge.amount || "0") * 0.025).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                          <span>Total:</span>
                          <span>${(Number.parseFloat(newRecharge.amount || "0") * 1.025).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    {/* Proof upload for crypto */}
                    <div className="grid gap-2">
                      <Label htmlFor="receipt">Upload Payment Proof *</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptUpload}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
                      {receiptUrl && (
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mt-1 block">
                          View Uploaded Proof
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsNewRechargeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNewRecharge} disabled={newRecharge.method === "bank_transfer" || uploading || loading}>
                  {loading ? "Initing..." : "Initiate Recharge"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recharged</p>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search recharges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />

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

        <Button variant="outline" onClick={handleExportRecords}>
          <Download className="h-4 w-4 mr-2" />
          Export Records
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({recharges.length})</TabsTrigger>
          <TabsTrigger value="success">Success ({recharges.filter((r) => r.status === "success").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({recharges.filter((r) => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({recharges.filter((r) => r.status === "failed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {paginatedRecharges.map((recharge) => (
            <Card key={recharge.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(recharge.status)}
                    <div>
                      <h3 className="font-semibold">Recharge {recharge.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(recharge.created_at).toLocaleDateString()} at {new Date(recharge.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${recharge.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(recharge.status)}>{recharge.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{getMethodLabel(recharge.method)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fee</p>
                    <p className="font-medium">${recharge.fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p className="font-medium">${(recharge.amount - recharge.fee).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exchange Rate</p>
                    <p className="font-medium">
                      {recharge.metadata?.exchangeRate === 1 ? "1:1" : `1:${recharge.metadata?.exchangeRate.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(recharge)}>
                    View Details
                  </Button>
                  {recharge.transaction_hash && (
                    <Button variant="outline" size="sm">
                      View on Blockchain
                    </Button>
                  )}
                  {recharge.status === "failed" && <Button size="sm">Retry Recharge</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Pagination below the list */}
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
        </TabsContent>
      </Tabs>

      {recharges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recharge records found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeTab !== "all"
                ? "No records match your search criteria"
                : "You haven't made any recharges yet"}
            </p>
            <Button onClick={() => setIsNewRechargeOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Make Your First Recharge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recharge Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recharge Details - {selectedRecharge?.id}</DialogTitle>
            <DialogDescription>Complete transaction information and status</DialogDescription>
          </DialogHeader>
          {selectedRecharge && (
            <div className="space-y-6">
              {/* Status and Amount */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedRecharge.status)}
                  <div>
                    <p className="font-semibold">Status: {selectedRecharge.status.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">{new Date(selectedRecharge.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${selectedRecharge.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Amount</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Recharge ID</p>
                  <p className="font-semibold">{selectedRecharge.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{getMethodLabel(selectedRecharge.method)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fee</p>
                  <p className="font-semibold">${selectedRecharge.fee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Amount</p>
                  <p className="font-semibold text-green-600">
                    ${(selectedRecharge.amount - selectedRecharge.fee).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Blockchain Details */}
              {selectedRecharge.transaction_hash && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Transaction Hash</p>
                  <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                    {selectedRecharge.transaction_hash}
                  </p>
                </div>
              )}

              {selectedRecharge.walletAddress && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
                  <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                    {selectedRecharge.walletAddress}
                  </p>
                </div>
              )}

              {/* Failure Reason */}
              {selectedRecharge.status === "failed" && selectedRecharge.failureReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Failure Reason:</strong> {selectedRecharge.failureReason}
                  </p>
                </div>
              )}

              {/* Exchange Rate Info */}
              {selectedRecharge.metadata?.exchangeRate !== 1 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Exchange Rate:</strong> 1 USD = {selectedRecharge.metadata?.exchangeRate.toLocaleString()}{" "}
                    {selectedRecharge.currency}
                  </p>
                </div>
              )}

              {/* Transaction Proof */}
              {selectedRecharge?.receiptUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Transaction Proof</p>
                  <a href={selectedRecharge.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View Proof
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedRecharge.transaction_hash && <Button variant="outline">View on Blockchain Explorer</Button>}
                {selectedRecharge.status === "failed" && <Button>Retry Recharge</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
