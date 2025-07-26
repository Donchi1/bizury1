"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Package,
  Shield,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuthStore } from "@/lib/store/auth"
import { useCartStore } from "@/lib/store/cartStore"
import { ButtonLoading, PageLoading } from "@/components/ui/loading"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { CartItem, Order } from "@/lib/types"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import { useAddressStore } from "@/lib/store/addressStore"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"


const shippingAddressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  country: z.string().min(1, "Please select a country"),
  instructions: z.string().optional(),
})

type ShippingAddress = z.infer<typeof shippingAddressSchema>

interface OrderSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  discount: number
}

const generateTrackingNumber = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let trackingNumber = ''
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    trackingNumber += characters.charAt(randomIndex)
  }
  return trackingNumber
}

function CheckoutPageContent() {
  const router = useRouter()
  const { user, profile, setProfile } = useAuthStore()
  const { items: cartItems, clearCart } = useCartStore()
  const { addresses, fetchAddressesByUser } = useAddressStore()
  const [useSavedAddress, setUseSavedAddress] = useState(false)

  // Transform cart store items to match checkout interface


  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      instructions: "",
    },
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")


  // Calculate order summary
  const orderSummary: OrderSummary = {
    subtotal: cartItems.reduce((sum, item) => sum + (item.product?.initial_price! * item.quantity), 0),
    shipping: 0, // Free shipping for orders over $35
    tax: 0,
    total: 0,
    discount: cartItems.reduce((sum, item) => {
      if (!item.product?.discount) return sum;

      const discountPercentage = parseFloat(item.product?.discount?.trim()?.replace("%", "").replace("-", ""));
      if (isNaN(discountPercentage)) return sum;

      const discountAmount = (item.product.initial_price! * discountPercentage / 100) * item.quantity;
      return sum + discountAmount;
    }, 0)
  }

  // Calculate subtotal after discount
  const subtotalAfterDiscount = orderSummary.subtotal - orderSummary.discount;

  // Calculate tax on discounted subtotal
  orderSummary.tax = subtotalAfterDiscount * 0.08; // 8% tax

  // Update shipping cost based on subtotal after discount
  if (subtotalAfterDiscount < 35) {
    orderSummary.shipping = 5.99;
  }

  // Calculate final total
  orderSummary.total = subtotalAfterDiscount + orderSummary.shipping + orderSummary.tax;

  const handlePlaceOrder = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Please fill in all required fields")
      return
    }
    const formValues = form.getValues()

    if (!user || !profile) {
      toast.error("You must be logged in to place an order")
      return router.replace("/auth/signin")
    }

    setIsProcessing(true)

    try {
      // 1. Get all product details for items in cart
      const productIds = cartItems.map(item => item.product_id)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, store_id')
        .in('asin', productIds)

       console.log("productsError",productsError)
      if (productsError) throw new Error('Failed to fetch product details')

      // 2. Separate products into merchant and company products
      const productStoreMap = new Map()
      const merchantProductIds = new Set()
      const companyProductItems: CartItem[] = []

      // Process found products (merchant products)
      if (products) {
        products.forEach(product => {
          productStoreMap.set(product.id, product.store_id)
          merchantProductIds.add(product.id)
        })
      }

      // Find company products (not found in database)
      for (const item of cartItems) {
        if (!merchantProductIds.has(item.product_id)) {
          companyProductItems.push(item)
        }
      }

      // 3. Group merchant items by store and calculate store-level discounts
      const storeItemsMap = new Map<string, { items: CartItem[], discount: number, subtotal: number }>()

      for (const item of cartItems) {
        if (merchantProductIds.has(item.product_id)) {
          const storeId = productStoreMap.get(item.product_id)
          if (!storeId) continue

          if (!storeItemsMap.has(storeId)) {
            storeItemsMap.set(storeId, { items: [], discount: 0, subtotal: 0 })
          }

          const storeData = storeItemsMap.get(storeId)!
          storeData.items.push(item)

          // Calculate item's discount if it exists
          let itemDiscount = 0;
          if (item.product?.discount) {
            const discountPercentage = parseFloat(item.product.discount.trim().replace("%", "").replace("-", ""));
            if (!isNaN(discountPercentage)) {
              itemDiscount = (item.product.initial_price! * discountPercentage / 100) * item.quantity;
            }
          }

          storeData.discount += itemDiscount;
          storeData.subtotal += (item.product?.initial_price! * item.quantity);
        }
      }

      // 4. Process merchant orders
      const merchantOrderPromises = Array.from(storeItemsMap.entries()).map(async ([storeId, storeData]) => {
        const { items: storeItems, discount: storeDiscount, subtotal: storeSubtotal } = storeData;

        // Calculate store-level totals
        const storeTotal = storeItems.reduce((sum, item) => sum + (item.product?.final_price! * item.quantity), 0);
        const storeTax = (storeSubtotal - storeDiscount) * 0.08; // 8% tax on discounted subtotal
        const storeShipping = storeSubtotal - storeDiscount < 35 ? 5.99 : 0; // Shipping logic per store
        const storeFinalTotal = (storeSubtotal - storeDiscount) + storeTax + storeShipping;

        // Create the order
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        const { data: createdOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_number: orderNumber,
            status: 'pending',
            payment_method: 'wallet',
            shipping_amount: storeShipping,
            subtotal: storeSubtotal,
            currency: 'USD',
            tax_amount: storeTax,
            discount_amount: storeDiscount,
            payment_status: 'confirmed',
            total_amount: storeFinalTotal,
            billing_address: {
              name: profile?.full_name,
              email: profile?.email,
              phone: profile?.phone,
              address: profile?.address,
              city: profile?.city,
              state: profile?.state,
              country: profile?.country,
            },
            shipping_address: formValues,
            store_id: storeId,
            tracking_number: generateTrackingNumber(),
            notes: formValues.instructions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create order items
        const orderItems = storeItems.map(item => ({
          order_id: createdOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          asin: item.product?.asin,
          price: item.product?.final_price,
          total: item.product?.final_price || 0 * item.quantity
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError

        // Update user's wallet balance
        const newBalance = (profile.wallet_balance || 0) - storeFinalTotal
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id)

        // Update profile in the auth store
        setProfile({
          ...profile,
          wallet_balance: newBalance
        })

        // Credit store owner's wallet
        const { data: store } = await supabase
          .from('stores')
          .select('owner_id, total_sales, total_revenue')
          .eq('id', storeId)
          .single()

        if (store) {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', store.owner_id)
            .single()

          if (ownerProfile) {
            const newOwnerBalance = (ownerProfile.wallet_balance || 0) + storeFinalTotal
            await supabase
              .from('profiles')
              .update({ wallet_balance: newOwnerBalance })
              .eq('id', store.owner_id)
          }
        }

        await supabase
        .from("stores")
        .update({
          total_sales: store?.total_sales + storeFinalTotal,
          total_revenue: store?.total_revenue + storeFinalTotal,
        })
        .eq("id", storeId)

        return createdOrder
      })
      // 5. Process company direct orders
      // 5. Process company direct orders with the same discount logic as merchant orders
      let companyOrder: Order | null = null
      if (companyProductItems.length > 0) {
        console.log("I was here in the company section", companyProductItems)
        // Calculate company order totals with discount
        const companySubtotal = companyProductItems.reduce((sum, item) =>
          sum + (item.product?.initial_price! * item.quantity), 0);

        // Calculate company order discount
        const companyDiscount = companyProductItems.reduce((sum, item) => {
          if (!item.product?.discount) return sum;

          const discountPercentage = parseFloat(item.product.discount.trim().replace("%", "").replace("-", ""));
          if (isNaN(discountPercentage)) return sum;

          return sum + (item.product.initial_price! * discountPercentage / 100) * item.quantity;
        }, 0);

        // Calculate company order shipping and tax
        const companyTax = (companySubtotal - companyDiscount) * 0.08; // 8% tax on discounted subtotal
        const companyShipping = companySubtotal - companyDiscount < 35 ? 5.99 : 0; // Same shipping logic
        const companyTotal = (companySubtotal - companyDiscount) + companyTax + companyShipping;

        const orderNumber = `COMPANY-ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        // Create the order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_number: orderNumber,
            status: 'pending',
            payment_method: 'wallet',
            shipping_amount: companyShipping,
            subtotal: companySubtotal,
            tax_amount: companyTax,
            discount_amount: companyDiscount,
            payment_status: 'confirmed',
            total_amount: companyTotal,
            billing_address: {
              name: profile?.full_name,
              email: profile?.email,
              phone: profile?.phone,
              address: profile?.address,
              city: profile?.city,
              state: profile?.state,
              country: profile?.country,
            },
            shipping_address: formValues,
            tracking_number: generateTrackingNumber(),
            notes: formValues.instructions,
            is_company_order: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
         console.log("companyOrderError",orderError)
        if (orderError) throw orderError
        companyOrder = orderData
        console.log("companyOrder",companyOrder)

        // Create order items
        const orderItems = companyProductItems.map(item => ({
          order_id: companyOrder?.id,
          product_id: null,
          quantity: item.quantity,
          asin: item.product?.asin,
          price: item.product?.final_price,
          total: item.product?.final_price || 0 * item.quantity,
          is_company_order: true,
          
        }))
        const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        
        console.log("company orderItems error",itemsError)
        if (itemsError) throw itemsError
        console.log("company orderItems added",orderItems)
        
        const newBalance = (profile.wallet_balance || 0) - companyTotal
        const { error: adminError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('role', "admin")
          console.log("company adminError",adminError)

        if (adminError) throw adminError
        console.log("company adminError",adminError)
      }

      // Wait for all merchant orders to be processed
      const merchantOrders = await Promise.all(merchantOrderPromises)
      const allOrders = [...merchantOrders]
      if (companyOrder) allOrders.push(companyOrder)

      // Clear the cart
      clearCart()

      // Show success message
      toast.success('Order placed successfully!')

      // Generate order number for display
      const newOrderNumber = allOrders[0]?.order_number || ''
      setOrderNumber(newOrderNumber)
      setOrderPlaced(true)
      setCurrentStep(3)

    } catch (error:any) {
      console.log('Error placing order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const { updateQuantity: updateCartQuantity } = useCartStore()

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    updateCartQuantity(itemId, newQuantity)
  }

  // Redirect to products page if cart is empty and no order has been placed
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      router.push('/products')
    }
  }, [cartItems.length, orderPlaced, router])

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) return
      await fetchAddressesByUser(user.id)
    }
    fetchAddresses()
  }, [orderPlaced, router, user?.id, fetchAddressesByUser])


  const handleAddress = (value: boolean) => {
    setUseSavedAddress(value)
    if (!value) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        instructions: "",
      })
    } else {
      const address = addresses?.find(addr => addr.is_default)
      if (address) {
        form.reset({
          firstName: address.first_name || '',
          lastName: address.last_name || '',
          email: user?.email || '',
          phone: address.phone || '',
          address: address.address_line_1 || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postal_code || '',
          country: address.country || '',
          instructions: '',
        })
      }
    }
  }


  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart to continue with checkout.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Order Number</h3>
                <div className="text-2xl font-bold text-orange-600">{orderNumber}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <div className="font-medium">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Payment Method:</span>
                  <div className="font-medium">Cash on Delivery</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Amount:</span>
                  <div className="font-medium">${orderSummary.total.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <div className="font-medium">5-7 business days</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/track-order?order=${orderNumber}`}>
                Track Order
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/orders">
                View All Orders
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Steps */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'
                    }`}>
                    1
                  </div>
                  <span className="hidden sm:inline">Review Cart</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'
                    }`}>
                    2
                  </div>
                  <span className="hidden sm:inline">Shipping Info</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200'
                    }`}>
                    3
                  </div>
                  <span className="hidden sm:inline">Place Order</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Review Cart */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Review Your Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center flex-col space-y-2 lg:space-y-0 lg:flex-row space-x-4 p-4 border rounded-lg">
                      <div className="size-[200px] lg:size-20">
                        <Image src={item.product?.image_url!} alt={item.product?.title!} width={200} height={200} className="size-full" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product?.title}</h3>
                        <p className="text-sm text-gray-500">{item.product?.categories?.[0]}</p>
                        <p className="text-orange-600 font-semibold">${(item.product?.final_price as number).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.product?.final_price as number * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={cartItems.length === 0}
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses && addresses.length > 0 && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex flex-col gap-4">
                      <div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Use Saved Address</h4>
                            <p className="text-xs text-gray-500">Toggle to use a saved address or enter a new address</p>
                          </div>
                          <Switch
                            checked={useSavedAddress}
                            onCheckedChange={handleAddress}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </div>
                        {useSavedAddress && <p>{form.getValues('city')}, {form.getValues('state')} {form.getValues('zipCode')}</p>}
                      </div>
                    </div>
                  </div>
                )}
                <Form {...form}>
                  <div className="space-y-4">
                    {!useSavedAddress ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Doe"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="john@example.com"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="+1 (555) 123-4567"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="123 Main Street"
                                  required
                                />
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
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="New York"
                                  required
                                />
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
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="NY"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="10001"
                                  required
                                />
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
                                <CountryDropdown
                                  defaultValue={field.value}
                                  onChange={({ name }) => field.onChange(name)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>) : (
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-2">Using saved address:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p>{form.getValues('firstName')} {form.getValues('lastName')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p>{form.getValues('phone')}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Address</p>
                            <p>{form.getValues('address')}</p>
                            <p>{form.getValues('city')}, {form.getValues('state')} {form.getValues('zipCode')}</p>
                            <p>{form.getValues('country')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Delivery Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any special delivery instructions..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Cart
                    </Button>
                    <Button
                      onClick={async () => {
                        const isValid = await form.trigger()
                        if (isValid) {
                          setCurrentStep(3)
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment & Review */}
          {currentStep === 3 && (
            <form onSubmit={(e) => {e.preventDefault(); handlePlaceOrder()}}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment & Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Review */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">{form.getValues().firstName} {form.getValues().lastName}</p>
                    <p className="text-gray-600">{form.getValues().address}</p>
                    <p className="text-gray-600">{form.getValues().city}, {form.getValues().state} {form.getValues().zipCode}</p>
                    <p className="text-gray-600">{form.getValues().country}</p>
                    <p className="text-gray-600">{form.getValues().phone}</p>
                    {form.getValues().instructions && (
                      <p className="text-gray-600 mt-2">
                        <span className="font-medium">Instructions:</span> {form.getValues().instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>${orderSummary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>${orderSummary.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${orderSummary.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox  id="terms" className=" w-4 h-4" required  />
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                      <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 flex-col md:flex-row">
                  <Button
                  type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back to Shipping
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ButtonLoading text={`Processing Order - $${orderSummary.total.toFixed(2)}`} />
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Place Order - ${orderSummary.total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </form>
          )}
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 sm:flex h-12 bg-gray-200 rounded-lg hidden items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product?.title}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">${(item.product?.final_price || 0 * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>${orderSummary.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${orderSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                {orderSummary.shipping === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Free Shipping</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Orders over $35 ship free</p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Your information is protected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoading text="Loading checkout..." />}>
      <CheckoutPageContent />
    </Suspense>
  )
} 