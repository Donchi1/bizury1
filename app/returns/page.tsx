"use client"

import { 
  RefreshCw, 
  Package, 
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  Phone,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReturnsPage() {
  const returnPolicy = {
    timeframe: "30 days",
    condition: "Unused and in original packaging",
    exceptions: [
      "Personal care items",
      "Digital downloads",
      "Gift cards",
      "Custom or personalized items",
      "Items marked as non-returnable"
    ]
  }

  const returnReasons = [
    {
      reason: "Changed my mind",
      description: "You're not satisfied with your purchase",
      icon: RefreshCw,
      color: "bg-blue-500"
    },
    {
      reason: "Wrong size or fit",
      description: "The item doesn't fit as expected",
      icon: Package,
      color: "bg-green-500"
    },
    {
      reason: "Defective item",
      description: "The item arrived damaged or doesn't work",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      reason: "Wrong item received",
      description: "You received a different item than ordered",
      icon: XCircle,
      color: "bg-orange-500"
    }
  ]

  const returnProcess = [
    {
      step: 1,
      title: "Start Return",
      description: "Go to your order history and select the item you want to return",
      icon: FileText
    },
    {
      step: 2,
      title: "Select Reason",
      description: "Choose the reason for your return from the available options",
      icon: CheckCircle
    },
    {
      step: 3,
      title: "Print Label",
      description: "Download and print your prepaid shipping label",
      icon: Package
    },
    {
      step: 4,
      title: "Ship Item",
      description: "Package your item securely and drop it off at any authorized location",
      icon: Truck
    },
    {
      step: 5,
      title: "Track Return",
      description: "Monitor your return status through your account",
      icon: Clock
    }
  ]

  const refundInfo = [
    {
      method: "Original Payment Method",
      timeframe: "3-5 business days",
      description: "Refunds are processed to your original payment method"
    },
    {
      method: "Wallet Balance",
      timeframe: "1-2 business days",
      description: "If you paid with wallet balance, refunds are instant"
    },
    {
      method: "Cryptocurrency",
      timeframe: "5-7 business days",
      description: "Crypto refunds may take longer due to blockchain processing"
    }
  ]

  const prohibitedItems = [
    "Personal care items (for hygiene reasons)",
    "Digital downloads and software",
    "Gift cards and vouchers",
    "Custom or personalized items",
    "Items marked as 'Final Sale'",
    "Items without original packaging",
    "Items showing signs of use or wear",
    "Items purchased from third-party sellers (subject to their policies)"
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
                      <RefreshCw className="h-12 w-12 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Returns & Replacements</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We want you to be completely satisfied with your purchase. If you're not happy with your order, 
          we make it easy to return or exchange items.
        </p>
      </div>

      {/* Return Policy Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Return Policy Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Timeframe</h3>
              <p className="text-gray-600">{returnPolicy.timeframe} from delivery</p>
            </div>
            <div className="text-center">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Condition</h3>
              <p className="text-gray-600">{returnPolicy.condition}</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exceptions</h3>
              <p className="text-gray-600">Some items cannot be returned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Reasons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Common Return Reasons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {returnReasons.map((reason, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-full ${reason.color} text-white mb-4`}>
                  <reason.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{reason.reason}</h3>
                <p className="text-gray-600 text-sm">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Return Process */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How to Return an Item</h2>
        <div className="space-y-6">
          {returnProcess.map((step, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <step.icon className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Start a Return</h3>
              <p className="text-gray-600 mb-4">Begin the return process for your recent orders</p>
              <Button className="w-full">Go to Orders</Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Truck className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Track Return</h3>
              <p className="text-gray-600 mb-4">Check the status of your return or replacement</p>
              <Button className="w-full">Track Return</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refund Information */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Refund Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {refundInfo.map((info, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{info.method}</h3>
                <Badge className="mb-3 bg-green-100 text-green-800">{info.timeframe}</Badge>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Prohibited Items */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Items That Cannot Be Returned</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibitedItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How long does it take to process my return?</h3>
              <p className="text-gray-600 text-sm">Returns are typically processed within 3-5 business days after we receive your item. You'll receive an email confirmation once your return is processed.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Do I have to pay for return shipping?</h3>
              <p className="text-gray-600 text-sm">Most returns include a prepaid shipping label at no cost to you. However, some items may require you to pay return shipping fees.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I exchange an item instead of returning it?</h3>
              <p className="text-gray-600 text-sm">Yes! You can request an exchange during the return process. Simply select "Exchange" instead of "Return" when starting your return.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What if my item arrives damaged?</h3>
              <p className="text-gray-600 text-sm">If your item arrives damaged, please contact our customer service immediately. We'll arrange for a replacement or refund at no additional cost.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Need Help with Your Return?</h2>
        <p className="text-gray-600 text-center mb-6 max-w-2xl mx-auto">
          Our customer service team is here to help you with any questions about returns, exchanges, or refunds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
                          <Phone className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 text-sm mb-3">+1 (800) 123-4567</p>
            <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
          </div>
          <div className="text-center">
            <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm mb-3">returns@ecommerce.com</p>
            <p className="text-xs text-gray-500">Response within 24 hours</p>
          </div>
          <div className="text-center">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Start Live Chat
            </Button>
            <p className="text-xs text-gray-500 mt-2">Available 24/7</p>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Shipping Information</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Order Tracking</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Customer Service</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 