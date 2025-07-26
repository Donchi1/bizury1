"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Store, Star, Users, Package, Heart, MessageSquare, Eye, Search, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/store/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import InnerLoading from "@/components/layout/InnerLoading"
import { useSellingStore } from "@/lib/store/sellingStore"
import { useCustomerMessageStore } from "@/lib/store/customerMessageStore"
import { Store as StoreType } from "@/lib/types"

export default function FollowedStoresPage() {
  
  const { user, profile } = useAuthStore()
  const { loading: sellingLoading, error, fetchFollowedStores, unfollowStore, followedStores, } = useSellingStore()
  const { messages, sendMessage, loading } = useCustomerMessageStore();
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterCategory, setFilterCategory] = useState("all")
  const [message, setMessage] = useState("")
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)


  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      setLocalLoading(true)
      try {
        await fetchFollowedStores(user.id)
        setLocalLoading(false)
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch followed stores")
        setLocalLoading(false)
      }
    })()
  }, [fetchFollowedStores, user?.id])


   const categories = ["all", ...Array.from(new Set(followedStores?.map((store) => store.category)))]

  const filteredStores = followedStores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesCategory = filterCategory === "all" || store.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "alphabetical":
        return a.name.localeCompare(b.name)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const handleUnfollow = async (storeId: string) => {
    if (!user?.id) return

    try {
      await unfollowStore(user.id, storeId)
      toast.success("Store unfollowed successfully")
    } catch (error) {
      toast.error("Failed to unfollow store")
    }
  }

  const handleSendMessage = async () => {
    if (!selectedStore || !message.trim()) return

    try {
      // Here you would typically call an API to send the message
      // For now, we'll just show a success message
      await sendMessage({
        message: message,
        receiver_id: selectedStore.owner_id,
        store_id: selectedStore.id,
        sender_id: profile?.id!,
        receiver_role: profile?.role === "customer" ? "customer" : "merchant",
        sender_role: profile?.role === "customer" ? "customer" : "merchant",
      })
      toast.success(`Message sent to ${selectedStore.name}`)
      setMessage("")
      setIsMessageDialogOpen(false)
      setSelectedStore(null)
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  // const totalSpent = stores.reduce((sum, store) => sum + (store.total_sales || 0), 0)
  // const totalOrders = stores.reduce((sum, store) => sum + (store.total_orders || 0), 0)
  // const averageRating = stores.length > 0 
  //   ? stores.reduce((sum, store) => sum + (store.rating || 0), 0) / stores.length 
  //   : 0

  if (localLoading) return <InnerLoading />

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading stores: {error}</p>
        <Button
          onClick={() => user?.id && fetchFollowedStores(user.id)}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Followed Stores</h1>
          <p className="text-gray-600">Manage stores you follow and discover new products</p>
        </div>
        <div className="flex justify-between items-center flex-col lg:flex-row">
          <div className="flex gap-4 flex-col lg:flex-row w-full">
            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 lg:w-64 w-full"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="lg:w-40 w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="lg:w-48 w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Followed</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/stores" className="w-full lg:w-auto mt-4 lg:mt-0">
            <Button className="w-full lg:w-auto">
              Discover Stores
              <ArrowRight />
            </Button>
          </Link>
        </div>

      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedStore?.name}</DialogTitle>
            <DialogDescription>
              Send a message to this store. They'll receive it in their messages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!message.trim() || loading}>
                {loading ? "Sending Message..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedStores.map((store) => (
          <Card key={store.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={store.banner_url || "/placeholder.svg"}
                alt={`${store.name} banner`}
                width={400}
                height={200}
                className="w-full h-32 object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Badge className="bg-green-500 text-white">Online</Badge>
                {store.status === "active" && <Badge className="bg-blue-500 text-white">Verified</Badge>}
              </div>
            </div>

            <CardContent className="p-6">
              <div className=" flex justify-between  mb-4">
                <div>
                  <Image
                    src={store.logo_url || "/placeholder.svg"}
                    alt={`${store.name} logo`}
                    width={60}
                    height={60}
                    className="rounded-full size-20 border-2 border-white shadow-lg"
                  />
                  <div className="flex-1 mt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{store.name}</h3>

                    </div>
                    <p className="text-sm text-gray-600 mb-2">{store.description || "No description available"}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{store.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3" />
                        <span>{store.products?.length || 0} products</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(store.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Heart className="h-4 w-4 mr-1 fill-current" />
                  Unfollow
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium capitalize">{store.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{store.country || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Store Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-blue-600">{(Math.floor(Math.random() * 10000) + 100).toLocaleString()}</p>
                    <p className="text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">${store.total_sales?.toFixed(2) || '0.00'}</p>
                    <p className="text-gray-600">Total Sales</p>
                  </div>
                </div>
              </div>

              <div className="flex  flex-wrap items-center gap-2">
                <Button asChild className="flex-1 order-3 lg:order-1">
                  <Link href={`/stores/${store.id}`}>
                    <Store className="h-4 w-4 mr-2" />
                    Visit Store
                  </Link>
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStore(store)
                    setIsMessageDialogOpen(true)
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  asChild
                  onClick={() => {
                    // Scroll to products section after navigation
                    setTimeout(() => {
                      const productsSection = document.getElementById('products')
                      if (productsSection) {
                        productsSection.scrollIntoView({ behavior: 'smooth' })
                      }
                    }, 100)
                  }}
                >
                  <Link href={`/stores/${store.id}#products`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Browse
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedStores.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== "all"
                ? "No stores match your search criteria"
                : "You haven't followed any stores yet"}
            </p>
            <Link href="/stores">
              <Button >
                Discover Stores
                <ArrowRight />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
