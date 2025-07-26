"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MoreVertical, Eye, Edit, CreditCard, CheckCircle, XCircle, Download, RefreshCw, EyeOff, AlertCircle, ShieldCheck, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAdminCardsStore } from "@/lib/store/admin/cardsStore";
import type { Card as CardType } from "@/lib/store/cardStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ButtonLoading } from "@/components/ui/loading";
import { decryptCardNumber } from "@/lib/utils";
import { CardStats } from "@/components/ui/card-stats";
import InnerLoading from "@/components/layout/InnerLoading";

import { BulkAction } from "@/components/admin/layout/BulkAction"

// Form validation schema
const cardFormSchema = z.object({
    card_type: z.string().min(1, "Card type is required"),
    cardholder_name: z.string().min(1, "Cardholder name is required"),
    expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    billing_address: z.string().min(1, "Billing address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip_code: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
    is_default: z.boolean().default(false).transform(val => val ?? false)
} as any);

type CardFormValues = z.infer<typeof cardFormSchema>;

export default function CardsManagementPage() {
    const { cards, fetchCards, deleteCard, updateCard, isLoading } = useAdminCardsStore();
    const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [cardTypeFilter, setCardTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isBillingInfoVisible, setIsBillingInfoVisible] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
    const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);

    const form = useForm<CardFormValues>({
        resolver: zodResolver(cardFormSchema),
        defaultValues: {
            card_type: "",
            cardholder_name: "",
            expiry_date: "",
            billing_address: "",
            city: "",
            state: "",
            zip_code: "",
            country: "",
            is_default: false,
        },
    });

    // Fetch cards on mount
    useEffect(() => {

        loadCards();
    }, [fetchCards]);

    const loadCards = async () => {
        setLocalLoading(true);
        try {
            await fetchCards();
        } catch (error) {
            toast.error("Failed to load cards");
        } finally {
            setLocalLoading(false);
        }
    };
    // Filter cards based on search and filters
    useEffect(() => {
        const filtered = cards.filter((card) => {
            const matchesSearch =
                card.cardholder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.card_number_last4.includes(searchTerm);

            const matchesType = cardTypeFilter === "all" || card.card_type === cardTypeFilter;
            const isExpired = isCardExpired(card.expiry_date);
            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "active" && !isExpired) ||
                (statusFilter === "expired" && isExpired);

            return matchesSearch && matchesType && matchesStatus;
        });

        setFilteredCards(filtered);
    }, [cards, searchTerm, cardTypeFilter, statusFilter]);

    const isCardExpired = (expiryDate: string) => {
        const [month, year] = expiryDate.split('/').map(Number);
        const expiry = new Date(2000 + year, month - 1, 1);
        const now = new Date();
        return expiry < now;
    };

    // Calculate stats
    const stats = {
        total: cards.length,
        active: cards.filter(card => !isCardExpired(card.expiry_date)).length,
        expired: cards.filter(card => isCardExpired(card.expiry_date)).length,
        default: cards.filter(card => card.is_default).length,
    };

    // Get unique card types for filter
    const cardTypes = [...new Set(cards.map(card => card.card_type))];

    const handleSubmit = async (data: CardFormValues) => {
        try {
            if (!selectedCard) return;
            const { user, ...cardData } = selectedCard
            // Update existing card
            await updateCard(selectedCard.id, {
                ...cardData,
                ...data,
            });

            toast.success("Card updated successfully");
            setIsEditDialogOpen(false);

            // Reset form
            form.reset({
                card_type: "",
                cardholder_name: "",
                expiry_date: "",
                billing_address: "",
                city: "",
                state: "",
                zip_code: "",
                country: "",
                is_default: false,
            });

        } catch (error) {
            console.log("Error updating card:", error);
            toast.error("Failed to update card. Please try again.");
        }
    };

    const handleEdit = (card: CardType) => {
        setSelectedCard(card);
        form.reset({ ...card, card_type: card.card_type.toLowerCase() });
        setIsEditDialogOpen(true);
    };

    const handleBulkAction = async (action: string) => {
        if (action === 'delete') {
            if (selectedCardIds.length === 0) {
                toast.error("No cards selected");
                return;
            }

            // Set the first selected card for the delete confirmation dialog
            const cardToDelete = cards.find(card => card.id === selectedCardIds[0]);
            if (cardToDelete) {
                setSelectedCard(cardToDelete);
            }
            setOpenDeleteModal(true);
        } else if (action === 'default') {
            if (selectedCardIds.length === 0) {
                toast.error("No cards selected");
                return;
            }

            // Set the first selected card for the delete confirmation dialog
            const cardToDelete = cards.find(card => card.id === selectedCardIds[0]);
            if (cardToDelete) {
                setSelectedCard(cardToDelete);
            }
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (selectedCardIds.length > 1) {
                // Bulk delete
                await Promise.all(selectedCardIds.map(id => deleteCard(id)));
                toast.success("Cards deleted", {
                    description: `${selectedCardIds.length} cards have been deleted.`,
                });
                setSelectedCardIds([]);
                setSelectedCard(null);
            } else if (selectedCard) {
                // Single delete
                await deleteCard(selectedCard.id);
                toast.success("Card deleted", {
                    description: `${selectedCard.card_type} •••• ${selectedCard.card_number_last4} has been deleted.`,
                });
                setSelectedCard(null);
                setSelectedCardIds([]);
            }
        } catch (error) {
            toast.error("Error", {
                description: "Failed to delete card(s). Please try again.",
            });
        } finally {
            setOpenDeleteModal(false);
        }
    }

    if (localLoading) return <InnerLoading />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Cards Management</h1>
                    <p className="text-gray-600">Manage all payment cards and their details</p>
                </div>

                <div className="flex gap-2 items-center flex-col lg:flex-row w-full lg:w-auto">
                    <Button variant="outline" onClick={loadCards} className="w-full lg:w-auto">
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardStats
                    title="Total Cards"
                    value={stats.total}
                    description="All cards in the system"
                    icon={<CreditCard className="h-6 w-6" />}
                    borderColor="border-gray-200"
                    textColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />

                <CardStats
                    title="Active"
                    value={stats.active}
                    description="Currently active cards"
                    icon={<CheckCircle className="h-6 w-6" />}
                    borderColor="border-gray-200"
                    textColor="text-green-600"
                    iconBgColor="bg-green-100"
                />

                <CardStats
                    title="Expired"
                    value={stats.expired}
                    description="Expired or inactive cards"
                    icon={<AlertCircle className="h-6 w-6" />}
                    borderColor="border-gray-200"
                    textColor="text-red-600"
                    iconBgColor="bg-red-100"
                />

                <CardStats
                    title="Default Cards"
                    value={stats.default}
                    description="Set as default payment method"
                    icon={<ShieldCheck className="h-6 w-6" />}
                    borderColor="border-gray-200"
                    textColor="text-purple-600"
                    iconBgColor="bg-purple-100"
                />
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by cardholder name or last 4 digits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Card Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {cardTypes.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()}>
                                            {type}
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
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cards Table */}
            <Card >
                <CardHeader className="px-4">
                    <CardTitle>Payment Cards ({filteredCards.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {selectedCardIds.length > 0 && (
                        <BulkAction
                            onClearSelection={() => setSelectedCardIds([])}
                            selectedCount={selectedCardIds.length}
                            onBulkAction={handleBulkAction}
                            actions={[
                                {
                                    label: 'Delete',
                                    value: 'delete',
                                    icon: <Trash />,
                                    variant: 'destructive' as const,
                                },
                                {
                                    label: 'Default',
                                    value: 'default',
                                    icon: <CheckCircle />,
                                    variant: 'default' as const,
                                }
                            ]}
                        />
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedCardIds.length > 0 && selectedCardIds.length === filteredCards.length}
                                        onCheckedChange={() => selectedCardIds.length === filteredCards.length ? setSelectedCardIds([]) : setSelectedCardIds(filteredCards.map(card => card.id))}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Card Type</TableHead>
                                <TableHead>Cardholder</TableHead>
                                <TableHead>Card Number</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCards.length > 0 ? (
                                filteredCards.map((card) => (
                                    <TableRow key={card.id}>
                                        <TableCell className="font-medium">
                                            <Checkbox
                                                checked={selectedCardIds.includes(card.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedCardIds((prev) => [...prev, card.id]);
                                                    } else {
                                                        setSelectedCardIds((prev) => prev.filter(id => id !== card.id));
                                                    }
                                                }}
                                                aria-label="Select card"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{card.card_type}</TableCell>
                                        <TableCell>{card.cardholder_name}</TableCell>
                                        <TableCell>•••• •••• •••• {card.card_number_last4}</TableCell>
                                        <TableCell>{card.expiry_date}</TableCell>
                                        <TableCell>
                                            <Badge variant={isCardExpired(card.expiry_date) ? "destructive" : "default"}>
                                                {isCardExpired(card.expiry_date) ? "Expired" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {card.is_default ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-gray-300" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedCard(card);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(card)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setSelectedCard(card);
                                                            setOpenDeleteModal(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No cards found matching your criteria
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Card Dialog */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Card Details</DialogTitle>
                    </DialogHeader>
                    {selectedCard && (
                        <div className="space-y-6">
                            {/* Card Preview */}
                            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-sm text-blue-100 mb-1">Card Type</p>
                                        <p className="text-lg font-medium capitalize">{selectedCard.card_type}</p>
                                    </div>
                                    {selectedCard.is_default && (
                                        <Badge className="bg-white/20 text-white border-0">
                                            Default
                                        </Badge>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-blue-100 mb-1">Card Number</p>
                                    <p className="text-xl font-mono tracking-wider">
                                        {isBillingInfoVisible ? decryptCardNumber(selectedCard.card_number_hash) : `•••• •••• •••• ${selectedCard.card_number_last4}`}
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-xs text-blue-100 mb-1">Cardholder Name</p>
                                        <p className="text-sm font-medium">{selectedCard.cardholder_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100 mb-1">Expires</p>
                                        <p className="text-sm font-medium">{selectedCard.expiry_date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">Billing Information</h3>
                                    <Button variant="ghost" className="focus-visible:outline-none focus-visible:ring-0" size="sm" onClick={() => setIsBillingInfoVisible(!isBillingInfoVisible)}>
                                        {!isBillingInfoVisible ? <Eye className="h-5 w-5 " /> :
                                            <EyeOff className="h-5 w-5 " />}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Billing Address</p>
                                        <p>{selectedCard.billing_address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">City</p>
                                        <p>{selectedCard.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">State/Province</p>
                                        <p>{selectedCard.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">ZIP/Postal Code</p>
                                        <p>{selectedCard.zip_code || 'N/A'}</p>
                                    </div>
                                    <div >
                                        <p className="text-muted-foreground text-sm">Country</p>
                                        <p>{selectedCard.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">CVV</p>
                                        <p>{isBillingInfoVisible ? selectedCard.cvv : Array(selectedCard.cvv?.length || 0).fill('•').join('') || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Added Date</p>
                                        <p>{new Date(selectedCard.added_date).toLocaleDateString() || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Owner</p>
                                        <p>{selectedCard.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge
                                            variant={isCardExpired(selectedCard.expiry_date) ? "destructive" : "default"}
                                            className="mt-1"
                                        >
                                            {isCardExpired(selectedCard.expiry_date) ? "Expired" : "Active"}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                setIsEditDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        {!selectedCard.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        await updateCard(selectedCard.id, {
                                                            ...selectedCard,
                                                            is_default: true
                                                        });
                                                        toast.success("Default card updated");
                                                        setIsViewModalOpen(false);
                                                    } catch (error) {
                                                        toast.error("Failed to update default card");
                                                    }
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                Set as Default
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCardIds.length > 1
                                ? `Delete ${selectedCardIds.length} Cards?`
                                : 'Delete Card?'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCardIds.length > 1 ? (
                                <>
                                    <p>You are about to delete {selectedCardIds.length} cards. This action cannot be undone.</p>
                                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                        {filteredCards
                                            .filter(card => selectedCardIds.includes(card.id))
                                            .slice(0, 5)
                                            .map(card => (
                                                <div key={card.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {card.card_type} •••• {card.card_number_last4}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {card.cardholder_name}
                                                        </p>
                                                    </div>
                                                    {card.is_default && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        {selectedCardIds.length > 5 && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                and {selectedCardIds.length - 5} more cards...
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : selectedCard ? (
                                <>
                                    <p>This action cannot be undone. This will permanently delete the following card:</p>
                                    <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {selectedCard.card_type} •••• {selectedCard.card_number_last4}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedCard.cardholder_name} • Expires {selectedCard.expiry_date}
                                                </p>
                                            </div>
                                            {selectedCard.is_default && (
                                                <Badge variant="outline">Default</Badge>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {localLoading ? (
                                <>
                                    <ButtonLoading />

                                </>
                            ) : (
                                `Delete ${selectedCardIds.length > 1 ? `${selectedCardIds.length} Cards` : 'Card'}`
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Card Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Card</DialogTitle>
                        <DialogDescription>
                            Update the card details below.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Card Type */}
                                <FormField
                                    control={form.control}
                                    name="card_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Card Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select card type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="visa">Visa</SelectItem>
                                                    <SelectItem value="mastercard">Mastercard</SelectItem>
                                                    <SelectItem value="amex">American Express</SelectItem>
                                                    <SelectItem value="discover">Discover</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Expiry Date */}
                                <FormField
                                    control={form.control}
                                    name="expiry_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expiry Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="MM/YY"
                                                    {...field}
                                                    onChange={(e) => {
                                                        // Format expiry date as MM/YY
                                                        let value = e.target.value.replace(/\D/g, '');
                                                        if (value.length > 2) {
                                                            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Cardholder Name */}
                                <FormField
                                    control={form.control}
                                    name="cardholder_name"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Cardholder Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                {/* Billing Information */}
                                <FormField
                                    control={form.control}
                                    name="billing_address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Billing Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="zip_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ZIP/Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="United States" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_default"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Set as default payment method</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    This card will be used as the primary payment method
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>


                            <DialogFooter className="pt-4 gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <ButtonLoading />
                                    ) : 'Update Card'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </div>
    );
}