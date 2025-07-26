"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Truck, 
  RefreshCw, 
  Shield, 
  CreditCard, 
  Package,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CustomerServicePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqData = [
    {
      category: "Orders & Shipping",
      items: [
        {
          question: "How can I track my order?",
          answer: "You can track your order by logging into your account and visiting the 'My Orders' section, or by using the tracking number provided in your order confirmation email."
        },
        {
          question: "What are your shipping options?",
          answer: "We offer standard shipping (3-5 business days), express shipping (1-2 business days), and overnight shipping for select items. Shipping costs vary based on your location and the shipping method chosen."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can check availability during checkout."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      items: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most items. Items must be unused and in their original packaging. Some items may have different return policies due to their nature."
        },
        {
          question: "How do I return an item?",
          answer: "To return an item, go to your order history, select the item you want to return, and follow the return process. You'll receive a prepaid shipping label if the return is approved."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are typically processed within 3-5 business days after we receive your return. The time it takes for the refund to appear in your account depends on your payment method and bank."
        }
      ]
    },
    {
      category: "Account & Payment",
      items: [
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the sign-in page, enter your email address, and follow the instructions sent to your email to reset your password."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and digital wallets like Apple Pay and Google Pay."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers."
        }
      ]
    },
    {
      category: "Product Information",
      items: [
        {
          question: "How do I know if an item is in stock?",
          answer: "Product availability is shown on each product page. If an item is out of stock, you can usually sign up for restock notifications."
        },
        {
          question: "Do you offer product warranties?",
          answer: "Many products come with manufacturer warranties. Warranty information is typically listed in the product description. We also offer extended warranty options for select items."
        },
        {
          question: "Can I get product recommendations?",
          answer: "Yes! Our recommendation system suggests products based on your browsing history and purchases. You can also contact our customer service team for personalized recommendations."
        }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "24/7 Customer Support",
      contact: "+1 (800) 123-4567",
      response: "Average response: 2 minutes",
      color: "bg-blue-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed inquiries",
      contact: "support@ecommerce.com",
      response: "Average response: 4 hours",
      color: "bg-green-500"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant help",
      contact: "Available 24/7",
      response: "Average response: 30 seconds",
      color: "bg-purple-500"
    }
  ]

  const quickActions = [
    {
      icon: Truck,
      title: "Track Order",
      description: "Check your order status",
      href: "/track-order",
      color: "bg-orange-500"
    },
    {
      icon: RefreshCw,
      title: "Start Return",
      description: "Return or exchange items",
      href: "/dashboard/orders",
      color: "bg-red-500"
    },
    {
      icon: Package,
      title: "Order History",
      description: "View past orders",
      href: "/dashboard/orders",
      color: "bg-blue-500"
    },
    {
      icon: CreditCard,
      title: "Payment Issues",
      description: "Resolve payment problems",
      href: "#",
      color: "bg-green-500"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <HelpCircle className="h-12 w-12 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Customer Service</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're here to help! Find answers to common questions, get in touch with our support team, or explore our help resources.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-lg"
          />
          <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-full ${action.color} text-white mb-4`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{action.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={action.href}>{action.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactMethods.map((method, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-full ${method.color} text-white mb-4`}>
                <method.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{method.description}</p>
              <p className="text-lg font-medium mb-2">{method.contact}</p>
              <p className="text-sm text-gray-500">{method.response}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="max-w-4xl mx-auto">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{category.category}</h3>
              {category.items.map((item, itemIndex) => (
                <AccordionItem key={`${categoryIndex}-${itemIndex}`} value={`${categoryIndex}-${itemIndex}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          ))}
        </Accordion>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Still Need Help?</CardTitle>
            <p className="text-gray-600 text-center">Send us a message and we'll get back to you as soon as possible.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="First Name" />
              <Input placeholder="Last Name" />
            </div>
            <Input placeholder="Email Address" type="email" />
            <Input placeholder="Order Number (if applicable)" />
            <div>
              <select className="w-full p-3 border border-gray-300 rounded-md">
                <option value="">Select Topic</option>
                <option value="order">Order Issue</option>
                <option value="return">Return/Refund</option>
                <option value="product">Product Question</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Textarea 
              placeholder="Describe your issue or question..." 
              className="min-h-[120px]"
            />
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/help" className="text-orange-600 hover:underline">Help Center</Link>
          <span className="text-gray-400">|</span>
          <Link href="/contact" className="text-orange-600 hover:underline">Contact Us</Link>
          <span className="text-gray-400">|</span>
          <Link href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
