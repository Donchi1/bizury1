"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Star, ShoppingCart, Zap, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

export default function SalesPage() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([])
  const [dailyDeals, setDailyDeals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadSaleProducts = async () => {
      try {
        const products = await mockApi.getProducts()
        const flashSale = products.filter((p) => p.badge)
        const deals = products.filter((p) => p.amazon_choice && p.final_price! || 0 > (p.initial_price! || 0))

        setFlashSaleProducts(flashSale)
        setDailyDeals(deals.slice(0, 8))
      } catch (error) {
        console.error("Failed to load sale products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSaleProducts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1
        if (totalSeconds <= 0) return { hours: 23, minutes: 59, seconds: 59 }
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        return { hours: h, minutes: m, seconds: s }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const calculateDiscount = (original: number, sale: number) => {
    return Math.round(((original - sale) / original) * 100)
  }

  const pad = (n: number) => n.toString().padStart(2, "0")

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-gray-200 h-32 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-lg p-8 text-white mb-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">🔥 MEGA SALE 🔥</h1>
          <p className="text-xl text-white/90 mb-6">Unbeatable deals and flash sales - Limited time only!</p>
          <div className="flex items-center justify-center space-x-4">
            <Clock className="h-6 w-6" />
            <span className="text-lg">Sale ends in:</span>
            <div className="flex space-x-2 font-mono text-black">
              <div className="bg-white px-3 py-2 rounded">{pad(timeLeft.hours)}</div>
              <span className="text-white">:</span>
              <div className="bg-white px-3 py-2 rounded">{pad(timeLeft.minutes)}</div>
              <span className="text-white">:</span>
              <div className="bg-white px-3 py-2 rounded">{pad(timeLeft.seconds)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <h2 className="text-3xl font-bold">⚡ Flash Sale</h2>
              <p className="text-gray-600">Limited quantity - Act fast!</p>
            </div>
          </div>
          <Link href="/flash-sale">
            <Button variant="outline">View All Flash Sales</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map((product) => (
            <Card key={product.asin} className="group hover:shadow-lg transition-shadow border-red-200">
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
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    {product.discount}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                    {Math.floor(Math.random() * 20) + 5} left
                  </Badge>
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
                            i < Math.floor(product.rating! || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews_count})</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-red-600">
                        {formatPrice(product.initial_price || 0)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.final_price || 0)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Sold: {product.bought_past_month}</span>
                        <span>Available: {product.max_quantity_available}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>

                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => addItem(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Daily Deals Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingDown className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-3xl font-bold">Daily Deals</h2>
              <p className="text-gray-600">Best prices of the day</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dailyDeals.map((product) => (
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
                  {product.discount && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                      Save {product.discount}
                    </Badge>
                  )}
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
                            i < Math.floor(product.rating! || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews_count})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(product.final_price! || 0)}</span>
                    {product.initial_price && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.initial_price)}</span>
                    )}
                  </div>

                  <Button
                    className="w-full bg-orange-400 hover:bg-orange-500 text-black"
                    onClick={() => addItem(product)}
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

      {/* Categories on Sale */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Electronics", discount: "Up to 70% off", image: "/placeholder.svg?height=150&width=150" },
            { name: "Fashion", discount: "Up to 60% off", image: "/placeholder.svg?height=150&width=150" },
            { name: "Home & Garden", discount: "Up to 50% off", image: "/placeholder.svg?height=150&width=150" },
            { name: "Sports", discount: "Up to 40% off", image: "/placeholder.svg?height=150&width=150" },
            { name: "Books", discount: "Up to 30% off", image: "/placeholder.svg?height=150&width=150" },
            { name: "Health & Beauty", discount: "Up to 45% off", image: "/placeholder.svg?height=150&width=150" },
          ].map((category) => (
            <Link key={category.name} href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="relative h-20 w-20 mx-auto mb-3">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-red-600 font-medium">{category.discount}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
