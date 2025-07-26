"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Trash2, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/store/cartStore"
import { useAuthStore } from "@/lib/store/auth"
import { useBrowsingHistoryStore } from "@/lib/store/browsingHistoryStore"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List as ListIcon } from "lucide-react"
import InnerLoading from "@/components/layout/InnerLoading"

export default function BrowsingHistoryPage() {
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const { history, loading, error, fetchBrowsingHistory, removeFromHistory, clearHistory } = useBrowsingHistoryStore()
  const [sortBy, setSortBy] = useState("recent")
  const [filterCategory, setFilterCategory] = useState("all")
  const ITEMS_PER_PAGE = 8
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    (async () => {
      setLocalLoading(true)
      await fetchBrowsingHistory(user.id)
      setLocalLoading(false)
    })()
  }, [user?.id, fetchBrowsingHistory])

  const categories = [
    "all",
    ...Array.from(
      new Set(
        history
          .map((item) => item.product?.categories?.[0])
          .filter(Boolean)
          .map((cat) => cat!.toLowerCase())
      )
    )
  ]

  const filteredHistory = history.filter((item) => {
    if (filterCategory === "all") return true
    return (
      item.product?.categories?.[0]?.toLowerCase() === filterCategory.toLowerCase()
    )
  })

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.viewed_at).getTime() - new Date(b.viewed_at).getTime()
      case "price-high":
        return ((b.product?.final_price || b.product?.initial_price || 0) - (a.product?.final_price || a.product?.final_price || 0))
      case "price-low":
        return ((a.product?.final_price || a.product?.initial_price || 0) - (b.product?.final_price || b.product?.final_price || 0))
      case "views":
        return b.view_count - a.view_count
      default:
        return new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
    }
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleRemoveFromHistory = async (id: string) => {
    await removeFromHistory(id)
    toast.success("Removed from history")
  }

  const handleClearAllHistory = async () => {
    if (!user?.id) return
    await clearHistory(user.id)
    toast.success("Browsing history cleared")
  }

  const handleAddToCart = (item: typeof history[0]) => {
    if (!item.product) return
    addItem(item.product)
    toast.success("Added to cart", { description: `${item.product.title} has been added to your cart` })
  }

  const totalViews = history.reduce((sum, item) => sum + (item.view_count || 0), 0)
  const uniqueProducts = history.length
  const categoriesViewed = new Set(history.map((item) => item.product?.categories?.[0]).filter(Boolean)).size

  const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE)
  const paginatedHistory = sortedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (localLoading) return <InnerLoading/>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browsing History</h1>
          <p className="text-gray-600">Keep track of products you've viewed</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={v => v && setViewMode(v as 'list' | 'grid')}>
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
          {history.length > 0 && (
            <Button variant="outline" onClick={handleClearAllHistory} disabled={loading} className="ml-2">
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Clearing..." : "Clear All History"}
            </Button>
          )}
        </div>
      </div>

      {/* Browsing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{uniqueProducts}</div>
            <div className="text-sm text-gray-600">Products Viewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{categoriesViewed}</div>
            <div className="text-sm text-gray-600">Categories Explored</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category as string} value={category as string}>
                  {category === "all" ? "All Categories" : (category as string).charAt(0).toUpperCase() + (category as string).slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedHistory.map((item) => (
            <Card key={item.id} className={`flex flex-col h-full ${!item.product?.is_available ? "opacity-60" : ""}`}>
              <CardContent className="flex flex-col h-full p-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={item.product?.image_url || item.product?.images?.[0] || "/placeholder.svg"}
                      alt={item.product?.title || "Product"}
                      width={96}
                      height={96}
                      className="rounded-lg object-cover w-24 h-24"
                    />
                    {!item.product?.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="mb-1">
                    {item.product?.categories?.[0] || "Uncategorized"}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>Viewed {item.view_count} times</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base mb-1 line-clamp-2 min-h-[48px]">{item.product?.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      {item.product?.discount ? (
                        <>
                          <span className="text-lg font-bold text-red-600">{formatPrice(item.product.final_price || 0)}</span>
                          <span className="text-sm text-gray-500 line-through">{formatPrice(item.product?.initial_price || 0)}</span>
                          <Badge className="bg-red-500 text-white">{item.product.discount} OFF</Badge>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.product?.final_price || 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end mt-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.viewed_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button variant="outline" size="sm" asChild className="min-w-[90px]">
                        <Link href={item.product ? `/product/${item.product.asin}` : "#"}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {item.product?.is_available && (
                        <Button size="sm" onClick={() => handleAddToCart(item)} className="min-w-[90px]">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromHistory(item.id)} className="min-w-[40px]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedHistory.map((item) => (
            <Card key={item.id} className={`flex flex-col sm:flex-row items-center gap-4 p-4 ${!item.product?.is_available ? "opacity-60" : ""}`}>
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.product?.image_url || item.product?.images?.[0] || "/placeholder.svg"}
                  alt={item.product?.title || "Product"}
                  width={96}
                  height={96}
                  className="rounded-lg object-cover w-24 h-24"
                />
                {!item.product?.is_available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col sm:flex-row justify-between w-full gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.product?.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{item.product?.categories?.[0] || "Uncategorized"}</Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>Viewed {item.view_count} times</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    {item.product?.discount ? (
                      <>
                        <span className="text-lg font-bold text-red-600">{formatPrice(item.product.final_price || 0)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(item.product?.initial_price || 0)}</span>
                        <Badge className="bg-red-500 text-white">{item.product.discount} OFF</Badge>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{formatPrice(item.product?.final_price || 0)}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(item.viewed_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-end sm:items-center justify-end min-w-[180px]">
                  <Button variant="outline" size="sm" asChild className="min-w-[90px]">
                    <Link href={item.product ? `/product/${item.product.asin}` : "#"}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  {item.product?.is_available && (
                    <Button size="sm" onClick={() => handleAddToCart(item)} className="min-w-[90px]">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFromHistory(item.id)} className="min-w-[40px]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      {/* Empty State */}
      {paginatedHistory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No browsing history</h3>
            <p className="text-gray-500 mb-6">
              {filterCategory === "all"
                ? "Start browsing products to see your history here"
                : `No products viewed in ${filterCategory} category`}
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
