"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Package, Plus, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/store/auth"
import { useSellingStore } from "@/lib/store/sellingStore"
import { ButtonLoading, PageLoading } from "@/components/ui/loading"
import Image from "next/image"
import { Star } from "lucide-react"
import { Product } from "@/lib/types"
import Link from "next/link"

export default function ShopProductsPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { store,loading,  deleteProduct } = useSellingStore()

  useEffect(() => {
    if (profile?.role !== "merchant" && profile?.role !== "admin" && profile?.role !== "manager") {
      router.push("/dashboard")
      return
    }
    // if (profile?.id) {
    //   fetchStoreByUser(profile.id).finally(() => setLocalLoading(false))
    // } else {
    //   setLocalLoading(false)
    // }
  }, [profile, router])

  const handleDelete = async (asin: string | null) => {
    if (!asin) return;
    await deleteProduct(asin)
    setDeleteId(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  // if (localLoading) {
  //   return <PageLoading text="Loading store products..." />
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/shop")}> <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store</Button>
          <h1 className="text-2xl font-bold">Store Products</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale")}> <Plus className="h-4 w-4 mr-2" /> Add Products</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(store?.products as Product[])?.length > 0 ? (
          store?.products?.map((product) => (
            <Card key={product.asin} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className=" mb-4">

                  <Image
                    src={product.image_url ? product.image_url : "/placeholder.svg"}
                    alt={product.title || "Product image"}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.title || "Untitled Product"}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product?.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews_count})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.discount ? (
                      <>
                        <span className="text-lg font-bold text-red-600">{formatPrice(product?.final_price!)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product?.initial_price!)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">{formatPrice(product.initial_price ?? product.final_price ?? 0)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {setDeleteId(product.id as string)}}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Link href={`/product/${product.asin}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products added yet</p>
            <Button onClick={() => router.push("/dashboard/wholesale")}>Add Your First Product</Button>
          </div>
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={loading} onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" disabled={loading} onClick={() => handleDelete(deleteId!)}>
                 {loading ? <ButtonLoading text="Delete..." /> : "Delete"}
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Product Dialog */}

    </div>
  )
} 