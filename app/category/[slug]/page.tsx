"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product, Category } from "@/lib/types"
import { toast } from "sonner"
import { slugify, unslugify } from "@/lib/utils"

export default function CategoryPage() {
  const params = useParams()
  const subCategory = useSearchParams().get("subcategory")
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const { addItem } = useCartStore()


  useEffect(() => {
    const loadData = async () => {

      try {
        const [categoriesData, productsData] = await Promise.all([mockApi.getCategories(), mockApi.getProducts()])

        const foundCategory = categoriesData.find((c) => slugify(c.name) === (params.slug as string))

        setCategory(foundCategory || null)

        if (foundCategory) {
          const categoryProducts = productsData.filter((p) => {
            const formattedCats =  p.categories?.map(slugify)
            
            return formattedCats?.includes(foundCategory.slug as string) || formattedCats?.includes(params.slug as string) || formattedCats?.includes(subCategory || "")

          }
          )
          setProducts(categoryProducts)
        }
      } catch (error: any) {
        toast.error(error ? error.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.slug])


  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a?.final_price! - b?.final_price!
      case "price-high":
        return b?.initial_price! - a?.initial_price!
      case "rating":
        return b?.rating! - a?.rating!
      case "newest":
        return new Date(b?.date_first_available!).getTime() - new Date(a?.date_first_available!).getTime()
      default:
        return b?.sponsered ? 1 : -1
    }
  })

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

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-6">
          {category.image_url && (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20">
              <Image
                src={category.image_url as string || "/placeholder.svg"}
                alt={category.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold mb-2">{category.name?.charAt(0)?.toUpperCase()+category?.name?.slice(1)}</h1>
            <p className="text-orange-100 text-lg">{category.description}</p>
            <p className="text-orange-200 mt-2">{products.length} products available</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-col gap-y-4 lg:gap-y-0 lg:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Products in {category.name}</h2>
          <p className="text-gray-600">{sortedProducts.length} products found</p>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="lg:w-40 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
        {sortedProducts.map((product) => (
          <Card key={product?.asin} className="group hover:shadow-lg transition-shadow">
            <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex space-x-4"}>
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
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">Flash Sale</Badge>
                  )}
                </div>
              </div>

              <div className={`${viewMode === "grid" ? "space-y-2" : "flex-1 space-y-2"}`}>
                <Link href={`/product/${product.asin}`}>
                  <h3 className="font-semibold hover:text-orange-500 line-clamp-2">{product.title}</h3>
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
                    <span className="text-lg font-bold text-gray-900">{formatPrice(product?.final_price!)}</span>
                  )}
                </div>

                {viewMode === "list" && (
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                )}

                <Button
                  className="w-full bg-orange-400 hover:bg-orange-500 text-black"
                  onClick={() => handleAddToCart(product)}
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
          <p className="text-gray-500 text-lg">No products found in this category.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
