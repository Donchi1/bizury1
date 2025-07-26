"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Edit, Trash2, MapPin, Home, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { addressSchema, type AddressFormData } from "@/lib/validations"
import { useAuthStore } from "@/lib/store/auth"
import { useAddressStore } from "@/lib/store/addressStore"
import type { Address } from "@/lib/types"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import InnerLoading from "@/components/layout/InnerLoading"
import { toast } from "sonner"

export default function AddressesPage() {
  const { user } = useAuthStore()
  const {
    addresses,
    loading,
    fetchAddressesByUser,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [localLoading,setLocalLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    (async() => {
      setLocalLoading(true)
      await fetchAddressesByUser(user.id)
      setLocalLoading(false)
    })()
  }, [fetchAddressesByUser])

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      isDefault: false,
    },
  })

  const onSubmit = async (data: AddressFormData) => {
    if (!user?.id) return
    try {
      if (editingAddress) {
        // Update existing address
        await updateAddress(editingAddress.id, {
          first_name: data.fullName.split(" ")[0] || data.fullName,
          last_name: data.fullName.split(" ").slice(1).join(" ") || "",
          address_line_1: data.addressLine1,
          address_line_2: data.addressLine2,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
          phone: data.phone,
          is_default: data.isDefault ?? false,
        })
        toast("Address updated",{
          description: "Your address has been successfully updated.",
        })
      } else {
        // Add new address
        await createAddress(user.id, {
          type: "shipping",
          first_name: data.fullName.split(" ")[0] || data.fullName,
          last_name: data.fullName.split(" ").slice(1).join(" ") || "",
          address_line_1: data.addressLine1,
          address_line_2: data.addressLine2,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
          phone: data.phone,
          is_default: data.isDefault ?? false,
        })
        toast( "Address added",{
          description: "Your new address has been successfully added.",
        })
      }
      setIsDialogOpen(false)
      setEditingAddress(null)
      form.reset()
    } catch (error) {
      toast.error("Error",{
        description: "Failed to save address. Please try again.",
      })
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    form.reset({
      fullName: address.first_name + (address.last_name ? ` ${address.last_name}` : ""),
      phone: address.phone || "",
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      isDefault: address.is_default ?? false,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress(addressId)
      toast.success("Address deleted",{
        description: "The address has been successfully deleted.",
      })
    } catch (error) {
      toast.error("Error",{
        description: "Failed to delete address. Please try again.",
      })
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId)
      toast.success("Default address updated",{
        description: "Your default shipping address has been updated.",
      })
    } catch (error) {
      toast( "Error",{
        description: "Failed to update default address. Please try again.",
      })
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "work":
        return <Building className="h-5 w-5 text-blue-500" />
      default:
        return <Home className="h-5 w-5 text-green-500" />
    }
  }

  if(localLoading) return <InnerLoading itemLength={2} />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Addresses</h1>
          <p className="text-gray-600">Manage your shipping addresses for faster checkout</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingAddress(null)
                form.reset({
                  fullName: "",
                  phone: "",
                  addressLine1: "",
                  addressLine2: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "United States",
                  isDefault: false,
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {editingAddress ? "Update your shipping address details" : "Add a new shipping address to your account"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <CountryDropdown defaultValue={field.value} onChange={(value) => field.onChange(value.name)} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default shipping address</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingAddress(null)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? (editingAddress ? "Updating..." : "Adding...")
                      : (editingAddress ? "Update Address" : "Add Address")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-500 mb-6">Add your first shipping address to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? "border-orange-200 bg-orange-50" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getAddressIcon(address.type)}
                    <div>
                      <h3 className="font-semibold">{address.first_name + (address.last_name ? ` ${address.last_name}` : "")}</h3>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {address.is_default && <Badge className="bg-orange-500">Default</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      disabled={address.is_default}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>{address.address_line_1}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                </div>

                {!address.is_default && (
                  <Button variant="outline" disabled={loading} size="sm" onClick={() => handleSetDefault(address.id)}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {loading ?  "Updating..." : "Set as Default"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
