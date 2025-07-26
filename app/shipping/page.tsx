"use client"

import {
  Truck,
  Clock,
  MapPin,
  Package,
  Globe,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ShippingPage() {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      description: "Reliable delivery to most locations",
      timeframe: "3-5 business days",
      cost: "Free on orders over $35",
      icon: Truck,
      color: "bg-orange-500",
      features: [
        "Tracking included",
        "Signature not required",
        "Most locations covered"
      ]
    },
    {
      name: "Express Shipping",
      description: "Faster delivery for urgent orders",
      timeframe: "1-2 business days",
      cost: "$9.99",
      icon: Clock,
      color: "bg-blue-500",
      features: [
        "Priority handling",
        "Tracking included",
        "Signature delivery available"
      ]
    },
    {
      name: "Overnight Shipping",
      description: "Next-day delivery for critical items",
      timeframe: "Next business day",
      cost: "$19.99",
      icon: Package,
      color: "bg-green-500",
      features: [
        "Guaranteed delivery",
        "Priority handling",
        "Signature required"
      ]
    }
  ]

  const internationalShipping = [
    {
      region: "Canada",
      timeframe: "5-7 business days",
      cost: "$14.99",
      restrictions: "Some items may be restricted"
    },
    {
      region: "Europe",
      timeframe: "7-10 business days",
      cost: "$24.99",
      restrictions: "Import duties may apply"
    },
    {
      region: "Asia Pacific",
      timeframe: "8-12 business days",
      cost: "$29.99",
      restrictions: "Customs clearance required"
    },
    {
      region: "Rest of World",
      timeframe: "10-15 business days",
      cost: "$39.99",
      restrictions: "Varies by country"
    }
  ]

  const shippingFeatures = [
    {
      icon: Shield,
      title: "Secure Packaging",
      description: "All items are carefully packaged to ensure safe delivery"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "We ship to over 150 countries worldwide"
    },
    {
      icon: CheckCircle,
      title: "Tracking Included",
      description: "Real-time tracking for all shipments"
    },
    {
      icon: MapPin,
      title: "Flexible Delivery",
      description: "Multiple delivery options to suit your needs"
    }
  ]

  const restrictions = [
    "Hazardous materials",
    "Perishable items",
    "Items over 70 lbs",
    "Oversized items (over 108 inches combined)",
    "Items requiring special handling",
    "Restricted by destination country"
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Truck className="h-12 w-12 text-primary/90" />
          <h1 className="text-4xl font-bold text-gray-900">Shipping & Delivery</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Fast, reliable shipping to your doorstep. Choose from multiple delivery options
          to get your orders when you need them.
        </p>
      </div>

      {/* Shipping Options */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Domestic Shipping Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow ">
              <CardHeader className="text-center">
                <div className={`size-16 flex justify-center items-center mx-auto p-3 rounded-full ${option.color} text-white mb-4`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{option.name}</CardTitle>
                <p className="text-gray-600">{option.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary/90 mb-1">{option.timeframe}</div>
                  <div className="text-lg font-semibold">{option.cost}</div>
                </div>
                <ul className="space-y-2  flex justify-center w-[80%] mx-auto flex-col">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* International Shipping */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">International Shipping</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {internationalShipping.map((region, index) => (
                <div key={index} className="text-center">
                  <h3 className="font-semibold text-lg mb-3">{region.region}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-500">Delivery Time</div>
                      <div className="font-semibold">{region.timeframe}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Shipping Cost</div>
                      <div className="font-semibold text-primary/90">{region.cost}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Notes</div>
                      <div className="text-xs text-gray-600">{region.restrictions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Shipping?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-full bg-orange-100 text-primary/90 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Shipping Restrictions */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Shipping Restrictions</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-primary/90 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Items We Cannot Ship</h3>
                <p className="text-gray-600 mb-4">
                  For safety and legal reasons, certain items cannot be shipped. Please check
                  the list below before placing your order.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restrictions.map((restriction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{restriction}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Information */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Delivery Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary/90" />
                Package Handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Packages are typically delivered during business hours</li>
                <li>• Signature may be required for high-value items</li>
                <li>• Delivery attempts are made up to 3 times</li>
                <li>• Packages can be held at local facilities for pickup</li>
                <li>• Contact us if you need to reschedule delivery</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary/90" />
                Delivery Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• We deliver to all 50 US states</li>
                <li>• Service available in Puerto Rico and US territories</li>
                <li>• International shipping to 150+ countries</li>
                <li>• Remote areas may have extended delivery times</li>
                <li>• Some locations may have delivery restrictions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking & Support */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Track Your Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Truck className="h-12 w-12 text-primary/90 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Track Your Package</h3>
              <p className="text-gray-600 mb-4">Get real-time updates on your shipment status</p>
              <Button className="w-full ">
                <Link href={"/track-order"}>
                  Track Order
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary/90 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Shipping Support</h3>
              <p className="text-gray-600 mb-4">Need help with your shipment? Contact our support team</p>
              <Button className="w-full ">
                <Link href={"/contact"}>
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">When will my order ship?</h3>
              <p className="text-gray-600 text-sm">Most orders ship within 1-2 business days of placement. You'll receive a shipping confirmation email with tracking information.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I change my shipping address?</h3>
              <p className="text-gray-600 text-sm">You can update your shipping address within 2 hours of placing your order. Contact customer service for assistance.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What if my package is damaged?</h3>
              <p className="text-gray-600 text-sm">If your package arrives damaged, please contact us immediately. We'll arrange for a replacement or refund.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Do you ship internationally?</h3>
              <p className="text-gray-600 text-sm">Yes, we ship to over 150 countries worldwide. International shipping rates and delivery times vary by location.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-primary/90 rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          Enjoy fast, reliable shipping on all your orders. Free standard shipping on orders over $35.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-primary/90 hover:bg-gray-100">
            <Link href={"/products"}>
              Start Shopping
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary/90">
            <Link href={"/contact"}>
              Contact Support
            </Link>
          </Button>
        </div>
      </div>

      {/* Additional Resources */}
      {/* <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Track Order</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Returns & Exchanges</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Customer Service</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
    </div>
  )
} 