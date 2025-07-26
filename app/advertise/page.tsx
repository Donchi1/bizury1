"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { CheckCircle, Megaphone, Mail, HelpCircle } from "lucide-react"

export default function AdvertisePage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <Megaphone className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">Advertise with Bizury</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Reach millions of engaged shoppers and grow your brand with targeted advertising on our platform.
        </p>
        <Button size="lg" className="mt-2">Get Started</Button>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Why Advertise With Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Massive Reach</h3>
              <p className="text-sm text-muted-foreground">Access a large, diverse audience of active buyers across multiple categories.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Advanced Targeting</h3>
              <p className="text-sm text-muted-foreground">Target your ads by demographics, interests, and shopping behavior for maximum ROI.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Flexible Solutions</h3>
              <p className="text-sm text-muted-foreground">Choose from sponsored products, banners, and custom campaigns to fit your goals.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Steps to Get Started */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">How It Works</h2>
        <ol className="space-y-4 w-full lg:max-w-xl mx-auto">
          <li className="flex items-start gap-3">
            <span className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center font-bold">1</span>
            <div>
              <h4 className="font-semibold">Submit Your Interest</h4>
              <p className="text-sm text-muted-foreground">Fill out the contact form below with your business details and advertising goals.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center font-bold">2</span>
            <div>
              <h4 className="font-semibold">Get a Custom Proposal</h4>
              <p className="text-sm text-muted-foreground">Our team will reach out to discuss your needs and create a tailored advertising plan.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center font-bold">3</span>
            <div>
              <h4 className="font-semibold">Launch & Grow</h4>
              <p className="text-sm text-muted-foreground">Start your campaign and track results with our easy-to-use dashboard.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Contact Form */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Contact Us</h2>
        <Card className="lg:max-w-6xl w-full mx-auto">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center space-y-2">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="font-semibold">Thank you! We'll be in touch soon.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
                  <Textarea id="message" name="message" value={form.message} onChange={handleChange} rows={4} required />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg">
                  <Mail className="h-4 w-4 mr-2" />Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="lg:max-w-6xl w-full mx-auto">
          <AccordionItem value="q1">
            <AccordionTrigger>Who can advertise on Bizury?</AccordionTrigger>
            <AccordionContent>
              Any business, brand, or seller looking to reach a large audience of online shoppers can apply to advertise with us.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>What ad formats are available?</AccordionTrigger>
            <AccordionContent>
              We offer sponsored products, display banners, homepage takeovers, and custom campaign solutions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>How much does it cost to advertise?</AccordionTrigger>
            <AccordionContent>
              Pricing depends on your campaign type, duration, and targeting. We'll provide a custom quote after learning about your needs.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>How soon can my ads go live?</AccordionTrigger>
            <AccordionContent>
              Most campaigns can launch within a few days after approval and setup.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger>How do I track my ad performance?</AccordionTrigger>
            <AccordionContent>
              You'll get access to a dashboard with real-time analytics and reporting for your campaigns.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
} 