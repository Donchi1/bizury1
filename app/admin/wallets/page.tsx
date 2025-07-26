"use client"

import { useState, useEffect } from "react"
import { useAdminWalletsStore } from "@/lib/store/admin/walletsStore"
import {   Wallet as WalletType, WalletTypes } from "@/lib/types"
import { format } from "date-fns"
import { toast } from "sonner"
import { Search, RefreshCw, MoreVertical, Trash2, Eye, Pencil, Check, X, Download, Banknote, CreditCard, Trash, DollarSign, CheckCircle, WalletIcon, Wallet2, Landmark, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkAction } from "@/components/admin/layout/BulkAction"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import InnerLoading from "@/components/layout/InnerLoading"
import { CardStats } from "@/components/ui/card-stats"

const ITEMS_PER_PAGE = 10

export default function AdminWalletsPage() {
    const { wallets, isLoading, fetchWallets, deleteWallet, bulkDeleteWallets,setWalletDefault, updateWallet } = useAdminWalletsStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState<WalletTypes | "all">("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedWallets, setSelectedWallets] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [walletToDelete, setWalletToDelete] = useState<string | null>(null)
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [localLoading, setLocalLoading] = useState(false)


    // Load wallets on mount
    useEffect(() => {
        loadWallets()
    }, [fetchWallets])

    const loadWallets = async () => {
        setLocalLoading(true)
        try {
            await fetchWallets()
        }
        catch {
            toast.error('Failed to load wallets')
        }
        finally {
            setLocalLoading(false)
        }
    }

    // Filter and pagination logic
    const filteredWallets = wallets.filter(wallet => {
        const matchesSearch = wallet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wallet.address?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = typeFilter === "all" || wallet.type === typeFilter
        const matchesStatus = statusFilter === "all" || statusFilter === 'is_default' && wallet.is_default
        const matchesNotDefault = statusFilter === "all" || statusFilter === 'not_default' && !wallet.is_default
        return matchesSearch && matchesType && matchesStatus && matchesNotDefault
    })

    const totalPages = Math.ceil(filteredWallets.length / ITEMS_PER_PAGE)
    const paginatedWallets = filteredWallets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Action handlers
    const handleBulkAction = async (action: string) => {
        if (selectedWallets.length === 0) return toast.error("No wallets selected")
        try {
            if (action === "delete") {
                setWalletToDelete("bulk")
                setIsDeleteDialogOpen(true)
            } else {
                if(action === "set_default" && selectedWallets.length > 1) return toast.error("Cannot set multiple wallets as default")
                await Promise.all(selectedWallets.map(id =>
                    setWalletDefault(id)
                ))
                toast.success(`${selectedWallets.length} wallets ${action}ed`)
                setSelectedWallets([])
            }
        } catch { toast.error(`Failed to ${action} wallets`) }
    }

    const handleDelete = async () => {
        if (!walletToDelete) return
        try {
            if (walletToDelete === "bulk") {
                await bulkDeleteWallets(selectedWallets)
                toast.success(`${selectedWallets.length} wallets deleted`)
                setSelectedWallets([])
            } else {
                await deleteWallet(walletToDelete)
                toast.success("Wallet deleted")
            }
        } catch { toast.error("Failed to delete") }
        setIsDeleteDialogOpen(false)
        setWalletToDelete(null)
    }

    const stats = {
        total: wallets.length,
        default: wallets.filter(w => w.is_default).length,
        nonDefault: wallets.filter(w => !w.is_default).length,
        new: wallets.filter(w => w.created_at >= new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).length,
        banks: wallets.filter(w => w.type === "bank_account").length,
        crypto: wallets.filter(w => w.type.includes("usdt")).length,
    }

    // Export to CSV
    const exportToCSV = () => {
        const headers = ["ID", "Name", "Type", "Address/Account", "Currency", "Status", "Created At"]
        const csvContent = [
            headers.join(","),
            ...filteredWallets.map(w => [
                w.id,
                `"${w.name}"`,
                w.type,
                `"${w.address || `${w.bank_name} ••••${w.account_number?.slice(-4)}`}"`,
                w.currency,
                w.is_default ? "Active" : "Inactive",
                format(new Date(w.created_at), "yyyy-MM-dd")
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `wallets-${new Date().toISOString()}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleViewWallet = (wallet: WalletType) => {
        setSelectedWallet(wallet)
        setIsViewDialogOpen(true)
    }

    const handleSetDefault = async (id: string) => {
        try {
            await setWalletDefault(id)
            toast.success("Wallet set as default")
        } catch { toast.error("Failed to set wallet as default") }
    }

    if (localLoading) return <InnerLoading />


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Wallets</h1>
                    <p className="text-muted-foreground">Manage user wallets and transactions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={loadWallets} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                <CardStats
                    title="Total Wallets"
                    value={stats.total}
                    icon={<DollarSign className="h-4 w-4" />}
                    description="Total number of wallets"
                    borderColor="border-gray-200"
                    textColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <CardStats
                    title="Default Wallets"
                    value={stats.default}
                    icon={<Wallet2 className="h-4 w-4" />}
                    description="Default wallets"
                    borderColor="border-gray-200"
                    textColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
                <CardStats
                    title="Non-Default Wallets"
                    value={stats.nonDefault}
                    icon={<WalletIcon className="h-4 w-4" />}
                    description="Non-default wallets"
                    borderColor="border-gray-200"
                    textColor="text-yellow-600"
                    iconBgColor="bg-yellow-100"
                />
                <CardStats
                    title="New Wallets"
                    value={stats.new}
                    icon={<WalletCards className="h-4 w-4" />}
                    description="New wallets"
                    borderColor="border-gray-200"
                    textColor="text-red-600"
                    iconBgColor="bg-red-100"
                />
                <CardStats
                    title="Bank Wallets"
                    value={stats.banks}
                    icon={<Landmark className="h-4 w-4" />}
                    description="Bank wallets"
                    borderColor="border-gray-200"
                    textColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <CardStats
                    title="Crypto Wallets"
                    value={stats.crypto}
                    icon={<Banknote className="h-4 w-4" />}
                    description="Crypto wallets"
                    borderColor="border-gray-200"
                    textColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
            </div>



            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search wallets..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Select value={typeFilter} onValueChange={(v: WalletTypes | "all") => setTypeFilter(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wallet Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="crypto_usdt_erc20">Crypto (ERC20)</SelectItem>
                                <SelectItem value="crypto_usdt_trc20">Crypto (TRC20)</SelectItem>
                                <SelectItem value="bank_account">Bank</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="is_default">Default</SelectItem>
                                <SelectItem value="not_default">Normal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedWallets.length > 0 && (
                        <div className="mb-4">
                            <BulkAction
                                title="Wallet Actions"
                                selectedCount={selectedWallets.length}
                                onClearSelection={() => { setSelectedWallets([]) }}
                                onBulkAction={handleBulkAction}
                                actions={[
                                    // { label: "Set Default", value: "set_default", icon: <Check className="h-4 w-4 text-green-500" /> },
                                    { label: "Delete", value: "delete", icon: <Trash className="h-4 w-4 text-red-500" /> },
                                ]}
                            />
                        </div>
                    )}

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedWallets.length === filteredWallets.length && filteredWallets.length > 0}
                                            onCheckedChange={() => {
                                                setSelectedWallets(
                                                    selectedWallets.length === filteredWallets.length
                                                        ? []
                                                        : filteredWallets.map(w => w.id)
                                                )
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Address/Account</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedWallets.map((wallet) => (
                                    <TableRow key={wallet.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedWallets.includes(wallet.id)}
                                                onCheckedChange={() => {
                                                    setSelectedWallets(prev =>
                                                        prev.includes(wallet.id)
                                                            ? prev.filter(id => id !== wallet.id)
                                                            : [...prev, wallet.id]
                                                    )
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {wallet.type.includes("usdt") ? (
                                                    <WalletIcon className="h-4 w-4 text-yellow-500" />
                                                ) : wallet.type === 'bank_account' ? (
                                                    <Banknote className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <CreditCard className="h-4 w-4 text-purple-500" />
                                                )}
                                                {wallet.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {wallet.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {wallet.address || `${wallet.bank_name} ••••${wallet.account_number?.slice(-4)}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={wallet.is_default ? 'default' : 'secondary'}>
                                                {wallet.is_default ? 'Default' : 'Normal'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewWallet(wallet)}>
                                                        <Eye className="h-4 w-4 mr-2 text-blue-500" /> View
                                                    </DropdownMenuItem>
                                                    {/* <DropdownMenuItem>
                                                        <Pencil className="h-4 w-4 mr-2 text-green-500" /> Edit
                                                    </DropdownMenuItem> */}
                                                    {/* <DropdownMenuItem onClick={() => handleSetDefault(wallet.id)}>
                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Set Default
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator /> */}
                                                    <DropdownMenuItem
                                                        className="text-destructive text-red-500"
                                                        onClick={() => {
                                                            setWalletToDelete(wallet.id)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredWallets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No wallets found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredWallets.length)}
                                </span>{" "}
                                of <span className="font-medium">{filteredWallets.length}</span> wallets
                            </div>
                            <Pagination className="m-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (currentPage > 1) setCurrentPage(currentPage - 1)
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }

                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setCurrentPage(pageNum)
                                                    }}
                                                    isActive={currentPage === pageNum}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                                            }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardFooter>

                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            {walletToDelete === "bulk"
                                ? `This will delete ${selectedWallets.length} selected wallets. This action cannot be undone.`
                                : "This action cannot be undone. This will permanently delete the wallet."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Wallet Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Wallet Details</DialogTitle>
                    </DialogHeader>
                    {selectedWallet && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                                <p>{selectedWallet.name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                                <p className="capitalize">{selectedWallet.type}</p>
                            </div>
                            {selectedWallet.address && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                                    <p className="font-mono text-sm">{selectedWallet.address}</p>
                                </div>
                            )}
                            {selectedWallet.bank_name && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Bank Name</h4>
                                    <p>{selectedWallet.bank_name}</p>
                                </div>
                            )}
                            {selectedWallet.account_number && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Account Number</h4>
                                    <p>{selectedWallet.account_number}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                                <Badge variant={selectedWallet.is_default ? 'default' : 'secondary'}>
                                    {selectedWallet.is_default ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                <p>{format(new Date(selectedWallet.created_at), "PPP")}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}
