"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Clock, Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import { Product } from "@/lib/types"
import Link from "next/link"

/**
 * Mock flash-sale products.
 * Replace with real query once Supabase is connected.
 */

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const { addItem } = useCartStore()
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      const products = await mockApi.getProducts({ flash_sale: true })
      const filteredProducts = products.filter((product) => product.discount && product.max_quantity_available)
      const slicedProducts = filteredProducts?.sort((a, b) => b?.reviews_count! - a?.reviews_count!).slice(0, 8)
      setFlashSaleProducts(slicedProducts)
      setLoading(false)
    }
    fetchFlashSaleProducts()
  }, [])
  /* ------------------  Countdown timer  ------------------ */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1
        if (totalSeconds <= 0) return { hours: 0, minutes: 0, seconds: 0 }
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        return { hours: h, minutes: m, seconds: s }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  /* ------------------  Helpers  ------------------ */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)

  const pad = (n: number) => n.toString().padStart(2, "0")

  /* ------------------  Render  ------------------ */
  return (
    <section className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1">⚡ Flash Sale</h2>
          <p className="opacity-90">Limited-time offers – don’t miss out!</p>
        </div>

        <div className="flex items-center space-x-4">
          <Clock className="h-5 w-5" />
          <span className="text-sm">Ends in:</span>
          <div className="flex space-x-1 font-mono text-black">
            <span className="bg-white px-2 py-1 rounded">{pad(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-white px-2 py-1 rounded">{pad(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-white px-2 py-1 rounded">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {flashSaleProducts.map((product) => (
          <Link key={product.asin} href={`/product/${product.asin}`}>
          <Card  className="bg-white text-gray-900 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              {/* Image + badges */}
              <div className="relative">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover rounded"
                />
                <Badge className="absolute top-2 left-2 bg-red-600 text-white">{`${product.discount || 0}`}</Badge>
                <Badge className="absolute top-2 right-2 bg-orange-500 text-white">{`${product.max_quantity_available || 0} left`}</Badge>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(product?.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500">({product.reviews_count})</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">{formatPrice(product?.final_price!)}</span>
                <span className="text-sm text-gray-500 line-through">{formatPrice(product?.initial_price!)}</span>
              </div>

              {/* CTA */}
              <Button
                className="w-full  text-black"
                onClick={() =>
                  addItem({
                    id: product.asin,
                    name: product.title,
                    price: product.initial_price,
                    is_flash_sale: true,
                    flash_sale_price: product.final_price,
                    images: [product.image_url],
                    stock_quantity: product.max_quantity_available,
                    is_active: true,
                    is_featured: false,
                    rating: product.rating,
                    review_count: product.reviews_count,
                    view_count: 0,
                    sales_count: 0,
                    min_order_quantity: 1,
                    store_id: "",
                    slug: "",
                    created_at: "",
                    updated_at: "",
                  } as any)
                }
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
