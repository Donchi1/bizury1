"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Filter, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/store/cartStore"
import { mockApi } from "@/lib/mock-data"
import type { Product, Category } from "@/lib/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams()
  const { addItem } = useCartStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([mockApi.getProducts(), mockApi.getCategories()])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, priceRange, sortBy])

  // Maintain focus on search input after re-renders
  useEffect(() => {
    if (searchInputRef.current && document.activeElement === searchInputRef.current) {
      const cursorPosition = searchInputRef.current.selectionStart || 0
      searchInputRef.current.focus()
      searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  })

  // Memoize filtered products to prevent unnecessary re-renders
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => product.categories?.map(each => each.toLowerCase())?.includes(cat))
    const matchesPrice = (product?.final_price || product?.initial_price || 0) >= priceRange[0] && 
      (product?.final_price || product?.initial_price || 0) <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a?.final_price || a?.initial_price || 0) - (b?.final_price || b?.initial_price || 0)
      case "price-high":
        return (b?.final_price || b?.initial_price || 0) - (a?.final_price || a?.initial_price || 0)
      case "rating":
        return (b?.rating || 0) - (a?.rating || 0)
      case "newest":
        return new Date(b?.date_first_available || Date.now()).getTime() - new Date(a?.date_first_available || Date.now()).getTime()
      default:
        return (b?.badge === "Amazon's Choice" || b?.amazon_choice ? 1 : -1)
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSortBy("featured")
    setCurrentPage(1)
  }



  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold mb-3">Search</h3>
        <Input 
          ref={searchInputRef}
          placeholder="Search products..." 
          value={searchQuery} 
          type="search"
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="border-primary border ring-0 outline-none focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none  focus:border-primary/90"
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2 max-h-[90vh] overflow-y-auto">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <Checkbox
                id={category.name}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.name])
                  } else {
                    setSelectedCategories(selectedCategories.filter((id) => id !== category.name))
                  }
                }}
              />
              <label htmlFor={category.name} className="text-sm cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider 
            value={priceRange} 
            onValueChange={setPriceRange} 
            max={1000} 
            step={10} 
            className="w-full" 
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchQuery || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
        <Button 
          variant="outline" 
          onClick={clearAllFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  const Pagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getPageNumbers().map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            disabled={page === '...'}
            className={page === '...' ? 'cursor-default' : ''}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filters - Sticky */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FilterSidebar />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Header */}
          <div className="flex items-center flex-col md:flex-row justify-between mb-6">
            <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto">
              <h1 className="text-2xl font-bold">All Products</h1>
              <p className="text-gray-600">
                {sortedProducts.length} products found
                {currentPage > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild >
                  <Button variant="outline" className="md:hidden w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Filter products by your preferences</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
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

              {/* View Mode */}
              <div className="border rounded-lg w-full lg:w-auto hidden md:flex">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {currentProducts.map((product) => (
              <Card key={product.asin} className="group hover:shadow-lg transition-shadow">
                <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex space-x-4"}>
                  <div className={viewMode === "grid" ? "space-y-4" : "flex-shrink-0"}>
                    <div className={`relative ${viewMode === "grid" ? "h-48" : "h-24 w-24"}`}>
                      <Link href={`/product/${product.asin}`}>
                        <Image
                          src={product.images?.[0] || "/placeholder.svg"}
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
                              i < Math.floor(product?.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews_count || 0})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {product.sponsered && product.final_price ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(product.final_price)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product?.initial_price || 0)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product?.initial_price || 0)}</span>
                      )}
                    </div>

                    {viewMode === "list" && (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}

                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination />

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
