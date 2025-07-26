"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  DollarSign, 
  Truck, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { slugify } from "@/lib/utils"
import { mockApi } from "@/lib/mock-data"
import type { Category } from "@/lib/types"
import Link from "next/link"

export default function WholesalePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await mockApi.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const wholesaleCategories = categories.slice(0, 8).map((category) => ({
    id: category.slug,
    name: category.name,
    description: `${category.itemsCount} products available`,
    minOrder: "$2,000",
    discount: "Up to 30%",
    image: category.photo || `/images/categories/${category.slug}/${category.slug}.jpg`
  }))

  const benefits = [
    {
      icon: DollarSign,
      title: "Bulk Discounts",
      description: "Save up to 35% on large orders with volume pricing"
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Priority shipping and logistics support for wholesale orders"
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "All products backed by our quality assurance program"
    },
    {
      icon: Globe,
      title: "Global Sourcing",
      description: "Access to products from trusted manufacturers worldwide"
    },
    {
      icon: Zap,
      title: "Dedicated Support",
      description: "Personal account manager and priority customer service"
    },
    {
      icon: Target,
      title: "Flexible Terms",
      description: "Custom payment terms and flexible ordering options"
    }
  ]

  const requirements = [
    "Valid business license or tax ID",
    "Minimum order value varies by category",
    "Established business with proven track record",
    "Ability to meet payment terms",
    "Compliance with our wholesale terms"
  ]

  const process = [
    {
      step: 1,
      title: "Apply",
      description: "Submit your wholesale application with business details"
    },
    {
      step: 2,
      title: "Get Approved",
      description: "Receive approval within 2-3 business days"
    },
    {
      step: 3,
      title: "Access Catalog",
      description: "Browse our wholesale catalog with special pricing"
    },
    {
      step: 4,
      title: "Place Orders",
      description: "Order in bulk with your wholesale account"
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wholesale categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Package className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900">Wholesale Center</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Access our wholesale catalog and enjoy bulk pricing for your business. 
          Whether you're a retailer, distributor, or reseller, we have the products and pricing you need.
        </p>
        <div className="mt-8">
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => router.push("/dashboard/wholesale")}>
            Access Wholesale Center
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">5K+</div>
              <div className="text-gray-600">Wholesale Partners</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">35%</div>
              <div className="text-gray-600">Max Discount</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">24h</div>
              <div className="text-gray-600">Order Processing</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-gray-600">Countries Served</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Wholesale Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wholesaleCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Min Order</div>
                    <div className="font-semibold text-primary">{category.minOrder}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Discount</div>
                    <div className="font-semibold text-green-600">{category.discount}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push(`category/${slugify(category.name)}`) }>
                  View Products
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Wholesale Program?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-orange-100 text-primary mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {process.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Requirements</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          Join thousands of successful businesses that partner with us for their wholesale needs. 
          Apply today and start saving on your bulk orders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100" onClick={() => router.push("/auth/signup")}>
            Apply Now
          </Button>
          <Button size="lg" variant={"outline"} className="border-white hover:bg-white hover:text-primary bg-transparent text-white" onClick={() => router.push("/contact")}>
            Contact Sales
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What are the minimum order requirements?</h3>
              <p className="text-gray-600 text-sm">Minimum orders vary by category, ranging from $2,500 to $5,000 depending on the product type.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How long does approval take?</h3>
              <p className="text-gray-600 text-sm">Most applications are approved within 2-3 business days after we verify your business information.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What payment terms are available?</h3>
              <p className="text-gray-600 text-sm">We offer flexible payment terms including net 30, net 60, and custom arrangements for qualified partners.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Do you offer dropshipping?</h3>
              <p className="text-gray-600 text-sm">Yes, we offer dropshipping services for qualified wholesale partners with additional setup requirements.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-4">Our wholesale team is here to help you succeed</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" >
            <Link className="flex items-center space-x-2" href="/contact">
            <span>Contact Sales</span>
            <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {/* <Button variant="outline" className="flex items-center space-x-2">
            <span>Download Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  )
} 