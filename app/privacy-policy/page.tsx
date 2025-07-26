"use client"

import { Shield, Eye, Lock, Users, Globe, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2024"

  const sections = [
    {
      title: "Information We Collect",
      icon: Eye,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This may include your name, email address, phone number, shipping address, and payment information."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our services, including your IP address, browser type, device information, pages visited, and time spent on our platform."
        },
        {
          subtitle: "Cookies and Tracking",
          text: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content and advertisements."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Users,
      content: [
        {
          subtitle: "Service Provision",
          text: "To process your orders, provide customer support, and maintain your account."
        },
        {
          subtitle: "Communication",
          text: "To send you order confirmations, updates, and marketing communications (with your consent)."
        },
        {
          subtitle: "Improvement",
          text: "To analyze usage patterns and improve our services, products, and user experience."
        },
        {
          subtitle: "Security",
          text: "To detect and prevent fraud, abuse, and security threats."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Globe,
      content: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, and delivering orders."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, court order, or government request."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction."
        },
        {
          subtitle: "With Your Consent",
          text: "We will share your information with third parties only with your explicit consent."
        }
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Encryption",
          text: "We use industry-standard encryption to protect your personal information during transmission and storage."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication measures to protect your data from unauthorized access."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities."
        },
        {
          subtitle: "Employee Training",
          text: "Our employees receive regular training on data protection and privacy best practices."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: [
        {
          subtitle: "Access and Update",
          text: "You have the right to access, update, or correct your personal information through your account settings."
        },
        {
          subtitle: "Deletion",
          text: "You may request deletion of your personal information, subject to certain legal and contractual obligations."
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of marketing communications at any time by updating your preferences or contacting us."
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to request a copy of your personal information in a portable format."
        }
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
                      <Shield className="h-12 w-12 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
          We are committed to protecting your privacy and ensuring the security of your personal information. 
          This policy explains how we collect, use, and safeguard your data.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            At ECommerce, we understand the importance of privacy and are committed to protecting your personal information. 
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our 
            platform, services, and applications.
          </p>
          <p className="text-gray-600">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            If you have any questions about this Privacy Policy, please contact us at privacy@ecommerce.com.
          </p>
        </CardContent>
      </Card>

      {/* Policy Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <section.icon className="h-6 w-6 mr-2 text-orange-600" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <h3 className="font-semibold text-lg mb-2">{item.subtitle}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, 
              resolve disputes, and enforce our agreements. The specific retention period depends on the type of information and 
              the purpose for which it was collected.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Account information: Retained while your account is active and for a reasonable period thereafter</li>
              <li>• Transaction data: Retained for 7 years for tax and accounting purposes</li>
              <li>• Marketing data: Retained until you opt out or for 3 years, whichever is earlier</li>
              <li>• Log data: Retained for 12 months for security and analytics purposes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers 
              comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
            <p className="text-gray-600">
              For users in the European Union, we rely on adequacy decisions, standard contractual clauses, and other approved 
              transfer mechanisms to ensure your data is protected when transferred internationally.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Our services are not intended for children under the age of 13. We do not knowingly collect personal information 
              from children under 13. If you are a parent or guardian and believe your child has provided us with personal 
              information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
              We will notify you of any material changes by posting the updated policy on our website and updating the 
              "Last updated" date.
            </p>
            <p className="text-gray-600">
              We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>• Email: support@bizury.info</p>
              <p>• Phone: +1 (800) 123-4567</p>
              <p>• Address: 123 Commerce St, New York, NY 10001</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>
          This Privacy Policy is effective as of {lastUpdated} and will remain in effect except with respect to any changes 
          in its provisions in the future, which will be in effect immediately after being posted on this page.
        </p>
      </div>
    </div>
  )
}
