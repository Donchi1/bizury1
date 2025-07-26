"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Store, 
  TrendingUp, 
  Users, 
  Globe, 
  Shield, 
  Truck,  
  BarChart3,
  Star,
  Package,
  DollarSign,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useAuthStore } from "@/lib/store/auth"
import { useRouter } from "next/navigation"

const sellFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  businessType: z.string().min(1, "Please select a business type"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  website: z.string().url().optional().or(z.literal("")),
})

type SellFormData = z.infer<typeof sellFormSchema>

export default function SellPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      businessType: "",
      description: "",
      website: "",
    },
  })

  const onSubmit = async (data: SellFormData) => {
    setIsSubmitting(true)
    try {
      // Handle form submission
      if(!user) return router.push("/auth/signin")
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing
      router.push(`/dashboard/apply-merchant?input=${JSON.stringify(data)}`)
      form.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access millions of customers worldwide",
      color: "bg-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Growing Platform",
      description: "Join one of the fastest-growing e-commerce platforms",
      color: "bg-green-500"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and reliable payment processing",
      color: "bg-purple-500"
    },
    {
      icon: Truck,
      title: "Fulfillment Options",
      description: "Flexible shipping and fulfillment solutions",
      color: "bg-orange-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Detailed sales reports and customer analytics",
      color: "bg-red-500"
    },
    {
      icon: Users,
      title: "Customer Support",
      description: "Dedicated support for sellers",
      color: "bg-indigo-500"
    }
  ]

  const requirements = [
    {
      title: "Business Registration",
      description: "Valid business license or registration documents",
      icon: Store
    },
    {
      title: "Product Quality",
      description: "High-quality products that meet our standards",
      icon: Package
    },
    {
      title: "Inventory Management",
      description: "Ability to maintain accurate inventory levels",
      icon: BarChart3
    },
    {
      title: "Customer Service",
      description: "Commitment to excellent customer service",
      icon: Users
    },
    {
      title: "Shipping Capability",
      description: "Reliable shipping and delivery processes",
      icon: Truck
    },
    {
      title: "Financial Stability",
      description: "Proof of financial stability and capability",
      icon: DollarSign
    }
  ]

  const commissionRates = [
    {
      category: "Electronics",
      rate: "8%",
      description: "Computers, phones, accessories"
    },
    {
      category: "Fashion",
      rate: "12%",
      description: "Clothing, shoes, accessories"
    },
    {
      category: "Home & Garden",
      rate: "10%",
      description: "Furniture, decor, tools"
    },
    {
      category: "Books & Media",
      rate: "15%",
      description: "Books, movies, music"
    },
    {
      category: "Sports & Outdoors",
      rate: "11%",
      description: "Fitness, camping, sports equipment"
    },
    {
      category: "Beauty & Health",
      rate: "13%",
      description: "Cosmetics, health products"
    }
  ]

  const successStories = [
    {
      name: "Sarah Johnson",
      business: "TechGadgets Pro",
      story: "Started with just 10 products, now selling over 500 items with $50K+ monthly revenue",
      rating: 4.9,
      sales: "$50K+"
    },
    {
      name: "Mike Chen",
      business: "Fashion Forward",
      story: "Grew from a small boutique to a major fashion retailer with 10K+ customers",
      rating: 4.8,
      sales: "$75K+"
    },
    {
      name: "Lisa Rodriguez",
      business: "Home Essentials",
      story: "Built a successful home goods business with 95% customer satisfaction",
      rating: 4.9,
      sales: "$30K+"
    }
  ]



  const checkAuthAndRoute = () => {
     if(user) return router.push("/dashboard")
      router.push("/auth/signin")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="bg-gradient-to-r from-primary to-green-600 rounded-lg p-12 text-white mb-8">
          <Store className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Start Selling Today</h1>
          <p className="text-xl text-green-100 mb-6 max-w-3xl mx-auto">
            Join thousands of successful sellers and reach millions of customers worldwide. 
            Start your e-commerce journey with our powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" onClick={checkAuthAndRoute}>
              Start Selling Now
            </Button>
            {/* <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Learn More
            </Button> */}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Sell With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-3 rounded-full ${benefit.color} text-white mb-4`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Requirements to Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((requirement, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/90 p-2 rounded-full">
                    <requirement.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{requirement.title}</h3>
                    <p className="text-gray-600 text-sm">{requirement.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission Rates */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Competitive Commission Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commissionRates.map((rate, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{rate.rate}</div>
                <h3 className="text-lg font-semibold mb-2">{rate.category}</h3>
                <p className="text-gray-600 text-sm">{rate.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(story.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">({story.rating})</span>
                </div>
                <h3 className="font-semibold mb-2">{story.business}</h3>
                <p className="text-gray-600 text-sm mb-4">{story.story}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">by {story.name}</span>
                  <Badge className=" text-white">{story.sales} monthly</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Form */}
      {/* <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Apply to Become a Seller</CardTitle>
            <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
          </CardHeader>
          <CardContent>
                         <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name *</label>
                                         <FormField
                       control={form.control}
                       name="businessName"
                       render={({ field }) => (
                         <Input
                           {...field}
                           placeholder="Enter your business name"
                           required
                         />
                       )}
                     />
                    <FormMessage />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                                         <FormField
                       control={form.control}
                       name="email"
                       render={({ field }) => (
                         <Input
                           {...field}
                           type="email"
                           placeholder="Enter your email address"
                           required
                         />
                       )}
                     />
                    <FormMessage />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                                         <FormField
                       control={form.control}
                       name="phone"
                       render={({ field }) => (
                         <Input
                           {...field}
                           placeholder="Enter your phone number"
                         />
                       )}
                     />
                    <FormMessage />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Type *</label>
                                         <FormField
                       control={form.control}
                       name="businessType"
                       render={({ field }) => (
                         <Select
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           required
                         >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Individual/Sole Proprietor</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                                     <FormField
                     control={form.control}
                     name="website"
                     render={({ field }) => (
                       <Input
                         {...field}
                         placeholder="Enter your website URL"
                       />
                     )}
                   />
                  <FormMessage />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Description *</label>
                                     <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                       <Textarea
                         {...field}
                         placeholder="Tell us about your business, products, and why you want to sell with us..."
                         className="min-h-[120px]"
                         required
                       />
                     )}
                   />
                  <FormMessage />
                </div>

                                 <Button type="submit" className="w-full text-white" disabled={isSubmitting}>
                   {isSubmitting ? (
                     <ButtonLoading text="Submitting Application..." />
                   ) : (
                     "Submit Application"
                   )}
                 </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div> */}

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Success Story?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful sellers who have built thriving businesses on our platform. 
            Start your journey today and reach millions of customers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={checkAuthAndRoute} size="lg" className="bg-primary">
              Apply Now
            </Button>
            <Button onClick={() => router.push("/contact")} size="lg" variant="outline">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 