// app/store/[storeId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Star, Heart, MessageSquare, ChevronLeft, ShoppingCart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth"
import { useCartStore } from "@/lib/store/cartStore"
import { useSellingStore } from "@/lib/store/sellingStore"
import { Follower, Product, Profile, Review, Store } from "@/lib/types"
import { toast } from "sonner"
import InnerLoading from "@/components/layout/InnerLoading"
import { Dialog, DialogDescription, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCustomerMessageStore } from "@/lib/store/customerMessageStore"
import { Loading } from "@/components/ui/loading"

export default function StorePage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.storeId as string
  const { user, profile } = useAuthStore()
  const { addItem } = useCartStore()
  const { sendMessage } = useCustomerMessageStore()
  const {
    loading,
    store,
    error,
    fetchStoreById,
    followStore,
    unfollowStore,
    checkIfFollowing,
    addReview,
  } = useSellingStore()

  const [activeTab, setActiveTab] = useState("products")
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [localLoading, setLocalLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)

  // Fetch store data
  useEffect(() => {
    const loadStore = async () => {
      if (storeId) {
        setLocalLoading(true)
        try {
          await fetchStoreById(storeId, user?.id)
          setLocalLoading(false)
        } catch (err) {
          setLocalLoading(false)
          toast.error("Error", {
            description: "Failed to load store",
          })
        }
      }
    }

    loadStore()
  }, [storeId, user?.id,setLocalLoading, fetchStoreById])


  const handleFollow = async () => {
    if (!user?.id) {
      router.push("/login")
      return
    }
    if(store?.owner_id === user.id){
      toast.error("You can't follow your own store")
      return
    }

    try {
      if (store?.isFollowing) {
        await unfollowStore(user.id, storeId)
        toast.success("Store unfollowed", {
          description: `You've unfollowed ${store?.name}`,
        })
      } else {
        await followStore(user.id, storeId)
        toast.success("Store followed", {
          description: `You're now following ${store?.name}`,
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update follow status",
      })
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)

    toast.success("Added to cart", {
      description: `${product.title} has been added to your cart`,
    })
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      router.push("/login")
      return
    }
    if(store?.owner_id === user.id){
      toast.error("You can't review your own store")
      return
    }

    try {
      await addReview({
        user_id: user.id,
        store_id: storeId,
        rating: reviewRating,
        comment: reviewText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      setReviewText("")
      setReviewRating(5)
      toast.success("Review submitted", {
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to submit review",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!selectedStore || !message.trim()) return

    if (selectedStore.owner_id === profile?.id) {
      toast.error("You can't send message to yourself")
      return
    }

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

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.name || 'Store',
          text: `Check out this store on Bizury: ${store?.name}`,
          url: shareUrl,
        })
        toast.success('Store shared!', { description: 'Thanks for sharing.' })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied!', { description: 'Store link copied to clipboard.' })
      } catch (err) {
        toast.error('Failed to copy link')
      }
    }
  }

  if (localLoading) return <Loading text="Loading store..."/>

  if (error || !store) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Store not found</h2>
        <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.back()} variant="outline" className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Go back
        </Button>
        <Button onClick={() => router.push('/')}>
          Go to homepage
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="relative mb-8 rounded-lg overflow-hidden bg-gray-100">
        <div className="h-48 md:h-64 w-full relative">
          <Image
            src={store.banner_url || "/placeholder.svg"}
            alt={`${store.name} banner`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-end space-x-4">
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white bg-white shadow-lg">
                <Image
                  src={store.logo_url || "/placeholder.svg"}
                  alt={`${store.name} logo`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
                  {store.is_verified && (
                    <Badge className="bg-blue-500 text-white">Verified</Badge>
                  )}
                  {store.status === "active" && (
                    <Badge className="bg-green-500 text-white">Online</Badge>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-200">{store.category} • {store.city}, {store.country}</p>
                <div className="flex items-center mt-1 space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm">{store.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="mx-1 text-gray-300">•</span>
                    <span className="text-sm text-gray-300">{store.reviews?.length} reviews</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-pink-500 mr-1" />
                    <span className="text-sm">{(store?.followers as Follower[]).length!} followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 items-center gap-4 w-full lg:w-auto">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button variant={"outline"} size="sm" onClick={handleFollow}>
            <Heart className={`h-4 w-4 mr-1 ${store.isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
            {store?.isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedStore(store)
            setIsMessageDialogOpen(true)
          }}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Member since {new Date(store.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Store Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger
            value="products"
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "bg-blue-50 text-blue-600" : ""}
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="about"
            onClick={() => setActiveTab("about")}
            className={activeTab === "about" ? "bg-blue-50 text-blue-600" : ""}
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            onClick={() => setActiveTab("reviews")}
            className={activeTab === "reviews" ? "bg-blue-50 text-blue-600" : ""}
          >
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products">
            {store.products?.map((product) => (
              <Card key={product.asin} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  {product?.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      {product.discount}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 h-12">{product.title}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {product.rating} ({(product.reviews_count || 0).toLocaleString()})
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold">${product.final_price?.toFixed(2)}</span>
                    {product.initial_price && product.initial_price > product?.final_price! && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product?.initial_price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.is_available}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.is_available ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">About {store.name}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                {store.description || 'No description available.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Store Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-32 text-gray-600">Category:</span>
                      <span className="text-gray-900">{store.category || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Location:</span>
                      <span className="text-gray-900">{store.city}, {store.country}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Member since:</span>
                      <span className="text-gray-900">
                        {new Date(store.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Response time:</span>
                      <span className="text-gray-900">1 day</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Store Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-32 text-gray-600">Total products:</span>
                      <span className="text-gray-900">{store.products?.length || 0}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Total orders:</span>
                      <span className="text-gray-900">{(Math.floor(Math.random() * 10000) + 100).toLocaleString()}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-gray-900">
                          {store.rating?.toFixed(1) || 'N/A'} ({(store.reviews?.length || 0).toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Followers:</span>
                      <span className="text-gray-900">{store.followers?.length?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-8">
          {/* Review Form */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Write a Review</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${star <= reviewRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                          }`}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="review"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Review
                  </label>
                  <textarea
                    id="review"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <Button type="submit">Submit Review</Button>
              </form>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-6">
              {(store.reviews as Review[])?.length > 0 ? (
                store.reviews?.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="font-medium">
                              {review.profile?.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              @{review.profile?.username || "Anonymous"}
                            </p>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="ml-1 text-sm text-gray-600">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
    </div>
  )
}