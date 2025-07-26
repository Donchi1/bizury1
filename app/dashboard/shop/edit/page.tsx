"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Store, 
  ArrowLeft, 
  Save, 
  Upload, 
  Camera,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuthStore } from "@/lib/store/auth"
import { useSellingStore } from "@/lib/store/sellingStore"
import { PageLoading, ButtonLoading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { descriptionTemplates } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"

const storeFormSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters").max(100, "Store name must be less than 100 characters"),
  store_description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(10, "Please enter a valid phone number"),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  postal_code: z.string().min(3, "Postal code must be at least 3 characters"),
})

type StoreFormValues = z.infer<typeof storeFormSchema>


const uploadToStorage = async (file: File, pathPrefix: string, userId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${pathPrefix}-${userId}.${fileExt}`
  const { data, error } = await supabase
    .storage
    .from("store-assets")
    .upload(fileName, file, { upsert: true }) // always replace
  if (error) throw error
  const { data: publicUrlData } = supabase.storage.from("store-assets").getPublicUrl(fileName)
  return publicUrlData.publicUrl
}


export default function EditStorePage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { store, loading, updateStore, fetchStoreByUser } = useSellingStore()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  // Form schema: use all fields you want editable
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      store_name: "",
      store_description: "",
      contact_email: "",
      contact_phone: "",
      website_url: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
    },
  })

  // Fetch store on mount
  useEffect(() => {
    if (profile?.id && !store) {fetchStoreByUser(profile.id)}
  }, [profile?.id, store, fetchStoreByUser])

  // Populate form when store loads
  useEffect(() => {
    if (store) {
      form.reset({
        store_name: store.name || "",
        store_description: store.description || "",
        contact_email: store.email || "",
        contact_phone: store.phone || "",
        website_url: store.website_url || "",
        address: store.address || "",
        city: store.city || "",
        state: store.state || "",
        country: store.country || "",
        postal_code: store.postal_code || "",
        // ...add other fields as needed
      })
    }
  }, [store, form])

  // On submit, update the store
  const onSubmit = async (data: StoreFormValues) => {
    setSaving(true)
    try {
      let logoUrl = store?.logo_url
      let bannerUrl = store?.banner_url

      if (logoFile && profile?.id) {
        logoUrl = await uploadToStorage(logoFile, 'logo', profile.id)
      }
      if (bannerFile && profile?.id) {
        bannerUrl = await uploadToStorage(bannerFile, 'banner', profile.id)
      }

      await updateStore(store?.id!, {
        name: data.store_name,
        description: data.store_description,
        email: data.contact_email,
        phone: data.contact_phone,
        website_url: data.website_url,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      })
      toast({ title: "Store Updated", description: "Your store information has been updated." })
      router.push("/dashboard/shop")
    } catch (error) {
      toast({ title: "Error", description: "Failed to update store.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
    }
  }

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBannerFile(file)
    }
  }

  const handleAutoGenerateDescription = () => {
    // Use store.category or a form value for classification
    const classification = (store?.category || "all").toLowerCase()
    const templates = descriptionTemplates[classification] || descriptionTemplates["all"]
    const random = templates[Math.floor(Math.random() * templates.length)]
    form.setValue("store_description", random)
    toast({
      title: "AI-generated description added!",
      description: "This description was generated based on your store category.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <PageLoading text="Loading store information..." />
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
        <p className="text-gray-600 mb-6">You don't have a store yet. Create one to get started.</p>
        <Button onClick={() => router.push("/dashboard/apply-merchant")}>
          Create Store
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/shop")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Store</h1>
            <p className="text-muted-foreground">Update your store information and settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(store.status)}>
            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
          </Badge>
          {store.is_verified && (
            <Badge className="bg-blue-100 text-blue-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Store Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Store Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Logo */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Logo</label>
                  <p className="text-sm text-muted-foreground">Upload your store logo (recommended: 200x200px)</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={logoFile ? URL.createObjectURL(logoFile) : store.logo_url} 
                      alt="Store Logo" 
                    />
                    <AvatarFallback className="text-lg font-bold">
                      {store.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {logoFile ? `Selected: ${logoFile.name}` : "No file selected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Banner */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Store Banner</label>
                  <p className="text-sm text-muted-foreground">Upload your store banner (recommended: 1200x300px)</p>
                </div>
                <div className="space-y-4">
                  <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={bannerFile ? URL.createObjectURL(bannerFile) : store?.banner_url!}
                      alt="Store Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {bannerFile ? `Selected: ${bannerFile.name}` : "No file selected"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="store_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Store Description
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="ml-2 px-2 py-0"
                        onClick={handleAutoGenerateDescription}
                        title="Auto-generate description"
                      >
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your store and what you offer"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your store page to help customers understand your business.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@yourstore.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourstore.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your business website if you have one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Store Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Store Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Store Level</p>
                  <p className="text-2xl font-bold text-blue-600">Level {store.store_level}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Account Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${profile?.wallet_balance.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-medium">
                    {new Date(store.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(store.status)}>
                    {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/shop")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <ButtonLoading className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 