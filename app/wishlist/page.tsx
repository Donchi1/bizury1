"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { useWishlistStore } from "@/lib/store/whiteListstore"
import { toast } from "@/hooks/use-toast"
import type { Product as AmazonProduct } from "@/lib/types"

export default function WishlistPage() {
  const [sortBy, setSortBy] = useState("newest")
  const { addItem } = useCartStore()
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlistStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = (product: AmazonProduct) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const handleRemoveFromWishlist = (productId: string) => {
    const product = wishlistItems.find(item => item.product_id === productId)?.product
    removeFromWishlist(productId)
    toast({
      title: "Removed from wishlist",
      description: product ? `${product.title} has been removed from your wishlist.` : "Item removed from wishlist.",
    })
  }

  const handleClearWishlist = () => {
    clearWishlist()
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    })
  }

  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      addItem(item.product)
    })
    toast({
      title: "Added all to cart",
      description: `${wishlistItems.length} items have been added to your cart.`,
    })
  }

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.product.final_price || a.product.initial_price || 0) - (b.product.final_price || b.product.initial_price || 0)
      case "price-high":
        return (b.product.final_price || b.product.initial_price || 0) - (a.product.final_price || a.product.initial_price || 0)
      case "name":
        return a.product.title.localeCompare(b.product.title)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon on any product</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-4">
          <Heart className="h-12 w-12 fill-current" />
          <div>
            <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
            <p className="text-pink-100 text-lg">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Saved Items</h2>
          <p className="text-gray-600">Items you've added to your wishlist</p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          const product = item.product
          const currentPrice = product.final_price || product.initial_price!
          const originalPrice = product.initial_price && product.final_price && product.final_price < product.initial_price ? product.initial_price : null
          const inStock = product.is_available !== false
          
          return (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Link href={`/product/${product.asin}`}>
                    <Image
                      src={product.images?.[0] || product.image_url || "/placeholder.svg"}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  {product.badge && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">{product.badge}</Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Link href={`/product/${product.asin}`}>
                    <h3 className="font-semibold hover:text-orange-500 line-clamp-2">{product.title}</h3>
                  </Link>

                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews_count || 0})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {originalPrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">{formatPrice(currentPrice)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{formatPrice(currentPrice)}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 bg-orange-400 hover:bg-orange-500 text-black"
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleRemoveFromWishlist(item.product_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {!inStock && <p className="text-sm text-red-600">Out of stock</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={handleAddAllToCart}
        >
          Add All to Cart
        </Button>
        <Button variant="outline" onClick={handleClearWishlist}>
          Clear Wishlist
        </Button>
      </div>
    </div>
  )
}
