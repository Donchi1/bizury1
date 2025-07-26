"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, Heart, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuthStore } from "@/lib/store/auth"
import { useCartStore } from "@/lib/store/cartStore"
import { useWishlistStore } from "@/lib/store/whiteListstore"



import {  signOut } from "@/lib/auth"
import { CartSidebar } from "./cart-sidebar"
import { usePathname, useRouter } from "next/navigation"
import { mockApi } from "@/lib/mock-data"
import { ScrollArea } from "../ui/scroll-area"
import { slugify } from "@/lib/utils"
import { Category } from "@/lib/types"


export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname.includes("/admin")
  const { user, profile, clearAuth } = useAuthStore()
  const { getTotalItems, setOpen } = useCartStore()
  const { getWishlistCount } = useWishlistStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryView, setCategoryView] = useState<"root" | "sub">("root")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await mockApi.getCategories() as Category[]
      setCategories(categories)
    }
    fetchCategories()
  }, [])



  const handleSignOut = async () => {
    await signOut()
    clearAuth()
    router.replace("/")
  }

  return (
    <>
      <header className={`${isAdmin && "hidden"} bg-[#232F3E] text-white`}>
        {/* Top bar */}
        <div className="border-b border-gray-600">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Deliver to New York 10001</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/help" className="hover:text-orange-400 hidden lg:inline">
                  Customer Service
                </Link>
                <Link href="/sell" className="hover:text-orange-400 hidden lg:inline">
                  Sell
                </Link>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:text-orange-400">
                        Hello, {profile?.full_name || "User"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist">Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/signin" className="hover:text-orange-400">
                      Sign In
                    </Link>
                    <span>|</span>
                    <Link href="/auth/signup" className="hover:text-orange-400">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center flex-col lg:flex-row lg:space-x-4 space-x-0">
            {/*Mobile*/}
            <div className="flex justify-between items-center w-full mb-3 lg:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-orange-400 text-black px-3 py-1 rounded font-bold text-xl">EC</div>
              <span className="text-xl font-bold hidden sm:block">ECommerce</span>
            </Link>
                          {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:text-orange-400 relative" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="hidden sm:inline ml-1">Wishlist</span>
                  {getWishlistCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 text-white text-xs">{getWishlistCount()}</Badge>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-orange-400 relative"
                onClick={() => setOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline ml-1">Cart</span>
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2  text-white">{getTotalItems()}</Badge>
                )}
              </Button>

              {/* Mobile menu */}
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={(open) => {
                  setIsMobileMenuOpen(open);
                  if (!open) {
                    setCategoryView("root");
                    setSelectedCategory(null);
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" className="sm:hidden text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Menu</SheetDescription>
                <SheetContent side="left" className="w-80">
                  <div className="py-4">
                    {categoryView === "root" ? (
                      <>
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              className="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-gray-100 text-left"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryView("sub");
                              }}
                            >
                              <span className="capitalize">{category.name}</span>
                              
                                <ChevronRight className="h-4 w-4 " color="black" />
                              
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mb-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryView("root")}
                            className="mr-2"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <h2 className="text-lg font-semibold capitalize">{selectedCategory?.name}</h2>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {selectedCategory &&
                            (selectedCategory[selectedCategory.name] as string[])?.map((sub: string) => (
                              <Link
                                key={sub}
                                href={{pathname:`/category/${selectedCategory.slug}`, query: {subcategory:slugify(sub)}}}
                                className="block py-2 px-3 rounded hover:bg-gray-100 capitalize"
                              >
                                {sub}
                              </Link>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            </div>
            {/* Logo */}
            <Link href="/" className="lg:flex items-center space-x-2 hidden">
              <div className="bg-primary text-black px-3 py-1 rounded font-bold text-xl">BZ</div>
              <span className="text-xl font-bold hidden sm:block">Bizury</span>
            </Link>

            {/* Search */}
            <div className="flex-1 w-full">
              <div className="flex">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-orange-400 rounded-r-none border-orange-400 focus:border-orange-400"
                  />
                </div>
                <Button className="bg-orange-400 hover:bg-orange-500 text-black rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="lg:flex items-center space-x-4 hidden">
              <Button variant="ghost" className="text-white hover:text-orange-400 relative" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="hidden sm:inline ml-1">Wishlist</span>
                  {getWishlistCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2  text-white text-xs">{getWishlistCount()}</Badge>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-orange-400 relative"
                onClick={() => setOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline ml-1">Cart</span>
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2  text-white">{getTotalItems()}</Badge>
                )}
              </Button>

              {/* Mobile menu */}
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={(open) => {
                  setIsMobileMenuOpen(open);
                  if (!open) {
                    setCategoryView("root");
                    setSelectedCategory(null);
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" className="sm:hidden text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Menu</SheetDescription>
                <SheetContent side="left" className="w-80">
                  <div className="py-4">
                    {categoryView === "root" ? (
                      <>
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              className="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-gray-100 text-left"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryView("sub");
                              }}
                            >
                              <span className="capitalize">{category.name}</span>
                            
                                <ChevronRight className="h-4 w-4" />
                              
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mb-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryView("root")}
                            className="mr-2"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <h2 className="text-lg font-semibold capitalize">{selectedCategory?.name}</h2>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {selectedCategory &&
                            (selectedCategory[selectedCategory.name] as string[])?.map((sub: string) => (
                              <Link
                                key={sub}
                                href={{pathname:`/category/${selectedCategory.slug}`,query: {subcategory: slugify(sub)}}}
                                className="block py-2 px-3 rounded hover:bg-gray-100 capitalize"
                              >
                                {sub}
                              </Link>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-[#37475A] border-t border-gray-600">
          <div className="container mx-auto px-0 lg:px-4">
            <div className="flex items-center space-x-6 py-2 text-sm">
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={(open) => {
                  setIsMobileMenuOpen(open);
                  if (!open) {
                    setCategoryView("root");
                    setSelectedCategory(null);
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-orange-400 sm:flex hidden">
                    <Menu className="h-4 w-4 mr-1" />
                    All Categories
                  </Button>
                </SheetTrigger>
                <SheetTitle className="sr-only">Categories</SheetTitle>
                <SheetDescription className="sr-only">categories</SheetDescription>
               <SheetContent side="left" className="w-full">
                  <div className="py-4">
                    {categoryView === "root" ? (
                      <>
                        <h2 className="text-lg font-semibold mb-4">Categories</h2>
                        <ScrollArea className="space-y-2 h-[90vh] w-full pr-4">
                         <div className="flex flex-col gap-4">
                          {categories.map((category) => (
                            <button
                              key={category.name}
                              className="flex items-center justify-between w-full py-2 px-3 rounded hover:bg-gray-100 text-left"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryView("sub");
                              }}
                            >
                              <span className="capitalize">{category.name}</span>
                            
                                <ChevronRight className="h-4 w-4" />
                              
                            </button>
                          ))}
                         </div>
                        </ScrollArea>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mb-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryView("root")}
                            className="mr-2"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          <h2 className="text-lg font-semibold capitalize">{selectedCategory?.name}</h2>
                        </div>
                       <ScrollArea className="space-y-2 h-[90vh] w-full pr-4">
                       <div className="flex flex-col gap-4">
                          {selectedCategory &&
                            (selectedCategory[selectedCategory.name] as string[])?.map((sub: string) => (
                              <Link
                               
                                key={sub}
                                href={{pathname: `/category/${selectedCategory.slug}`, query: {subcategory: slugify(sub)}}}
                                className="block py-2 px-3 rounded hover:bg-gray-100 capitalize"
                                //onClick={() => router.push(`/category/${selectedCategory.name}`)}
                              >
                                {sub}
                              </Link>
                            ))}
                       </div>
                        </ScrollArea>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
   
              <div className=" overflow-auto ">
              <div className="flex items-center space-x-6 pb-2 sm:pb-0">
                <Link href="/products" className="hover:text-orange-400 whitespace-pre">
                  All Products
                </Link>
                <Link href="/todays-deals" className="hover:text-orange-400 whitespace-pre">
                  Today's Deals
                </Link>
                <Link href="/flash-sale" className="hover:text-orange-400 whitespace-pre">
                  Flash Sale
                </Link>
                <Link href="/new-arrivals" className="hover:text-orange-400 whitespace-pre">
                  New Arrivals
                </Link>
                <Link href="/best-sellers" className="hover:text-orange-400 whitespace-pre">
                  Best Sellers
                </Link>
                <Link href="/stores" className="hover:text-orange-400 whitespace-pre">
                  Stores
                </Link>
              </div>
            </div>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar />
    </>
  )
}
