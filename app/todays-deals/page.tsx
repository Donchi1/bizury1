"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function TodaysDealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("discount")
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const allProducts = await mockApi.getProducts()
        // Filter products with discounts or deals
        const dealsProducts = allProducts.filter(product => 
          product.discount || 
          product.final_price! < product.initial_price! ||
          product.sponsered
        )
        setProducts(dealsProducts)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load deals",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return (b.discount ? parseInt(b.discount) : 0) - (a.discount ? parseInt(a.discount) : 0)
      case "price-low":
        return a.final_price! - b.final_price!
      case "price-high":
        return b.final_price! - a.final_price!
      case "rating":
        return b.rating! - a.rating!
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
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Clock className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Today's Deals</h1>
        </div>
        <p className="text-red-100 text-lg">Limited time offers on amazing products</p>
        <p className="text-red-200 mt-2">{products.length} deals available</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-col gap-y-4 lg:gap-y-0 lg:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Deals & Discounts</h2>
          <p className="text-gray-600">{sortedProducts.length} deals found</p>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="lg:w-40 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Highest Discount</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
        {sortedProducts.map((product) => (
          <Card key={product.asin} className="group hover:shadow-lg transition-shadow relative">
            <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex space-x-4"}>
              {/* Discount Badge */}
              {product.discount && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white z-10 flex items-center">
                  <Percent className="h-3 w-3 mr-1" />
                  {product.discount} OFF
                </Badge>
              )}
              
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
                  {product.sponsered && (
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white">Flash Sale</Badge>
                  )}
                </div>
              </div>

              <div className={`${viewMode === "grid" ? "space-y-2" : "flex-1 space-y-2"}`}>
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-semibold hover:text-orange-500 line-clamp-2">{product.title}</h3>
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
                  <span className="text-lg font-bold text-red-600">{formatPrice(product.final_price!)}</span>
                  {product.initial_price && product.final_price! < product.initial_price && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.initial_price)}</span>
                  )}
                </div>

                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals available</h3>
          <p className="text-gray-500">Check back later for amazing deals!</p>
        </div>
      )}
    </div>
  )
} 