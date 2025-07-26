"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Cookies Policy</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Learn how Bizury uses cookies and how you can control them.
        </p>
      </section>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">What Are Cookies?</h2>
            <p className="text-muted-foreground text-sm">
              Cookies are small text files stored on your device by your web browser. They help websites remember information about your visit, like your preferences and login status.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How We Use Cookies</h2>
            <p className="text-muted-foreground text-sm">
              We use cookies to enhance your experience, analyze site usage, personalize content, and deliver relevant ads. Some cookies are essential for the website to function properly.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Types of Cookies We Use</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="essential">
                <AccordionTrigger>Essential Cookies</AccordionTrigger>
                <AccordionContent>
                  These cookies are necessary for the website to work and cannot be switched off. They are usually set in response to actions you take, such as logging in or filling forms.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="analytics">
                <AccordionTrigger>Analytics Cookies</AccordionTrigger>
                <AccordionContent>
                  These cookies help us understand how visitors interact with our site, so we can improve performance and user experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="personalization">
                <AccordionTrigger>Personalization Cookies</AccordionTrigger>
                <AccordionContent>
                  These cookies remember your preferences and choices to provide a more personalized experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="advertising">
                <AccordionTrigger>Advertising Cookies</AccordionTrigger>
                <AccordionContent>
                  These cookies are used to deliver ads that are more relevant to you and your interests.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">How to Control Cookies</h2>
            <p className="text-muted-foreground text-sm">
              You can control and delete cookies through your browser settings. Most browsers let you block or delete cookies, but this may affect your experience on our site. For more information, visit your browser's help section.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              For questions about our cookies policy, email us at <a href="mailto:privacy@bizury.com" className="underline">privacy@bizury.com</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 