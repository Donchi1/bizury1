"use client"

import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Heart, 
  Shield, 
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    {
      number: "10M+",
      label: "Happy Customers",
      icon: Users
    },
    {
      number: "150+",
      label: "Countries Served",
      icon: Globe
    },
    {
      number: "50K+",
      label: "Active Sellers",
      icon: TrendingUp
    },
    {
      number: "99.9%",
      label: "Uptime",
      icon: Shield
    }
  ]

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We put our customers at the heart of everything we do, ensuring exceptional experiences at every touchpoint."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your security and privacy are our top priorities. We use industry-leading protection measures."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting buyers and sellers worldwide, breaking down geographical barriers to commerce."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "We maintain the highest standards of quality in our platform, products, and services."
    }
  ]

  const milestones = [
    {
      year: "2010",
      title: "Company Founded",
      description: "Started with a vision to revolutionize e-commerce"
    },
    {
      year: "2015",
      title: "1M Customers",
      description: "Reached our first million customers milestone"
    },
    {
      year: "2018",
      title: "Global Expansion",
      description: "Expanded to 50+ countries worldwide"
    },
    {
      year: "2020",
      title: "Crypto Integration",
      description: "Became the first major platform to accept cryptocurrency"
    },
    {
      year: "2023",
      title: "10M+ Customers",
      description: "Celebrated serving over 10 million customers"
    },
    {
      year: "2024",
      title: "AI Innovation",
      description: "Launched AI-powered shopping recommendations"
    }
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former tech executive with 15+ years in e-commerce",
      image: "/placeholder-user.jpg"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Technology leader with expertise in scalable platforms",
      image: "/placeholder-user.jpg"
    },
    {
      name: "Lisa Rodriguez",
      role: "Head of Operations",
      bio: "Operations expert focused on customer experience",
      image: "/placeholder-user.jpg"
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product strategist with deep e-commerce knowledge",
      image: "/placeholder-user.jpg"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">About Bizury</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
          We're on a mission to make commerce accessible to everyone, everywhere. 
          Since 2010, we've been connecting millions of buyers and sellers worldwide, 
          creating opportunities and building communities through technology.
        </p>
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            Our Story
          </Button>
          <Button size="lg" variant="outline">
            Join Our Team
          </Button>
        </div> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              To democratize commerce by providing a platform where anyone can buy and sell 
              anything, anywhere in the world. We believe in the power of technology to 
              create economic opportunities for everyone.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Enable global commerce for businesses of all sizes
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Provide secure and seamless shopping experiences
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Foster innovation in e-commerce technology
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-600" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              To become the world's most customer-centric company, where people can discover 
              and buy anything they want online, and businesses can reach customers globally 
              with ease and confidence.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Lead the future of digital commerce
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Create sustainable business practices
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Build lasting partnerships with communities
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-full bg-orange-100 text-orange-600 mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200"></div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-5 h-5 bg-orange-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <Card>
                    <CardContent className="p-4">
                      <Badge className="mb-2 bg-orange-100 text-orange-800">{milestone.year}</Badge>
                      <h3 className="font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-blue-600 text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          We're always looking for talented individuals who share our passion for innovation 
          and customer success. Explore opportunities to grow with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            View Careers
          </Button> */}
          <Button size="lg" className="border-white text-primary hover:bg-white bg-white ">
            <Link href="/contact">
            Contact Us
            </Link>
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">Learn More</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Press Releases</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Investor Relations</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Careers</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
