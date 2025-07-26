"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Plus,
  Package,
  DollarSign,
  Star,
  ShoppingCart,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product as RealProduct, Store } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/store/auth"
import { PageLoading, ButtonLoading } from "@/components/ui/loading"
import { mockApi, mockProducts } from "@/lib/mock-data"
import Link from "next/link"
import { useSellingStore } from "@/lib/store/sellingStore"
import { toast } from "sonner"

type Product = RealProduct

interface FilterState {
  category: string
  priceRange: string
  brand: string
  inStock: boolean
  sortBy: string
}

export default function WholesaleCenterPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { addProduct,store } = useSellingStore()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [addingToStore, setAddingToStore] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    category: "",
    priceRange: "",
    brand: "",
    inStock: false,
    sortBy: "name"
  })


  const categories = ["All", ...new Set(mockProducts.map(p => p.categories?.[0]))]
  const brands = ["All", ...new Set(mockProducts.map(p => p.brand))]
  const priceRanges = ["All", "Under $50", "$50 - $100", "$100 - $200", "$200 - $500", "Over $500"]

  useEffect(() => {
    // Check if user is a merchant
    if (profile?.role !== "merchant" && profile?.role !== "admin" && profile?.role !== "manager") {
      router.push("/dashboard")
      return
    }
    // Fetch real products from mockApi
    const loadProducts = async () => {
      setLoading(true)
      try {
        if (!store) {
          toast.error("Failed, you don't have a store")
          setLoading(false)
          return
        }
        setSelectedProducts(new Set(store?.products?.map(p => p.asin!)))
        const realProducts = await mockApi.getProducts()
        setProducts(realProducts as Product[])
        setFilteredProducts(realProducts as Product[])
        setLoading(false)
      } catch (error) {
        toast.error("Failed to fetch products")
        setLoading(false)
      }
    }

    loadProducts()
  }, [profile, router])

  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter(product => product.categories?.[0].toLowerCase() === filters.category.toLowerCase())
    }

    // Brand filter
    if (filters.brand && filters.brand !== "All") {
      filtered = filtered.filter(product => product.brand === filters.brand)
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== "All") {
      switch (filters.priceRange) {
        case "Under $50":
          filtered = filtered.filter(product => product?.final_price! < 50)
          break
        case "$50 - $100":
          filtered = filtered.filter(product => product?.final_price! >= 50 && product?.final_price! <= 100)
          break
        case "$100 - $200":
          filtered = filtered.filter(product => product?.final_price! >= 100 && product?.final_price! <= 200)
          break
        case "$200 - $500":
          filtered = filtered.filter(product => product?.final_price! >= 200 && product?.final_price! <= 500)
          break
        case "Over $500":
          filtered = filtered.filter(product => product?.final_price! > 500)
          break
      }
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product?.max_quantity_available! > 0)
    }

    // Sort
    switch (filters.sortBy) {
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "price-low":
        filtered.sort((a, b) => a?.final_price! - b?.final_price!)
        break
      case "price-high":
        filtered.sort((a, b) => b?.final_price || 0 - a?.final_price! || 0)
        break
      case "rating":
        filtered.sort((a, b) => b.rating! || 0 - a.rating! || 0)
        break
      case "stock":
        filtered.sort((a, b) => b?.max_quantity_available! - a?.max_quantity_available!)
        break
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [products, searchQuery, filters])

  const handleAddToStore = async (product: Product) => {
    setAddingToStore(product?.asin!)
    try {
      // Simulate API call to add product to store
      await addProduct(product, (store as Store).id!)

      // Add to selected products
      setSelectedProducts(prev => new Set([...prev, product.asin!]))
      toast.success("Product added to store")
    } catch (error: any) {
      toast.error("Failed to add product to store")
    } finally {
      setAddingToStore(null)
    }
  }

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  if (loading) {
    return <PageLoading text="Loading wholesale products..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wholesale Center</h1>
          <p className="text-muted-foreground">
            Browse and add products to your store inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div>
              <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand!}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Sort
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: "name" }))}>
                    Name A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: "price-low" }))}>
                    Price Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: "price-high" }))}>
                    Price High to Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: "rating" }))}>
                    Highest Rated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, sortBy: "stock" }))}>
                    Most Stock
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">In Stock Only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {selectedProducts.size > 0 && (
          <Badge variant="secondary">
            {selectedProducts.size} selected for store
          </Badge>
        )}
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <Card key={product.asin} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted relative">
                <img
                  src={product.image_url || product.images?.[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {selectedProducts.has(product?.asin!) && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600">Added to Store</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
                    <Badge variant="outline" className="text-xs">{product.brand || "-"}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description || ""}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews_count})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-green-600">${product.final_price ?? 0}</p>
                      <p className="text-xs text-muted-foreground line-through">${product.initial_price ?? 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Min: 1</p>
                      <p className="text-xs text-muted-foreground">Stock: {product.max_quantity_available ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToStore(product)}
                      disabled={addingToStore === product.asin || selectedProducts.has(product.asin!)}
                    >
                      {addingToStore === product.asin ? (
                        <ButtonLoading text="Adding..." />
                      ) : selectedProducts.has(product.asin!) ? (
                        "Added to Store"
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Store
                        </>
                      )}
                    </Button>
                    <Button size="sm" asChild variant="outline">
                      <Link href={`/product/${product.asin}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProducts.map((product) => (
            <Card key={product.asin}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image_url || product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">{product.description || ""}</p>
                      </div>
                      <Badge variant="outline">{product.brand || "-"}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviews_count})</span>
                      </div>
                      <span className="text-muted-foreground">Min Order: 1</span>
                      <span className="text-muted-foreground">Stock: {product.max_quantity_available ?? 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-green-600">${product.final_price ?? 0}</p>
                        <p className="text-sm text-muted-foreground line-through">${product.initial_price ?? 0}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToStore(product!)}
                          disabled={addingToStore === product?.asin || selectedProducts.has(product?.asin!)}
                        >
                          {addingToStore === product.asin ? (
                            <ButtonLoading text="Adding..." />
                          ) : selectedProducts.has(product?.asin!) ? (
                            "Added to Store"
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Store
                            </>
                          )}
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/products/${product.asin}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {totalPages <= 7 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))
          ) : (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              {currentPage > 4 && <span className="px-2">...</span>}
              {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                .filter((page: number) => page > 1 && page < totalPages)
                .map((page: number) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              {currentPage < totalPages - 3 && <span className="px-2">...</span>}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Selected Products Summary */}
      {selectedProducts.size > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">
                  {selectedProducts.size} products selected for your store
                </h3>
                <p className="text-sm text-green-600">
                  These products will be added to your store inventory
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Manage Store Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 