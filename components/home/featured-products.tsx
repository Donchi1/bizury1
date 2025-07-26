"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const featuredProducts = await mockApi.getProducts({ featured: true })
        const sortedProducts = featuredProducts.sort((a, b) => Number(b?.sponsered! || 0) - Number(a?.sponsered! || 0)).slice(0, 100)
        setProducts(sortedProducts)
      } catch (error) {
        console.error("Failed to load featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link href="/products" className="text-orange-500 hover:text-orange-600 font-medium">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.asin} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Link href={`/product/${product.asin}`}>
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform"
                  />
                </Link>
                {product.sponsered && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">Sponsored</Badge>
                )}
                {product?.final_price && product?.final_price > product?.initial_price! && (
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    Save {Math.round(((product?.final_price! - product?.initial_price!) / product?.final_price!) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-orange-500">{product.title}</h3>
                </Link>

                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product?.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews_count})</span>
                </div>

                <div className="flex items-center space-x-2">
                  {product.sponsered && product.final_price ? (
                    <>
                      <span className="text-lg font-bold text-red-600">{formatPrice(product?.final_price!)}</span>
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product?.initial_price!)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">{formatPrice(product?.initial_price!)}</span>
                  )}
                </div>

                <Button
                  className="w-full  text-black"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
