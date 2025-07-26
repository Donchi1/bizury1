"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useCartStore } from "@/lib/store/cartStore"
import { useWishlistStore } from "@/lib/store/whiteListstore"
import { useBrowsingHistoryStore } from "@/lib/store/browsingHistoryStore"
import { useAuthStore } from "@/lib/store/auth"
import { mockApi } from "@/lib/mock-data"
import type { Product as AmazonProduct } from "@/lib/types"
import { TableBody, TableCell, TableHead, TableHeader, TableRow , Table} from "@/components/ui/table"
import { slugify } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<AmazonProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [mousePercent, setMousePercent] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { user } = useAuthStore ? useAuthStore() : { user: null };
  const { addToHistory } = useBrowsingHistoryStore();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await mockApi.getProducts()
        const foundProduct = products.find((p) => p.asin === params.slug)
        setProduct(foundProduct || null)
        // Add to browsing history if user and product exist
        
        if (user?.id && foundProduct) {
          addToHistory(user.id, foundProduct)
        }
      } catch (error: any) {
        toast.error("Error", {description: error?.message || "Something went wrong"})
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.slug, user?.id])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate percentage position within the image
    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100

    // Store mouse percentage for positioning the small mirror
    setMousePercent({ x: percentX, y: percentY })

    // Calculate zoom position for accurate magnification
    // For 400% background size, we need to center the cursor in the zoomed view
    // The background position should be: cursor position * 3 - 150 (to center it)
    const zoomX = Math.max(0, Math.min(300, percentX * 3 - 150))
    const zoomY = Math.max(0, Math.min(300, percentY * 3 - 150))

    setZoomPosition({ x: zoomX, y: zoomY })
  }

  const handleMouseEnter = () => {
    setShowZoom(true)
  }

  const handleMouseLeave = () => {
    setShowZoom(false)
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isInWishlist(product.asin!)) {
      removeFromWishlist(product.asin!)
      toast.success("Removed from wishlist",{
        description: `${product.title} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast.success("Added to wishlist",{
        description: `${product.title} has been added to your wishlist.`,
      })
    }
  }

  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.title,
      text: `Check out this product: ${product.title}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success("Shared successfully",{
          description: "Product has been shared.",
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied",{
          description: "Product link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied",{
          description: "Product link has been copied to clipboard.",
        })
      } catch (clipboardError) {
        toast.error("Share failed",{
          description: "Unable to share or copy link. Please try again.",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-200 h-96 rounded" />
            <div className="flex flex-col space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 w-20 rounded" />
              ))}
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-200 h-8 rounded" />
            <div className="bg-gray-200 h-4 rounded" />
            <div className="bg-gray-200 h-6 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  // Amazon color palette
  const amazonOrange = "#FF9900"
  const amazonBlue = "#007185"
  const amazonGray = "#555"

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency || "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const currentPrice = product.final_price || product.initial_price!
  const originalPrice = product.initial_price && product.final_price && product.final_price < product.initial_price ? product.initial_price : null

  // Delivery info
  const delivery = product.delivery?.[0] || "FREE delivery available."

  // Seller info
  const seller = product.buybox_seller || product.seller_name || product.manufacturer || "Amazon Seller"

  // Features
  const features = product.features || []

  // Badges
  const badge = product.badge || (product.amazon_choice ? "Amazon's Choice" : null)

  // Stock
  const inStock = product.is_available !== false && product.availability?.toLowerCase().includes("in stock")

  // Images
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url || "/placeholder.svg"]

  // Videos
  const videos = product.videos || []

  // Breadcrumbs
  const breadcrumbs = product.categories || []

  // Manufacturer info
  const manufacturer = product.manufacturer || product.brand

  // Tags
  const tags = [
    ...(product.badge ? [product.badge] : []),
    ...(product.amazon_choice ? ["Amazon's Choice"] : []),
    ...(product.sponsered ? ["Sponsored"] : []),
    ...(product.climate_pledge_friendly ? ["Climate Pledge Friendly"] : []),
  ]

  const isWishlisted = isInWishlist(product.asin!)

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-2  mt-4 text-xs text-gray-600 flex items-center space-x-1 overflow-x-auto">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        {breadcrumbs.map((cat, i) => (
          <span key={cat + i} className="flex items-center">
            <ChevronRight className="h-3 w-3 mx-1" />
            <Link 
              href={i === 0 
                ? `/category/${slugify(cat)}` 
                : `/category/${slugify(breadcrumbs[0])}?subcategory=${slugify(cat)}`
              } 
              className="hover:text-orange-500 capitalize"
            >
              {cat}
            </Link>
          </span>
        ))}
      </nav>

      {/* Main Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Images & Videos */}
          <div className="lg:col-span-4">
            <div className="flex gap-4 ">
              <div className="flex flex-col space-y-2  overflow-y-auto">
                {images.map((img, idx) => (
                  <div
                    key={img + idx}
                    onMouseEnter={() => setSelectedImage(idx)}
                    className={`size-10 rounded-lg block  border-2 ${selectedImage === idx ? "border-orange-500" : "border-gray-200"} overflow-hidden bg-white`}
                  >
                    <Image src={img || "/placeholder.svg"} alt={product.title + " " + (idx + 1)} width={700} height={700} className="object-contain size-full" />
                  </div>
                ))}
              </div>
              {/* Image Gallery with Custom Zoom */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group" style={{ minHeight: 350, maxWidth: 400 }}>
                <div
                  ref={imageRef}
                  className="relative w-full h-full cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    src={images[selectedImage] || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-contain"
                    priority
                  />
                  {/* Small Mirror on Main Image */}
                  {showZoom && (
                    <div 
                      className="absolute w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg pointer-events-none z-20"
                      style={{
                        left: `${Math.max(16, Math.min(84, mousePercent.x))}%`,
                        top: `${Math.max(16, Math.min(84, mousePercent.y))}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${images[selectedImage] || "/placeholder.svg"})`,
                          backgroundSize: '400% 400%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>
                  )}
                  {badge && (
                    <Badge className="absolute top-4 left-4 bg-yellow-400 text-black font-bold text-xs px-2 py-1 rounded shadow z-10">{badge}</Badge>
                  )}
                  {product.discount && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white font-bold text-xs px-2 py-1 rounded shadow z-10">Save {product.discount}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info with Large Zoom Overlay */}
          <div className="lg:col-span-5 space-y-4 relative">
            {/* Large Zoom Overlay covering Product Info */}
            {showZoom && (
              <div className="absolute inset-0 bg-white border border-gray-200 rounded-lg overflow-hidden z-20 pointer-events-none">
                <div 
                  className="w-full h-full relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${images[selectedImage] || "/placeholder.svg"})`,
                    backgroundSize: '400% 400%',
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.title}</h1>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Brand:</span>
              <span className="text-sm text-blue-700 font-medium">{product.brand}</span>
              {product.model_number && <span className="text-xs text-gray-400 ml-2">Model: {product.model_number}</span>}
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-xs text-blue-700 ml-1 cursor-pointer hover:underline">{product.reviews_count ?? 0} ratings</span>
              </div>
              {product.answered_questions !== undefined && (
                <span className="text-xs text-blue-700 ml-2 cursor-pointer hover:underline">{product.answered_questions} answered questions</span>
              )}
              {product.sponsered && <Badge className="bg-orange-400 text-black ml-2">Sponsored</Badge>}
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl font-bold text-red-600">{formatPrice(currentPrice!)}</span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through">{formatPrice(originalPrice)}</span>
              )}
              {product.discount && <span className="text-green-600 font-semibold">{product.discount} off</span>}
            </div>
            <div className="flex items-center space-x-2 mb-2">
              {inStock ? (
                <span className="flex items-center text-green-600 font-medium"><CheckCircle2 className="h-4 w-4 mr-1" /> In Stock</span>
              ) : (
                <span className="flex items-center text-red-600 font-medium"><XCircle className="h-4 w-4 mr-1" /> Out of Stock</span>
              )}
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-700">Sold by </span>
              <Link href={product.seller_url || "#"} className="text-blue-700 hover:underline text-sm font-medium">{seller}</Link>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-700">Delivery: </span>
              <span className="text-sm text-green-700 font-medium">{delivery}</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-4">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-gray-500">ASIN: {product.asin}</span>
              {product.date_first_available && <span className="text-xs text-gray-500 ml-2">First Available: {product.date_first_available}</span>}
            </div>
            <div className="text-xs text-gray-500">Category: {breadcrumbs.join(" > ")}</div>
            <div className="text-xs text-gray-500">Manufacturer: {manufacturer}</div>
            {product.climate_pledge_friendly && (
              <div className="text-xs text-green-700 font-medium mt-2">Climate Pledge Friendly</div>
            )}
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-3">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm sticky top-24 max-w-xs mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl font-bold text-red-600">{formatPrice(currentPrice!)}</span>
                {originalPrice && (
                  <span className="text-base text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                )}
                {product.discount && <span className="text-green-600 font-semibold">{product.discount} off</span>}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {inStock ? (
                  <span className="flex items-center text-green-600 font-medium"><CheckCircle2 className="h-4 w-4 mr-1" /> In Stock</span>
                ) : (
                  <span className="flex items-center text-red-600 font-medium"><XCircle className="h-4 w-4 mr-1" /> Out of Stock</span>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    disabled={!inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full bg-orange-400 hover:bg-orange-500 text-black mb-2"
                onClick={() => addItem(product, quantity)}
                disabled={!inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black mb-2"
                onClick={() => addItem(product, quantity)}
                disabled={!inStock}
              >
                Buy Now
              </Button>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={isWishlisted ? "text-red-500 border-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                  <span className="ml-2">{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="ml-2">Share</span>
                </Button>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <div>Ships from: <span className="text-gray-700">{product.ships_from || "Amazon"}</span></div>
                <div>Sold by: <span className="text-gray-700">{seller}</span></div>
                {product.return_policy && <div>Return Policy: <span className="text-gray-700">{product.return_policy}</span></div>}
                {/* Warranty info not available in AmazonProduct type */}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full lg:grid-cols-4 grid-cols-2 gap-y-2 lg:gap-y-0 lg:h-auto h-full">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews_count ?? 0})</TabsTrigger>
              <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>{product.description || "No description available."}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">General</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ASIN:</dt>
                          <dd>{product.asin}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Brand:</dt>
                          <dd>{product.brand}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Model:</dt>
                          <dd>{product.model_number || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Weight/Dimensions:</dt>
                          <dd>{product.item_weight || product.product_dimensions || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">First Available:</dt>
                          <dd>{product.date_first_available || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Manufacturer:</dt>
                          <dd>{manufacturer}</dd>
                        </div>
                        {product.department && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Department:</dt>
                            <dd>{product.department}</dd>
                          </div>
                        )}
                        {product.country_of_origin && (
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Country of Origin:</dt>
                            <dd>{product.country_of_origin}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{product.rating ?? 0}</div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.round(product.rating ?? 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{product.reviews_count ?? 0} reviews</p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-8">{rating}★</span>
                            <Progress value={rating === 5 ? 70 : rating === 4 ? 20 : 5} className="flex-1" />
                            <span className="text-sm text-gray-600 w-8">
                              {rating === 5 ? "70%" : rating === 4 ? "20%" : "5%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Individual Reviews - Placeholder */}
                <div className="text-center text-gray-500">No reviews yet.</div>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p>No questions have been asked about this product yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Video Thumbnails */}
        {videos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Product Videos</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {videos.map((video, idx) => (
                <div key={video + idx} className="flex-shrink-0">
                  <video
                    src={video}
                    controls
                    poster={images[0]}
                    className="w-80 h-60 rounded-lg border border-gray-200 shadow-lg bg-black"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amazon Mirror Product View */}
        {product.from_the_brand && product.from_the_brand.length > 0 && (
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-6">From the Brand</h2>
            <div className="flex overflow-x-auto gap-6">
              {product.from_the_brand.map((img, i) => (
                <img key={i} src={img} alt="Brand" className="h-56 rounded shadow-lg" />
              ))}
            </div>
          </section>
        )}

        {product.product_description && product.product_description.length > 0 && (
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-6">Product Description</h2>
            <div className="flex flex-col gap-8 size-[55%] mx-auto">
              {product.product_description.map((desc, i) =>
                desc.type === "image" ? (
                  <Image width={700} height={700} key={i} src={desc.url} alt="Product Description" className="w-full h-full object-contain mx-auto " />
                ) : null
              )}
            </div>
          </section>
        )}

        {product.variations && product.variations.length > 1 && (
          <section className="my-16">
            <h2 className="text-2xl font-bold mb-6">Compare with Similar Items</h2>
            <div >
              <Table>
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                  <TableRow>
                    <TableHead >Variation</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Currency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variations.map((v, i) => (
                    <TableRow key={i}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell className="font-medium">{v.price}</TableCell>
                      <TableCell>{v.size}</TableCell>
                      <TableCell>{v.color}</TableCell>
                      <TableCell className="text-right">{v.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </div>
          </section>
        )}
      </div>
    </>
  )
}
