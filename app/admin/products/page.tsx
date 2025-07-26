"use client"

import { useState, useEffect } from "react"
import { MoreVertical, PlusCircle, Edit, Trash2, Download, Search, RefreshCw, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { ProductForm, ProductFormValues } from "@/components/admin/product/product-form"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import {
  useAdminProductsStore,
  getFilteredProducts,
  type ProductWithStore
} from "@/lib/store/admin/productsStore"
import Image from "next/image"
import InnerLoading from "@/components/layout/InnerLoading"
import { useAdminSellingStore } from "@/lib/store/admin/sellingsStore"
import { mockProducts } from "@/lib/mock-data"



export default function AdminProductsPage() {
  const {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProductsStore()
  const { sellingStores, fetchSellingStores } = useAdminSellingStore()
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [selectedMockProduct, setSelectedMockProduct] = useState<string>('')

  const [filteredProducts, setFilteredProducts] = useState<ProductWithStore[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithStore | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [productToView, setProductToView] = useState<ProductWithStore | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [localLoading, setLocalLoading] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    loadProducts()
  }, [fetchProducts, fetchSellingStores])


  const loadProducts = async () => {
    try {
      setLocalLoading(true)
      await fetchSellingStores() // Pass the admin user ID if needed
      await fetchProducts()
      setLocalLoading(false)
    } catch (error) {
      toast.error("Failed to load products")
    }
  }

  // Filter and sort products
  useEffect(() => {
    const filtered = getFilteredProducts(products, { search: searchTerm, category: categoryFilter, status: statusFilter })
    const sorted = [...filtered].sort((a, b) => {
      if (a.availability?.toLowerCase() === 'in stock' && b.is_available !== true) return -1
      if (a.is_available !== true && b.availability?.toLowerCase() !== 'in stock') return 1
      return (a.title || '').localeCompare(b.title || '')
    })

    setFilteredProducts(sorted)
    setCurrentPage(1)
  }, [products, searchTerm, categoryFilter, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedProducts?.map((p) => p.id!))
    }
  }

  const handleBulkAction = async (action: "out of stock" | "in stock" | "delete") => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected", {
        description: "Please select products to perform bulk actions.",
      })
      return
    }
    try {
     switch (action) {
      case "out of stock":
        selectedProducts.forEach(async (productId) => {
          await updateProduct(productId, { availability: "Out Of Stock" })
        })
        toast("Bulk Action Successful", {
          description: `Out of stock action applied to ${selectedProducts.length} products.`,
        })
        break;
      case "in stock":
        selectedProducts.forEach(async (productId) => {
          await updateProduct(productId, { availability: "In Stock" })
        })
        toast("Bulk Action Successful", {
          description: `In stock action applied to ${selectedProducts.length} products.`,
        })
        break;
      case "delete":
        selectedProducts.forEach(async (productId) => {
          await deleteProduct(productId)
        })
        toast("Bulk Action Successful", {
          description: `Delete action applied to ${selectedProducts.length} products.`,
        })
        break;
   
    }
    setSelectedProducts([])
    } catch (error: any) {
      toast.error("Error", {
        description: "Failed to perform bulk action.",
      })
    }
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Category,Store,Price,Stock,Status,Rating,Total Sales,Revenue,Created At\n" +
      filteredProducts.map(p =>
        `${p.id},"${p.title}",${p.categories?.[0]},${p.store?.name},${p.initial_price},${p.variations?.length},${p.availability},${p.rating},${p.bought_past_month},${p.brand},${p.created_at}`
      ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `products_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast("Export Successful", {
      description: "Products data has been exported to CSV.",
    })
  }

  const stats = {
    total: products.length,
    active: products.filter((p) => p.availability?.toLowerCase() === "in stock").length,
    outOfStock: products.filter((p) => p.availability?.toLowerCase() === "out of stock").length,
    totalRevenue: products.reduce((sum, p) => sum + (p?.initial_price! * p?.bought_past_month!), 0),
    categories: [...new Set(products.map((p) => p.categories?.[0]))].length,
    totalSales: products.reduce((sum, p) => sum + p.bought_past_month!, 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 whitespace-pre">In Stock</Badge>
      case "en stock":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 whitespace-pre">In Stock</Badge>
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: ProductWithStore) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleViewProduct = (product: ProductWithStore) => {
    setProductToView(product)
    setIsViewModalOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete)
      toast.success("Product Deleted", {
        description: `Product has been deleted.`,
      })
      setProductToDelete(null)
    }
  }

  const handleFormSubmit = async (data: ProductFormValues) => {
    if (!editingProduct) {

      if (!selectedStore) {
        toast.error("Please select a store")
        return
      }

      if (!selectedMockProduct) {
        toast.error("Please select a product")
        return
      }
    }



   

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, data)
        toast.success("Product updated successfully")
      } else {
        const mockProduct = mockProducts.find(p => p.asin === selectedMockProduct)
        if (!mockProduct) {
          toast.error("Invalid product selected")
          return
        }
        const productData = {
          ...mockProduct,
          store_id: selectedStore,
          // Add any additional fields needed
        }

        await createProduct(productData as any)
        toast.success("Product created successfully")
      }
      setIsFormOpen(false)
      setEditingProduct(null)
      setSelectedStore('')
      setSelectedMockProduct('')
    } catch (error) {
      toast.error(`Failed to ${editingProduct ? 'update' : 'create'} product`)
    }
  }

  if (localLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600">Manage all products in the catalog.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadProducts}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddProduct}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Products", value: stats.total, color: "text-gray-900", icon: "📦", desc: `${stats.active} active • ${stats.outOfStock} out of stock` },
          { label: "Active", value: stats.active, color: "text-green-600", icon: "✅", desc: `${stats.active} active` },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-red-600", icon: "❌", desc: `${stats.outOfStock} out of stock` },
          { label: "Categories", value: stats.categories, color: "text-blue-600", icon: "🏷️", desc: `${stats.categories} categories` },
          { label: "Total Sales", value: stats.totalSales.toLocaleString(), color: "text-purple-600", icon: "🛒", desc: `${stats.totalSales.toLocaleString()} sales` },
          { label: "Total Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`, color: "text-orange-600", icon: "💰", desc: `${stats.totalRevenue.toLocaleString()} revenue` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <span className="h-4 w-4 text-muted-foreground">{stat.icon}</span>
            </CardHeader>
            <CardContent >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              {/* <div className="text-sm text-gray-600">{stat.label}</div> */}
              <p className="text-xs text-muted-foreground">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...new Set(products.map((p) => p.categories?.[0]))].map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="out of stock">Out of Stock</SelectItem>
                {/* <SelectItem value="archived">Archived</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {selectedProducts.length} of {paginatedProducts.length} selected on this page.
            </p>
            {selectedProducts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("out of stock")}>Out of Stock</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("in stock")}>In Stock</DropdownMenuItem> 
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-500">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox checked={selectedProducts.includes(product?.id!)} onCheckedChange={() => handleSelectProduct(product?.id!)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Image src={product.image_url!} alt={product.title} width={50} height={50} />
                      <div>
                        <div className="font-medium">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500 ">
                          {product.categories?.[0]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.store.name}</TableCell>
                  <TableCell>{getStatusBadge(product?.availability!)}</TableCell>
                  <TableCell className="text-right">${product.initial_price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.variations?.length}</TableCell>
                  <TableCell className="text-right">{product.max_quantity_available || 0}</TableCell>
                  <TableCell className="text-right">${(product.bought_past_month! * product.initial_price! || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteProduct(product?.id!)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-{
                  Math.min(currentPage * itemsPerPage, filteredProducts.length)
                } of {filteredProducts.length} products
              </div>
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show current page and 2 pages before/after
                    let pageNum = currentPage - 2 + i;
                    if (currentPage <= 2) pageNum = i + 1;
                    if (currentPage >= totalPages - 1) pageNum = totalPages - 4 + i;

                    return pageNum > 0 && pageNum <= totalPages ? (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ) : null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? `Update the details for ${editingProduct?.title.slice(0, 20)}`
                : 'Fill in the details for a new product'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={{
              title: editingProduct?.title || '',
              initial_price: editingProduct?.initial_price || 0,
              sponsered: editingProduct?.sponsered || false,
              amazon_choice: editingProduct?.amazon_choice || false,
              availability: editingProduct?.availability || 'In Stock',
              max_quantity_available: editingProduct?.max_quantity_available || 0,
              description: editingProduct?.description || '',
            }}
            stores={sellingStores!}
            selectedStore={selectedStore}
            onStoreChange={(value) => setSelectedStore(value)}
            selectedProduct={selectedMockProduct}
            onProductChange={(value) => setSelectedMockProduct(value)}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isLoading}
            isEdit={!!editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
          {productToView && (
            <>
              <DialogHeader>
                <DialogTitle>{productToView.title?.slice(0, 50)}{productToView.title && productToView.title.length > 50 ? '...' : ''}</DialogTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(productToView.availability!)}
                  <span className="text-sm text-muted-foreground">
                    Created on {new Date(productToView.created_at).toLocaleDateString()}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {productToView.image_url && (
                  <div className="mx-auto max-w-xs">
                    <img
                      src={productToView.image_url}
                      alt={productToView.title?.slice(0, 20) || 'Product'}
                      className="rounded-lg border w-full h-auto"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                    <p>${productToView.initial_price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Stock</h4>
                    <p>{productToView.max_quantity_available || 0} units</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                    <p className="capitalize">{productToView.categories?.[0] || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Total Sales</h4>
                    <p>{productToView.bought_past_month || 0} units</p>
                  </div>
                </div>
                {productToView.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                    <p className="text-sm">{productToView.description}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleEditProduct(productToView)
                    setIsViewModalOpen(false)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 