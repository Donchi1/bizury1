"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle,
  Send,
  Building,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ButtonLoading } from "@/components/ui/loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useContentStore } from "@/lib/store/admin/contentStore"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z.string().optional(),
  company: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  //need to be fetched from database
  const {contactInfo, fetchContactInfo} = useContentStore()


  useEffect(() => {
    fetchContactInfo()
  }, [fetchContactInfo])

  const apInfo = {
    phone: '+1639873893073'
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
      company: "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {

      await supabase.from('contacts').insert({...data, created_at: new Date().toISOString()})
      form.reset()
      toast.success("We have received your message. We will get back to you as soon as possible.")
    } catch (error) {
      toast.error("Failed to submit contact form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfoLocal = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: contactInfo?.email,
      response: "We'll respond within 24 hours",
      color: "bg-primary"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our support team",
      contact: contactInfo?.phone,
      response: "Mon-Fri 9AM-6PM EST",
      color: "bg-green-500"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help online",
      contact: "Available 24/7",
      response: "Average response: 30 seconds",
      color: "bg-purple-500"
    }
  ]

  const officeLocations = [
    {
      city: "New York",
      address: contactInfo?.address,
      phone: contactInfo?.phone,
      hours: "Mon-Fri 9AM-6PM EST"
    },
    {
      city: "Los Angeles",
      address: "456 Tech Ave, Los Angeles, CA 90210",
      phone: "+1 (310) 555-0456",
      hours: "Mon-Fri 9AM-6PM PST"
    },
    {
      city: "London",
      address: "789 Business Rd, London, UK SW1A 1AA",
      phone: "+44 20 7946 0958",
      hours: "Mon-Fri 9AM-6PM GMT"
    }
  ]

  // const departments = [
  //   {
  //     name: "Customer Support",
  //     email: "support@bizury.info",
  //     phone: "+1 (800) 123-4567",
  //     description: "General inquiries and customer service"
  //   },
  //   {
  //     name: "Sales",
  //     email: "sales@bizury.info",
  //     phone: "+1 (800) 123-4568",
  //     description: "Business partnerships and sales inquiries"
  //   },
  //   {
  //     name: "Technical Support",
  //     email: "tech@bizury.info",
  //     phone: "+1 (800) 123-4569",
  //     description: "Technical issues and platform support"
  //   },
  //   {
  //     name: "Press & Media",
  //     email: "press@bizury.info",
  //     phone: "+1 (800) 123-4570",
  //     description: "Media inquiries and press releases"
  //   }
  // ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're here to help! Get in touch with us through any of the methods below, 
          and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactInfoLocal.map((info, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-full ${info.color} text-white mb-4`}>
                <info.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{info.description}</p>
              <p className="text-lg font-medium mb-2">{info.contact}</p>
              <p className="text-sm text-gray-500">{info.response}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Form and Office Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
              <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Enter your first name"
                            required
                          />
                        )}
                      />
                      <FormMessage />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Enter your company name"
                          />
                        )}
                      />
                      <FormMessage />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) => field.onChange(value)}
                          required
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="support">Customer Support</SelectItem>
                            <SelectItem value="sales">Sales Inquiry</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Tell us how we can help you..."
                          className="min-h-[120px]"
                          required
                        />
                      )}
                    />
                    <FormMessage />
                  </div>

                                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ButtonLoading text="Sending Message..." />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Office Locations */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
          <div className="space-y-6">
            {officeLocations.map((office, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Building className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{office.city}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{office.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{office.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{office.hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Departments */}
      {/* <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Contact by Department</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{dept.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{dept.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">What are your business hours?</h3>
            <p className="text-gray-600 text-sm">Our customer support team is available Monday through Friday, 9AM-6PM EST. Live chat is available 24/7.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How quickly will I get a response?</h3>
            <p className="text-gray-600 text-sm">We aim to respond to all inquiries within 24 hours. Live chat responses are typically within 30 seconds.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I schedule a call?</h3>
            <p className="text-gray-600 text-sm">Yes! For business inquiries, you can schedule a call with our sales team through the contact form above.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer international support?</h3>
            <p className="text-gray-600 text-sm">Yes, we have offices in multiple countries and offer support in multiple languages.</p>
          </div>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Need Immediate Help?</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {/* open life chat */}
          <Button variant="outline" className="flex items-center space-x-2" onClick={() => {}}>
            <MessageCircle className="h-4 w-4" />
            <span>Start Live Chat</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <a href={`tel:${apInfo.phone}`}>Call Now</a>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <a href={"mailto:support@bizury.info"}>Send Email</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
