"use client"

import { useEffect, useState } from "react"
import { Plus, CreditCard, Eye, EyeOff, Edit, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuthStore } from "@/lib/store/auth"
import { useWithdrawalStore } from "@/lib/store/withdrawalStore"
import { useWalletStore } from "@/lib/store/walletStore"
import { Wallet, WalletTypes } from "@/lib/types"
import InnerLoading from "@/components/layout/InnerLoading"
import { toast } from "sonner"
import { CountryDropdown } from "@/components/ui/country-dropdown";


const WALLET_TYPES = [
  { value: "crypto_usdt_erc20", label: "USDT (ERC20)" },
  { value: "crypto_usdt_trc20", label: "USDT (TRC20)" },
  { value: "bank_account", label: "Bank Account" },
];

const BANK_FIELDS = [
  { key: "account_holder", label: "Account Holder Name" },
  { key: "account_number", label: "Account Number" },
  { key: "bank_name", label: "Bank Name" },
  { key: "routing_number", label: "Routing/SWIFT/IBAN" },
  { key: "bank_address", label: "Bank Address" },
  { key: "country", label: "Country" },
];

// Extend wallet type for bank fields

const ROUTING_NUMBER_TYPES = [
  { value: 'routing_number', label: 'Routing Number' },
  { value: 'swift', label: 'SWIFT' },
  { value: 'bic', label: 'BIC' },
  { value: 'iban', label: 'IBAN' },
];


export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false)
  const { profile } = useAuthStore()

  const { withdrawals } = useWithdrawalStore();
  const [localLoading,setLocalLoading] = useState(false)

  // Wallet store
  const {
    wallets,
    loading,
    createWallet,
    updateWallet,
    deleteWallet,
    fetchWalletsByUser,
    setLoading,
  } = useWalletStore();

  const [newWallet, setNewWallet] = useState<Partial<Wallet> | any>({
    name: "",
    type: "",
    address: "",
    currency: "",
    account_holder: "",
    account_number: "",
    bank_name: "",
    routing_number: "",
    bank_address: "",
    country: "",
    routing_number_type: undefined,
  })
  // Only allow one of each wallet type
  const filteredWallets: Wallet[] = WALLET_TYPES.map(typeObj => wallets.find(w => w.type === typeObj.value)).filter(Boolean) as Wallet[];

  // Prevent adding a wallet if one of that type exists
  const canAddType = (type: string) => !wallets.some(w => w.type === type);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        setLocalLoading(true);
        await fetchWalletsByUser(profile.id);
        setLocalLoading(false);
      } catch (error) {
        toast.error("Failed to fetch wallets")
        setLocalLoading(false);
      }
    })();
  }, [profile?.id, setLocalLoading, fetchWalletsByUser]);
     

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "crypto_btc":
        return "₿"
      case "crypto_usdt_erc20":
      case "crypto_usdt_trc20":
        return "₮"
      case "crypto_bnb":
        return "BNB"
      case "bank_account":
        return "🏦"
      default:
        return "💳"
    }
  }

  const getWalletTypeLabel = (type: string) => {
    switch (type) {
      case "crypto_btc":
        return "Bitcoin"
      case "crypto_usdt_erc20":
        return "USDT (ERC20)"
      case "crypto_usdt_trc20":
        return "USDT (TRC20)"
      case "crypto_bnb":
        return "BNB"
      case "bank_account":
        return "Bank Account"
      default:
        return "Unknown"
    }
  }

  const handleAddWallet = async () => {
    if (!newWallet.name || !newWallet.type) {
      toast.error("Validation Error",{
        description: "Please fill in all required fields.",
      })
      return
    }
    if(newWallet.type === "" as WalletTypes)
    if (!canAddType(newWallet.type!)) {
      toast.error("Duplicate Wallet",{
        description: "You can only have one wallet of each type.",
      })
      return
    }
    if (newWallet.type === "bank_account") {
      const {address,...walletObj} = newWallet as Record<string, string | undefined>;
      for (const field of BANK_FIELDS) {
        if (!walletObj[field.key]) {
          toast.error("Validation Error",{
            description: `Please provide ${field.label}.`,
          });
          return;
        }
      }
    }
    try {
      setLoading(true);
      await createWallet({
        ...(newWallet as any),
        user_id: profile!.id,
        name: newWallet.name!,
        type: newWallet.type!,
        address: newWallet.type === "bank_account" ? newWallet.account_number: newWallet.address!,
        currency: newWallet.type === "bank_account" ? "USD" : (newWallet.currency || "USDT"),
        is_default: wallets.length === 0,
        created_at: new Date().toISOString().split("T")[0],
        account_holder: newWallet.account_holder || "",
        account_number: newWallet.account_number || "",
        bank_name: newWallet.bank_name || "",
        routing_number: newWallet.routing_number || "",
        bank_address: newWallet.bank_address || "",
        country: newWallet.country || "",
        routing_number_type: newWallet.routing_number_type,
      } as Wallet);
      setNewWallet({ name: "", type: "" as WalletTypes, address: "", currency: "" });
      setIsAddWalletOpen(false);
      toast.success("Wallet Added",{
        description: "Your new wallet has been added successfully.",
      })
    } catch (error) {
      toast.error( "Error",{
        description: "Failed to add wallet. Please try again."
      })
    } finally {
      setLoading(false);
    }
  }

  const handleEditWallet = async () => {
    if (!editingWallet) return;
    if (editingWallet.type === "bank_account") {
      for (const field of BANK_FIELDS) {
        if (!(editingWallet as any)[field.key]) {
          toast.error( "Validation Error",{
            description: `Please provide ${field.label}.`,
          });
          return;
        }
      }
    }
    try {
      setLoading(true);
      await updateWallet(editingWallet.id, editingWallet);
      setEditingWallet(null);
      setIsEditWalletOpen(false);
      toast.success("Wallet Updated",{
        description: "Your wallet has been updated successfully.",
      })
    } catch (error) {
      toast.error("Error",{
        description: "Failed to update wallet. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveWallet = async (id: string) => {
    try {
      setLoading(true);
      await deleteWallet(id);
      toast.success("Wallet Removed",{
        description: "The wallet has been removed from your account.",
      })
    } catch (error) {
      toast("Error",{
        description: "Failed to remove wallet. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      // Set all wallets isDefault false, then set selected to true
      for (const w of wallets) {
        if (w.id == id) {
          await updateWallet(w.id, { is_default: true });
        } else if (w.is_default) {
          await updateWallet(w.id, { is_default: false });
        }
      }
      toast.success("Default Wallet Updated",{
        description: "Your default wallet has been updated.",
      })
    } catch (error) {
      console.log(error)
      toast("Error",{
        description: "Failed to update default wallet. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  }

  const handleExportWallets = () => {
    const csvContent = [
      ["Name", "Type", "Address", "Currency", "Default", "Created"],
      ...wallets.map((w) => [
        w.name,
        getWalletTypeLabel(w.type),
        w.address,
        w.currency,
        w.is_default ? "Yes" : "No",
        w.created_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallets-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast("Export Complete",{
      description: "Your wallet data has been exported successfully.",
    })
  }

  // No per-wallet balance, so just show 0 or placeholder



  // Recent transactions from withdrawals
  const normalizedWithdrawals = [...withdrawals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map(w => ({
      id: w.id,
      type: "withdrawal",
      amount: -Math.abs(w.amount),
      currency: w.currency,
      method: w.method,
      status: w.status,
      date: w.created_at,
      description: `Withdrawal via ${w.method}`,
    }));

  const availableWalletTypes = WALLET_TYPES.filter(typeObj => canAddType(typeObj.value));

  if (localLoading) return <InnerLoading />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          <p className="text-gray-600">Manage your payment wallets and methods</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportWallets}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
            <DialogTrigger asChild >
              <Button disabled={wallets.length === 3}>
                <Plus className="h-4 w-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Wallet</DialogTitle>
                <DialogDescription>Add a new payment wallet or method to your account.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="wallet-name">Wallet Name *</Label>
                  <Input
                    id="wallet-name"
                    placeholder="My USDT Wallet"
                    value={newWallet.name}
                    onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wallet-type">Wallet Type *</Label>
                  <Select
                    value={newWallet.type}
                    onValueChange={(value) => setNewWallet({ ...newWallet, type: value as WalletTypes, currency: value === "bank_account" ? "USD" : "USDT" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWalletTypes.map(typeObj => (
                        <SelectItem key={typeObj.value} value={typeObj.value}>{typeObj.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newWallet.type !== "bank_account" && <div className="grid gap-2">
                  <Label htmlFor="wallet-address">Wallet Address / Account Number *</Label>
                  <Input
                    id="wallet-address"
                    placeholder="Enter wallet address or account number"
                    value={newWallet.address}
                    onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                  />
                </div>}
                {newWallet.type === "bank_account" && (
                  <>
                    {BANK_FIELDS.map(field => (
                      field.key === "country" ? (
                        <div className="grid gap-2" key={field.key}>
                          <Label htmlFor={`wallet-${field.key}`}>{field.label}</Label>
                          <CountryDropdown
                            defaultValue={newWallet.country}
                            onChange={(country) => setNewWallet({ ...newWallet, country: country.name })}
                          />
                        </div>
                      ) : (
                        <div className="grid gap-2" key={field.key}>
                          <Label htmlFor={`wallet-${field.key}`}>{field.label}</Label>
                          <Input
                            id={`wallet-${field.key}`}
                            placeholder={field.label}
                            value={(newWallet as any)[field.key] || ""}
                            onChange={e => setNewWallet({ ...newWallet, [field.key]: e.target.value })}
                          />
                        </div>
                      )
                    ))}
                    <div className="grid gap-2">
                      <Label htmlFor="wallet-routing-type">Routing Code Type</Label>
                      <Select
                        value={newWallet.routing_number_type}
                        onValueChange={value => setNewWallet({ ...newWallet, routing_number_type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTING_NUMBER_TYPES.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="wallet-currency">Currency</Label>
                  <Select
                    value={newWallet.currency}
                    onValueChange={(value) => setNewWallet({ ...newWallet, currency: value })}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {newWallet.type === "bank_account" && <SelectItem value="USD">USD</SelectItem>}
                      {(newWallet.type === "crypto_usdt_erc20" || newWallet.type === "crypto_usdt_trc20") && <SelectItem value="USDT">USDT</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-y-2 lg:gap-y-0">
                <Button variant="outline" onClick={() => setIsAddWalletOpen(false)}>
                  Cancel
                </Button>
                <Button disabled={loading} onClick={handleAddWallet}>
                  {loading ? "Adding Wallet..." : "Add Wallet"}
                  </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Total Balance */}
      <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-2">Total Balance (USD Equivalent)</p>
              <div className="flex items-center space-x-4">
                <p className="text-4xl font-bold">{showBalance ? `$${profile?.wallet_balance?.toFixed(2) || 0.00}` : "••••••"}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/20"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-100 mb-2">Active Wallets</p>
              <p className="text-xl font-semibold">{wallets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className={wallet.is_default ? "ring-2 ring-orange-400" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getWalletIcon(wallet.type)}</div>
                  <div>
                    <CardTitle className="text-lg">{wallet.name}</CardTitle>
                    <CardDescription>{getWalletTypeLabel(wallet.type)}</CardDescription>
                  </div>
                </div>
                {wallet.is_default && <Badge>Default</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded truncate">{wallet.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Added</p>
                <p className="text-sm">{new Date(wallet.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!wallet.is_default && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(wallet.id)}>
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingWallet(wallet)
                    setIsEditWalletOpen(true)
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Wallet</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this wallet? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                      disabled={loading}
                        onClick={() => handleRemoveWallet(wallet.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? "Removing Wallet..." : "Remove Wallet"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wallets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No wallets added</h3>
            <p className="text-gray-500 mb-6">Add your first wallet to start making payments and receiving funds.</p>
            <Button onClick={() => setIsAddWalletOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {normalizedWithdrawals.length > 0 && (<Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest wallet activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/recharge">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {normalizedWithdrawals.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {transaction.type === "withdrawal" ? "💸" : "🛒"}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()} •{" "}
                      {transaction.method.replace(/_/g, " ").toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <Badge className="bg-green-100 text-green-800">{transaction.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>)}

      {/* Edit Wallet Dialog */}
      <Dialog open={isEditWalletOpen} onOpenChange={setIsEditWalletOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
            <DialogDescription>Update your wallet information.</DialogDescription>
          </DialogHeader>
          {editingWallet && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-wallet-name">Wallet Name *</Label>
                <Input
                  id="edit-wallet-name"
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-wallet-address">Wallet Address / Account Number *</Label>
                <Input
                  id="edit-wallet-address"
                  value={editingWallet.address}
                  onChange={(e) => setEditingWallet({ ...editingWallet, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Wallet Type</Label>
                <p className="text-sm text-gray-600">{getWalletTypeLabel(editingWallet.type)}</p>
              </div>
              {editingWallet.type === "bank_account" && (
                <div className="grid gap-2">
                  {BANK_FIELDS.map((field) => (
                    field.key === "country" ? (
                      <div className="grid gap-2" key={field.key}>
                        <Label htmlFor={`edit-wallet-${field.key}`}>{field.label}</Label>
                        <CountryDropdown
                        defaultValue={editingWallet.country}
                          onChange={(country) => setEditingWallet({ ...editingWallet, country: country.name })}
                        />
                      </div>
                    ) : (
                      <div key={field.key}>
                        <Label htmlFor={`edit-wallet-${field.key}`}>{field.label}</Label>
                        <Input
                          id={`edit-wallet-${field.key}`}
                          value={(editingWallet as any)[field.key]}
                          onChange={(e) => setEditingWallet({ ...editingWallet, [field.key]: e.target.value })}
                        />
                      </div>
                    )
                  ))}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-wallet-routing-type">Routing Code Type</Label>
                    <Select
                      value={editingWallet.routing_number_type}
                      onValueChange={value => setEditingWallet({ ...editingWallet, routing_number_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTING_NUMBER_TYPES.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-y-2 lg:gap-y-0">
            <Button variant="outline" onClick={() => setIsEditWalletOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleEditWallet}>
              {loading ? "Updating Wallet..." : "Update Wallet"}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
