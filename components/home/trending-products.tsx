"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await mockApi.getProducts()
        // Sort by view count to get trending products
        const trending = allProducts.sort((a, b) => b?.reviews_count! - a?.reviews_count!).slice(0, 6)
        setProducts(trending)
      } catch (error) {
        console.error("Failed to load trending products:", error)
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

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
          Trending Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="bg-gray-200 h-32 rounded mb-3"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
        Trending Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, index) => (
          <Card key={product.asin} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="relative mb-3">
                <Link href={`/product/${product.asin}`}>
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded group-hover:scale-105 transition-transform"
                  />
                </Link>
                <Badge className="absolute top-1 left-1 bg-green-500 text-white text-xs">#{index + 1}</Badge>
              </div>

              <div className="space-y-1">
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-medium text-xs line-clamp-2 hover:text-primary">{product.title}</h3>
                </Link>

                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-2 w-2 ${
                          i < Math.floor(product?.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews_count})</span>
                </div>

                <div className="flex items-center space-x-1">
                  {product.sponsered && product.final_price ? (
                    <>
                      <span className="text-sm font-bold text-red-600">{formatPrice(product.final_price)}</span>
                      <span className="text-xs text-gray-500 line-through">{formatPrice(product?.initial_price!)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product?.initial_price!)}</span>
                  )}
                </div>

                <div className="text-xs text-gray-500">{product?.reviews_count?.toLocaleString() || 0} views</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
