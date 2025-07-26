"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronRight,
  FileText,
  Settings,
  ShoppingCart,
  CreditCard,
  Truck,
  User,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const helpCategories = [
    {
      icon: ShoppingCart,
      title: "Shopping & Orders",
      description: "Learn how to shop, place orders, and track deliveries",
      articles: [
        "How to place an order",
        "Track your order",
        "Cancel or modify orders",
        "Order confirmation emails"
      ],
      color: "bg-orange-500"
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods, billing issues, and refunds",
      articles: [
        "Accepted payment methods",
        "Crypto payments guide",
        "Wallet balance management",
        "Request a refund"
      ],
      color: "bg-green-500"
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      description: "Shipping options, delivery times, and tracking",
      articles: [
        "Shipping options and costs",
        "Delivery timeframes",
        "International shipping",
        "Package tracking"
      ],
      color: "bg-orange-500"
    },
    {
      icon: User,
      title: "Account & Profile",
      description: "Account management and profile settings",
      articles: [
        "Create an account",
        "Reset your password",
        "Update profile information",
        "Account security"
      ],
      color: "bg-purple-500"
    },
    {
      icon: Settings,
      title: "Returns & Refunds",
      description: "Return policies and refund processes",
      articles: [
        "Return policy overview",
        "Start a return",
        "Refund processing time",
        "Return shipping labels"
      ],
      color: "bg-red-500"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Account security and privacy protection",
      articles: [
        "Account security tips",
        "Two-factor authentication",
        "Privacy policy",
        "Data protection"
      ],
      color: "bg-indigo-500"
    }
  ]

  const popularArticles = [
    {
      title: "How to track your order",
      category: "Shipping & Delivery",
      views: "15.2K"
    },
    {
      title: "Accepted payment methods",
      category: "Payment & Billing",
      views: "12.8K"
    },
    {
      title: "Return policy and process",
      category: "Returns & Refunds",
      views: "10.5K"
    },
    {
      title: "Create and manage your account",
      category: "Account & Profile",
      views: "9.3K"
    },
    {
      title: "Crypto payment guide",
      category: "Payment & Billing",
      views: "8.7K"
    }
  ]

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      response: "Available 24/7",
      action: "Start Chat",
      color: "bg-orange-500"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with a customer service representative",
      response: "Mon-Fri 9AM-6PM EST",
      action: "Call Now",
      color: "bg-green-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message and get a response within 24 hours",
      response: "Response within 24 hours",
      action: "Send Email",
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find answers to your questions, learn how to use our platform, and get the support you need.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-4 text-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Popular Articles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularArticles.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{article.category}</p>
                    <span className="text-xs text-gray-400">{article.views} views</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${category.color} text-white`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <ul className="space-y-1">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <Link href="#" className="text-sm text-orange-600 hover:underline">
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactOptions.map((option, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-full ${option.color} text-white mb-4`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <p className="text-xs text-gray-500 mb-4">{option.response}</p>
                <Button className="w-full">{option.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      {/* <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">User Guides</h3>
            <p className="text-gray-600 text-sm mb-4">Step-by-step guides for common tasks</p>
            <Button variant="outline" size="sm">Browse Guides</Button>
          </div>
          <div className="text-center">
            <Video className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">Visual guides and tutorials</p>
            <Button variant="outline" size="sm">Watch Videos</Button>
          </div>
          <div className="text-center">
            <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">FAQ</h3>
            <p className="text-gray-600 text-sm mb-4">Frequently asked questions</p>
            <Button variant="outline" size="sm">View FAQ</Button>
          </div>
        </div>
      </div> */}

      {/* Quick Links */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/customer-service" className="text-orange-600 hover:underline">Customer Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/contact" className="text-orange-600 hover:underline">Contact Us</Link>
          <span className="text-gray-400">|</span>
          <Link href="/track-order" className="text-orange-600 hover:underline">Track Order</Link>
          <span className="text-gray-400">|</span>
          <Link href="/returns" className="text-orange-600 hover:underline">Returns</Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
} 