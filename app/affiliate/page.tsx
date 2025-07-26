"use client"

import { useState } from "react"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Gift,
  Shield,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AffiliatePage() {
  const [selectedPlan, setSelectedPlan] = useState("starter")

  const commissionRates = [
    {
      tier: "Starter",
      rate: "5%",
      requirements: "0-100 sales/month",
      features: ["Basic tracking", "Standard support", "Marketing materials"]
    },
    {
      tier: "Professional",
      rate: "8%",
      requirements: "101-500 sales/month",
      features: ["Advanced analytics", "Priority support", "Custom banners", "Dedicated manager"]
    },
    {
      tier: "Elite",
      rate: "12%",
      requirements: "500+ sales/month",
      features: ["Premium commission", "VIP support", "Exclusive promotions", "Early access to deals"]
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: "High Commission Rates",
      description: "Earn up to 12% commission on every sale you refer"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access to customers in over 150 countries worldwide"
    },
    {
      icon: TrendingUp,
      title: "Recurring Revenue",
      description: "Earn commissions on repeat purchases from your referrals"
    },
    {
      icon: Shield,
      title: "Reliable Payments",
      description: "Monthly payments with no minimum payout threshold"
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      description: "Monitor your performance and earnings in real-time"
    },
    {
      icon: Gift,
      title: "Exclusive Promotions",
      description: "Access to special deals and promotions for your audience"
    }
  ]

  const successStories = [
    {
      name: "Sarah Johnson",
      niche: "Lifestyle Blogger",
      earnings: "$12,500/month",
      story: "Started as a lifestyle blogger and now earns consistent income through our affiliate program.",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      niche: "Tech Reviewer",
      earnings: "$8,200/month",
      story: "Leverages his tech audience to promote electronics and gadgets effectively.",
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      niche: "Fashion Influencer",
      earnings: "$15,800/month",
      story: "Uses her fashion expertise to drive sales in clothing and accessories.",
      avatar: "ED"
    }
  ]

  const marketingTools = [
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track clicks, conversions, and earnings in real-time"
    },
    {
      icon: Target,
      title: "Smart Links",
      description: "Automatically optimize for best conversion rates"
    },
    {
      icon: Gift,
      title: "Promotional Banners",
      description: "High-quality banners and creatives for your website"
    },
    {
      icon: Star,
      title: "Product Recommendations",
      description: "AI-powered product suggestions for your audience"
    }
  ]

  const requirements = [
    "Active website, blog, or social media presence",
    "Minimum 1,000 monthly visitors or followers",
    "Content that aligns with our product categories",
    "Compliance with our affiliate program terms",
    "Valid payment information for commission payouts"
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Users className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900">Affiliate Program</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join our affiliate program and earn commissions by promoting our products to your audience. 
          Start earning today with our competitive commission rates and comprehensive support.
        </p>
        <div className="mt-8">
          <Button size="lg" className="text-white">
            <Link href="/auth/signin">
            Join Now - It's Free
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-gray-600">Paid to Affiliates</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">15K+</div>
              <div className="text-gray-600">Active Affiliates</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">12%</div>
              <div className="text-gray-600">Max Commission Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">24h</div>
              <div className="text-gray-600">Payment Processing</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Commission Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commissionRates.map((tier, index) => (
            <Card key={index} className={`hover:shadow-lg transition-shadow ${tier.tier === 'Elite' ? 'border-2 border-orange-200 bg-orange-50' : ''}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.tier}</CardTitle>
                <div className="text-3xl font-bold text-primary">{tier.rate}</div>
                <p className="text-gray-600">{tier.requirements}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-orange-600">
                  Apply for {tier.tier}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Affiliate Program?</h2>
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

      {/* Success Stories */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 text-primary rounded-full flex items-center justify-center font-semibold">
                    {story.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{story.name}</h3>
                    <p className="text-sm text-gray-500">{story.niche}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary">{story.earnings}</div>
                  <div className="text-sm text-gray-500">Average Monthly Earnings</div>
                </div>
                <p className="text-gray-600 text-sm">{story.story}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Marketing Tools */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">Marketing Tools & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketingTools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-orange-100 text-primary mb-4">
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-3">{tool.title}</h3>
                <p className="text-gray-600 text-sm">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Program Requirements</h2>
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

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
            <h3 className="font-semibold mb-2">Sign Up</h3>
            <p className="text-gray-600 text-sm">Complete the application form and get approved within 24 hours</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
            <h3 className="font-semibold mb-2">Get Your Links</h3>
            <p className="text-gray-600 text-sm">Access your unique affiliate links and marketing materials</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
            <h3 className="font-semibold mb-2">Promote</h3>
            <p className="text-gray-600 text-sm">Share your links with your audience and drive traffic</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">4</div>
            <h3 className="font-semibold mb-2">Earn</h3>
            <p className="text-gray-600 text-sm">Get paid commissions for every sale you refer</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          Join thousands of successful affiliates who are already earning with our program. 
          Start your journey today and turn your audience into income.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            <Link href={"/auth/login"}>
            Apply Now - Free
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white border hover:bg-white hover:text-primary bg-transparent text-white">
            <Link href={"/about"}>
            Learn More
            </Link>
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How much can I earn?</h3>
              <p className="text-gray-600 text-sm">Earnings depend on your audience size and conversion rates. Our top affiliates earn $10,000+ monthly.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">When do I get paid?</h3>
              <p className="text-gray-600 text-sm">Commissions are paid monthly, typically within 30 days of the end of each month.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What products can I promote?</h3>
              <p className="text-gray-600 text-sm">You can promote any product in our catalog, from electronics to fashion and everything in between.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Is there a minimum payout?</h3>
              <p className="text-gray-600 text-sm">No minimum payout threshold. You'll receive your full commission amount each month.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
        <p className="text-gray-600 mb-4">Our affiliate team is here to help you succeed</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" >
            <Link href={"/contact"} className="flex items-center space-x-2">
            <span>Contact Support</span>
            <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" >
            <Link href={"/affiliate"} className="flex items-center space-x-2">
            <span>Affiliate Guide</span>
            <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 