"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Star, MessageSquare, MapPin, Store as StoreIcon, Heart, HeartOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/store/auth"
import { useSellingStore } from "@/lib/store/sellingStore"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Store } from "@/lib/types"

export default function StoresPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const {
    stores,
    loading,
    error,
    fetchAllStores,
    followStore,
    unfollowStore,
    fetchFollowedStores
  } = useSellingStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all stores and followed stores
  useEffect(() => {
    if (!profile) return;
    setIsLoading(true);
    (async () => {
      try {
        await fetchAllStores(profile.id);
        //await fetchFollowedStores(profile.id);
      } catch (error: any) {
        toast.error(error.message || "Failed to load stores");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchAllStores, profile?.id]);


  const handleFollow = async (store: Store, isFollowing: boolean) => {
    if (!profile?.id) {
      router.push("/login")
      return
    }

    if(store.owner_id === profile.id){
      toast.error("You cannot follow your own store")
      return
    }

    try {
      if (isFollowing) {
        await unfollowStore(profile.id, store.id)
        toast.success("Unfollowed store")
      } else {
        await followStore(profile.id, store.id)
        toast.success("Now following store")
      }
      // Refresh the followed stores to update the UI
      await fetchFollowedStores(profile.id)
    } catch (error) {
      toast.error("Failed to update follow status")
    }
  }

  // Filter and sort stores
  const filteredStores = stores
    .filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(store =>
      filterCategory === "all" ||
      store.category?.toLowerCase() === filterCategory.toLowerCase()
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "products":
          return (b.products?.length || 0) - (a.products?.length || 0)
        default: // recent
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  // Get unique categories
  const categories = ["all", ...new Set(stores.map(store => store.category).filter(Boolean))]

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading stores. Please try again later.
        </div>
      </div>
    )
  }

  if (isLoading) return (
    <div className="container mx-auto p-4 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {Array.from({ length: 6 }).map((_, index) => (

        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-gray-100">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-4">
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
  ) 

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Stores</h1>
          <p className="text-gray-600">Discover and follow your favorite stores</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search stores..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category!}>
                    {category?.charAt(0).toUpperCase() + category?.slice(1)!}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="products">Most Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
        {filteredStores?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                {store.banner_url ? (
                  <Image
                    src={store.banner_url}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                    <StoreIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{store.name}</h3>
                    {store.category && (
                      <Badge variant="outline" className="mt-1">
                        {store.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                      {store.rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>

                {store.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {store.description}
                  </p>
                )}

                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{store.address || "Location not specified"}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{store.products?.length || 0} products</span>
                  <span>{store.followers?.length || 0} followers</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 border-t">
                <div className="flex w-full gap-2 mt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href={`/stores/${store.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Visit Store
                    </Link>
                  </Button>
                  <Button
                    variant={store.isFollowing ?  "default" : "outline"}
                    className="w-10 p-0"
                    onClick={() => handleFollow(store, store?.isFollowing!)}
                    disabled={!profile}
                  >
                    {store.isFollowing ? (
                      <HeartOff className="h-4 w-4" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <StoreIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search or filter to find what you're looking for."
              : "There are currently no stores available."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setFilterCategory("all")
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}