"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Sparkles, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        const allProducts = await mockApi.getProducts()
        // Filter products that are relatively new (have date_first_available)
        const newArrivals = allProducts.filter(product => 
          product.date_first_available && 
          new Date(product.date_first_available) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        )
        // If no recent products, show products with badges indicating they're new
        const finalProducts = newArrivals.length > 0 ? newArrivals : allProducts.slice(0, 20)
        setProducts(finalProducts)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load new arrivals",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    loadNewArrivals()
  }, [])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        if (a.date_first_available && b.date_first_available) {
          return new Date(b.date_first_available).getTime() - new Date(a.date_first_available).getTime()
        }
        return 0
      case "price-low":
        return a.final_price! - b.final_price!
      case "price-high":
        return b.final_price! - a.final_price!
      case "rating":
        return b.rating! - a.rating!
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-gray-200 h-32 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="bg-gray-200 h-48 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-4xl font-bold">New Arrivals</h1>
        </div>
        <p className="text-blue-100 text-lg">Discover the latest products just in!</p>
        <p className="text-blue-200 mt-2">{products.length} new products available</p>
        <div className="flex items-center space-x-2 mt-4 text-blue-100">
          <Calendar className="h-4 w-4" />
          <span>Fresh arrivals updated daily</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-col gap-y-4 lg:gap-y-0 lg:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Latest Products</h2>
          <p className="text-gray-600">{sortedProducts.length} products found</p>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="lg:w-40 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
        {sortedProducts.map((product) => (
          <Card key={product.asin} className="group hover:shadow-lg transition-shadow relative border-2 border-blue-200">
            <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex space-x-4"}>
              {/* New Arrival Badge */}
              <Badge className="absolute top-2 left-2 bg-blue-500 text-white z-10 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                NEW
              </Badge>
              
              <div className={viewMode === "grid" ? "space-y-4" : "flex-shrink-0"}>
                <div className={`relative ${viewMode === "grid" ? "h-48" : "h-24 w-24"}`}>
                  <Link href={`/product/${product.asin}`}>
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover rounded group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  {product.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      {product.discount} OFF
                    </Badge>
                  )}
                </div>
              </div>

              <div className={`${viewMode === "grid" ? "space-y-2" : "flex-1 space-y-2"}`}>
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-semibold hover:text-blue-500 line-clamp-2">{product.title}</h3>
                </Link>

                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({product.reviews_count ?? 0})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600">{formatPrice(product.final_price!)}</span>
                  {product.initial_price && product.final_price! < product.initial_price && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.initial_price)}</span>
                  )}
                </div>

                {product.date_first_available && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Added {formatDate(product.date_first_available)}</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No new arrivals available</h3>
          <p className="text-gray-500">Check back soon for fresh products!</p>
        </div>
      )}
    </div>
  )
} 