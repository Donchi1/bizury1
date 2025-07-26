"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, CreditCard, Edit, Trash2, Eye, EyeOff, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card as CardComponent, CardContent } from "@/components/ui/card"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuthStore } from "@/lib/store/auth";
import { Card, useCardStore } from "@/lib/store/cardStore";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import type { Focused } from 'react-credit-cards-2';
import { toast } from "sonner"
import InnerLoading from "@/components/layout/InnerLoading"
import { Input as UiInput } from "@/components/ui/input";
import { supabase } from "@/lib/supabase"
import { decryptCardNumber } from "@/lib/utils"

const cardSchema = z.object({
  card_number: z.string().min(16, "Card number must be 16 digits").max(19, "Invalid card number"),
  expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be 3-4 digits").max(4, "CVV must be 3-4 digits"),
  cardholder_name: z.string().min(2, "Cardholder name is required"),
  billing_address: z.string().min(5, "Billing address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
})

type CardFormData = z.infer<typeof cardSchema>

// Remove mockCards, use store

export default function CardsPage() {
  const { profile } = useAuthStore();
  const {
    cards,
    loading,
    error,
    fetchCardsByUser,
    createCard,
    updateCard,
    deleteCard,
    setDefaultCard,
  } = useCardStore();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [isEditCardOpen, setIsEditCardOpen] = useState(false)
  const [viewCard, setViewCard] = useState<Card | null>(null);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [passwordPromptFor, setPasswordPromptFor] = useState<'card_number' | 'cvv' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSensitiveAuth, setIsSensitiveAuth] = useState(false);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localLoading, setLocalLoading] = useState(false)

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      card_number: "",
      expiry_date: "",
      cvv: "",
      cardholder_name: "",
      billing_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    },
  })

  const editForm = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  })

  // Focused field for card visualization (add)
  const [focusedField, setFocusedField] = useState<Focused | undefined>(undefined);
  // Focused field for card visualization (edit)
  const [editFocusedField, setEditFocusedField] = useState<Focused | undefined>(undefined);

  // Sync editCardState when opening edit dialog
  useEffect(() => {
    if (isEditCardOpen && editingCard) {
      setEditFocusedField('number');
    }
  }, [isEditCardOpen, editingCard]);

  useEffect(() => {
    if(!profile) return
    (async () => {
      try {
        setLocalLoading(true)
        await fetchCardsByUser(profile.id)
        setLocalLoading(false)
      } catch (error: any) {
        toast.error('Error fetching cards', {description: error.message || "An unknown error occurred." })
        setLocalLoading(false)
      }
     })()
  }, [setIsEditCardOpen, fetchCardsByUser])


  const getCardIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case "visa":
        return "💳"
      case "mastercard":
        return "💳"
      case "amex":
        return "💳"
      default:
        return "💳"
    }
  }

  const getCardColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case "visa":
        return "from-blue-400 to-blue-600"
      case "mastercard":
        return "from-red-400 to-red-600"
      case "amex":
        return "from-green-400 to-green-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const detectCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, "")
    if (number.match(/^4/)) return "Visa"
    if (number.match(/^5[1-5]/)) return "Mastercard"
    if (number.match(/^3[47]/)) return "Amex"
    return "Unknown"
  }

  const onSubmit = async (data: CardFormData) => {
    if (!profile?.id) return;
    try {
      const cardType = detectCardType(data.card_number);
      await createCard(profile.id, {
        card_type: cardType,
        card_number: data.card_number.replace(/\s/g, ""),
        cardholder_name: data.cardholder_name,
        expiry_date: data.expiry_date,
        billing_address: data.billing_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country,
        cvv: data.cvv,
        is_default: false,
      });
      form.reset();
      setIsAddCardOpen(false);
      toast.success("Card added successfully",{
        description: "Your new card has been added to your account.",
      });
    } catch (error: any) {
      console.log(error)
      toast.error("Failed to add card",{
        description: error.message || "Please try again later."
      });
    }
  };

  const onEditSubmit = async (data: CardFormData) => {
    if (!editingCard) return;
    try {
      const updateData: any = {
        cardholder_name: data.cardholder_name,
        billing_address: data.billing_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country,
      };
      if (data.card_number && data.card_number.replace(/\s/g, '').length >= 16) {
        updateData.card_number = data.card_number.replace(/\s/g, '');
      }
      await updateCard(editingCard.id, updateData);
      setEditingCard(null);
      setIsEditCardOpen(false);
      editForm.reset();
      toast.success("Card updated successfully",{
        description: "Your card information has been updated.",
      });
    } catch (error: any) {
      toast.error("Failed to update card",{
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      toast.success("Card removed",{
        description: "The card has been removed from your account.",
      });
    } catch (error: any) {
      toast.error("Failed to remove card",{
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultCard(id);
      toast.success("Default card updated",{
        description: "Your default payment card has been updated.",
      });
    } catch (error: any) {
      toast.error("Failed to update default card",{
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleExportCards = () => {
    const csvContent = [
      ["Name", "Type", "Last 4 Digits", "Expiry", "Default", "Added"],
      ...cards.map((card) => [
        card.cardholder_name,
        card.card_type,
        card.card_number_last4,
        card.expiry_date,
        card.is_default ? "Yes" : "No",
        card.added_date,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cards-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Export Complete",{
      description: "Your card data has been exported successfully.",
    })
  }

  const openEditDialog = (card: Card) => {
    setEditingCard(card);
    editForm.reset({
      card_number: '', // For security, don't prefill
      cardholder_name: card.cardholder_name,
      billing_address: card.billing_address,
      city: card.city,
      state: card.state,
      zip_code: card.zip_code,
      country: card.country,
      expiry_date: card.expiry_date,
      cvv: '', // For security, don't prefill
    });
    setIsEditCardOpen(true);
  };

  // Mock password check (replace with real backend check)
  const checkPassword = async (password: string) => {
    // Replace this with a real API call
    try {
      const {error, data} = await supabase.auth.signInWithPassword({email: profile?.email!, password})
      if(error) throw error
      return data.user.email === profile?.email
    } catch (error: any) {
      toast.error("Error", {description: error.message || "Wrong password. Please try again!"})
    }
  };
  const handleRevealSensitive = async (field: 'card_number' | 'cvv') => {
    setPasswordPromptFor(field);
    setPasswordInput('');
    setPasswordError('');
  };
  const handlePasswordSubmit = async () => {
    const ok = await checkPassword(passwordInput);
    if (ok) {
      setIsSensitiveAuth(true);
      setPasswordPromptFor(null);
      setShowCardNumber(true);
      setShowCVV(true);
      // Start auto-hide timer
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = setTimeout(() => {
        setShowCardNumber(false);
        setShowCVV(false);
        setIsSensitiveAuth(false);
      }, 10000); // 10 seconds
    } else {
      setPasswordError('Incorrect password');
    }
  };

  // When hiding, do not ask for password again
  const handleHideSensitive = (field: 'card_number' | 'cvv') => {
    if (field === 'card_number') setShowCardNumber(false);
    if (field === 'cvv') setShowCVV(false);
    // If both are hidden, reset auth
    if (!showCardNumber && !showCVV) setIsSensitiveAuth(false);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
  };

  if(localLoading) return <InnerLoading />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Card Management</h1>
          <p className="text-gray-600">Manage your payment cards securely</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportCards}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button disabled={cards.length >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Card</DialogTitle>
                <DialogDescription>
                  Add a new payment card to your account. All information is encrypted and secure.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center mb-4">
                <Cards
                  acceptedCards={["visa", "mastercard", "amex"]}
                  number={form.watch('card_number') || ''}
                  expiry={form.watch('expiry_date') || ''}
                  cvc={form.watch('cvv') || ''}
                  name={form.watch('cardholder_name') || ''}
                  focused={focusedField}
                  callback={({ issuer }) => {
                    if (issuer && issuer !== 'issuer') {
                      // setCardState((prev) => ({ ...prev, issuer })); // This line is removed
                    }
                  }}
                />
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="card_number"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              onFocus={() => setFocusedField('number')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardholder_name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              onFocus={() => setFocusedField('name')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="MM/YY"
                              maxLength={5}
                              onFocus={() => setFocusedField('expiry')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="CVC"
                              maxLength={4}
                              onFocus={() => setFocusedField('cvc')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billing_address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Billing Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
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
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
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
                          <CountryDropdown
                            defaultValue={field.value}
                            onChange={(country) => field.onChange(country.name)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter className="gap-y-4 lg:gap-y-0">
                    <Button type="button" variant="outline" onClick={() => setIsAddCardOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>Add Card</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <CardComponent key={card.id} className={card.is_default ? "ring-2 ring-orange-400" : ""}>
            <CardContent className="p-0">
              {/* Card Visual */}
              <div className={`bg-gradient-to-r ${getCardColor(card.card_type)} text-white p-6 rounded-t-lg`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                  <div className="text-2xl">{getCardIcon(card.card_type)}</div>
                  <div onClick={() => { setViewCard(card); setShowCardNumber(false); setShowCVV(false); }} title="View Card Info">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm opacity-80">{card.card_type}</p>
                    {card.is_default && <Badge className="bg-white/20 text-white text-xs mt-1">Default</Badge>}
                   
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-mono tracking-wider">
                    {"**** **** **** " + card.card_number_last4}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-80">CARDHOLDER</p>
                      <p className="font-medium">{card.cardholder_name}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">EXPIRES</p>
                      <p className="font-medium">{card.expiry_date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Billing Address</p>
                  <p className="text-sm">
                    {card.billing_address}, {card.city}, {card.state}{" "}
                    {card.zip_code}, {card.country}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Added</p>
                  <p className="text-sm">{new Date(card.added_date).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!card.is_default && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(card.id)}>
                      Set Default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(card)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this card? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCard(card.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Card
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </CardComponent>
        ))}
      </div>

      {cards.length === 0 && (
        <CardComponent>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cards added</h3>
            <p className="text-gray-500 mb-6">Add your first payment card to start making purchases.</p>
            <Button  onClick={() => setIsAddCardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </CardComponent>
      )}

      {/* Security Notice */}
      <CardComponent className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 mt-1">🔒</div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Your cards are secure</h4>
              <p className="text-sm text-blue-700">
                All card information is encrypted using industry-standard security protocols. We never store your full
                card number or CVV on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </CardComponent>

      {/* View Card Info Modal */}
      <Dialog open={!!viewCard} onOpenChange={(open) => { if (!open) { setViewCard(null); setShowCardNumber(false); setShowCVV(false); setIsSensitiveAuth(false); if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Card Information</DialogTitle>
            <DialogDescription>View your card details. Sensitive info is hidden by default.</DialogDescription>
          </DialogHeader>
          {viewCard && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Cardholder</span>
                <span>{viewCard.cardholder_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Card Type</span>
                <span>{viewCard.card_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Card Number</span>
                <span className="flex items-center gap-2">
                  {showCardNumber && isSensitiveAuth ? (<>{decryptCardNumber(viewCard.card_number_hash)}</>) : (<>**** **** **** {viewCard.card_number_last4}</>)}
                  <Button variant="ghost" size="icon" onClick={e => {
                    e.stopPropagation();
                    if (showCardNumber && isSensitiveAuth) {
                      handleHideSensitive('card_number');
                    } else {
                      handleRevealSensitive('card_number');
                    }
                  }}>
                    {showCardNumber && isSensitiveAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Expiry</span>
                <span>{viewCard.expiry_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">CVV</span>
                <span className="flex items-center gap-2">
                  {showCVV && isSensitiveAuth ? viewCard.cvv : "•••"}
                  <Button variant="ghost" size="icon" onClick={e => {
                    e.stopPropagation();
                    if (showCVV && isSensitiveAuth) {
                      handleHideSensitive('cvv');
                    } else {
                      handleRevealSensitive('cvv');
                    }
                  }}>
                    {showCVV && isSensitiveAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Billing Address</span>
                <span className="text-right">{viewCard.billing_address}, {viewCard.city}, {viewCard.state} {viewCard.zip_code}, {viewCard.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Added</span>
                <span>{new Date(viewCard.added_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}
          {/* Password Prompt Overlay (does not affect modal open/close) */}
          {passwordPromptFor && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
                <h3 className="font-semibold mb-2">Enter your password</h3>
                <UiInput
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="mb-2"
                  autoFocus
                />
                {passwordError && <div className="text-red-500 text-sm mb-2">{passwordError}</div>}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setPasswordPromptFor(null)}>Cancel</Button>
                  <Button onClick={handlePasswordSubmit}>Submit</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update your card information. You can also change your card number.
            </DialogDescription>
          </DialogHeader>
          {/* <div className="flex justify-center mb-4">
            <Cards
              number={editForm.watch('card_number') || ''}
              expiry={editForm.watch('expiry_date') || ''}
              cvc={editForm.watch('cvv') || ''}
              name={editForm.watch('cardholder_name') || ''}
              focused={editFocusedField}
              callback={({ issuer }) => {
                if (issuer && issuer !== 'issuer') {
                  // setEditCardState((prev) => ({ ...prev, issuer })); // This line is removed
                }
              }}
            />
          </div> */}
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="card_number"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          onFocus={() => setEditFocusedField('number')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="cardholder_name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          onFocus={() => setEditFocusedField('name')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="MM/YY"
                          maxLength={5}
                          onFocus={() => setEditFocusedField('expiry')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="CVC"
                          maxLength={4}
                          onFocus={() => setEditFocusedField('cvc')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="billing_address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Billing Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <CountryDropdown
                        defaultValue={field.value}
                        onChange={(country) => field.onChange(country.name)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-y-4 lg:gap-y-0">
                <Button type="button" variant="outline" onClick={() => setIsEditCardOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>Update Card</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
