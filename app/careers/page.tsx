"use client"

import { useState } from "react"
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  Globe, 
  Zap,
  ArrowRight,
  Building,
  GraduationCap,
  Coffee
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const departments = [
    { id: "all", name: "All Departments" },
    { id: "engineering", name: "Engineering" },
    { id: "design", name: "Design" },
    { id: "marketing", name: "Marketing" },
    { id: "sales", name: "Sales" },
    { id: "operations", name: "Operations" },
    { id: "finance", name: "Finance" }
  ]

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "engineering",
      location: "New York, NY",
      type: "Full-time",
      experience: "5+ years",
      description: "Join our engineering team to build the next generation of e-commerce experiences.",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Product Designer",
      department: "design",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      description: "Create beautiful and intuitive user experiences for our global platform.",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Marketing Manager",
      department: "marketing",
      location: "Los Angeles, CA",
      type: "Full-time",
      experience: "4+ years",
      description: "Lead our marketing initiatives and drive customer acquisition strategies.",
      skills: ["Digital Marketing", "Analytics", "Campaign Management", "SEO"],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Data Scientist",
      department: "engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "3+ years",
      description: "Build machine learning models to improve our recommendation systems.",
      skills: ["Python", "Machine Learning", "SQL", "Statistics"],
      posted: "5 days ago"
    },
    {
      id: 5,
      title: "Customer Success Manager",
      department: "operations",
      location: "Remote",
      type: "Full-time",
      experience: "2+ years",
      description: "Help our customers succeed and grow their businesses on our platform.",
      skills: ["Customer Service", "Account Management", "CRM", "Analytics"],
      posted: "1 week ago"
    },
    {
      id: 6,
      title: "Sales Representative",
      department: "sales",
      location: "Chicago, IL",
      type: "Full-time",
      experience: "1+ years",
      description: "Drive revenue growth by acquiring new sellers and partners.",
      skills: ["Sales", "Negotiation", "CRM", "Relationship Building"],
      posted: "4 days ago"
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, dental, vision, and mental health support"
    },
    {
      icon: Clock,
      title: "Flexible Work",
      description: "Remote work options, flexible hours, and unlimited PTO"
    },
    {
      icon: GraduationCap,
      title: "Learning & Growth",
      description: "Professional development budget, conference attendance, and training programs"
    },
    {
      icon: Star,
      title: "Competitive Pay",
      description: "Market-leading salaries, equity packages, and performance bonuses"
    },
    {
      icon: Coffee,
      title: "Great Culture",
      description: "Inclusive environment, team events, and recognition programs"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Work on products used by millions of people worldwide"
    }
  ]

  const values = [
    {
      title: "Customer First",
      description: "Everything we do is driven by what's best for our customers"
    },
    {
      title: "Innovation",
      description: "We constantly push boundaries and embrace new technologies"
    },
    {
      title: "Collaboration",
      description: "Great ideas come from working together and sharing knowledge"
    },
    {
      title: "Integrity",
      description: "We do the right thing, even when it's not the easy thing"
    }
  ]

  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Join Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          We're building the future of e-commerce and looking for talented individuals 
          who share our passion for innovation and customer success.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            View Open Positions
          </Button>
          <Button size="lg" variant="outline">
            Learn About Culture
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Open Positions ({filteredJobs.length})</h2>
        <div className="space-y-6">
          {filteredJobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{departments.find(d => d.id === job.department)?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">{job.posted}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Experience: {job.experience}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-full bg-orange-100 text-orange-600 mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Company Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-16">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">25+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8</div>
              <div className="text-gray-600">Glassdoor Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Employee Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          We're always looking for talented individuals who are passionate about making a difference. 
          Check out our open positions and start your journey with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
            View All Jobs
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
            Contact Recruiting
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Learn More</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Company Culture</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Benefits & Perks</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Interview Process</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 