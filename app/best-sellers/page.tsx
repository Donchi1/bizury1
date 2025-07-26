"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("rating")
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        const allProducts = await mockApi.getProducts()
        // Filter products with high ratings and reviews
        const bestSellers = allProducts.filter(product => 
          (product.rating && product.rating >= 4) || 
          (product.reviews_count && product.reviews_count >= 100) ||
          product.amazon_choice ||
          product.badge?.toLowerCase().includes("best") ||
          product.badge?.toLowerCase().includes("choice")
        )
        // If not enough high-rated products, include more
        const finalProducts = bestSellers.length > 10 ? bestSellers : allProducts.slice(0, 30)
        setProducts(finalProducts)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load best sellers",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    loadBestSellers()
  }, [])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "reviews":
        return (b.reviews_count || 0) - (a.reviews_count || 0)
      case "price-low":
        return a.final_price! - b.final_price!
      case "price-high":
        return b.final_price! - a.final_price!
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
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Trophy className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Best Sellers</h1>
        </div>
        <p className="text-yellow-100 text-lg">Top-rated products loved by customers</p>
        <p className="text-yellow-200 mt-2">{products.length} best-selling products</p>
        <div className="flex items-center space-x-2 mt-4 text-yellow-100">
          <TrendingUp className="h-4 w-4" />
          <span>Most popular and highly rated</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-col gap-y-4 lg:gap-y-0 lg:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Top Products</h2>
          <p className="text-gray-600">{sortedProducts.length} products found</p>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="lg:w-40 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
        {sortedProducts.map((product, index) => (
          <Card key={product.asin} className="group hover:shadow-lg transition-shadow relative border-2 border-yellow-200">
            <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex space-x-4"}>
              {/* Best Seller Badge */}
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-white z-10 flex items-center">
                <Trophy className="h-3 w-3 mr-1" />
                {index < 3 ? `#${index + 1}` : "BEST"}
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
                  {product.amazon_choice && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      Amazon's Choice
                    </Badge>
                  )}
                  {product.discount && (
                    <Badge className="absolute bottom-2 right-2 bg-red-500 text-white">
                      {product.discount} OFF
                    </Badge>
                  )}
                </div>
              </div>

              <div className={`${viewMode === "grid" ? "space-y-2" : "flex-1 space-y-2"}`}>
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-semibold hover:text-yellow-600 line-clamp-2">{product.title}</h3>
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
                  <span className="text-lg font-bold text-yellow-600">{formatPrice(product.final_price!)}</span>
                  {product.initial_price && product.final_price! < product.initial_price && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.initial_price)}</span>
                  )}
                </div>

                {product.amazon_choice && (
                  <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                    <Trophy className="h-3 w-3" />
                    <span>Amazon's Choice</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No best sellers available</h3>
          <p className="text-gray-500">Check back later for top-rated products!</p>
        </div>
      )}
    </div>
  )
} 