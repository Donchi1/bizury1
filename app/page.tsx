import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { FlashSale } from "@/components/home/flash-sale"
import { FeaturedProducts } from "@/components/home/featured-products"
import { TrendingProducts } from "@/components/home/trending-products"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="container mx-auto ">
      <HeroSection />
      <div className=" px-4 py-12 space-y-8">
        {/* <FeaturedCategories /> */}
        <FlashSale />
        <FeaturedProducts />
        <TrendingProducts />
        
        {/* CTA Section */}
        <div className="py-12">
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold mb-4">Discover Our Complete Collection</h2>
                <p className="text-lg mb-6 text-orange-100">
                  Explore thousands of products across all categories. From electronics to fashion, 
                  home & garden to sports, find everything you need in one place.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                >
                  <Link href="/products" className="flex items-center space-x-2">
                    <span>Browse All Products</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </section>
    </div>
  )
}
