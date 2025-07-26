"use client"

import { FileText, AlertTriangle, Shield, Users, Globe, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  const lastUpdated = "January 15, 2024"

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using our platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the 'Last updated' date."
        },
        {
          subtitle: "Continued Use",
          text: "Your continued use of the platform after any such changes constitutes your acceptance of the new terms."
        }
      ]
    },
    {
      title: "User Accounts",
      icon: Users,
      content: [
        {
          subtitle: "Account Creation",
          text: "You must create an account to access certain features of our platform. You are responsible for providing accurate and complete information during registration."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion."
        }
      ]
    },
    {
      title: "Platform Usage",
      icon: Globe,
      content: [
        {
          subtitle: "Permitted Use",
          text: "You may use our platform for lawful purposes only. You agree not to use the platform in any way that violates any applicable federal, state, local, or international law or regulation."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You agree not to engage in any activity that interferes with or disrupts the platform, including but not limited to hacking, spamming, or attempting to gain unauthorized access."
        },
        {
          subtitle: "Content Standards",
          text: "You agree not to post, upload, or transmit any content that is illegal, harmful, threatening, abusive, or otherwise objectionable."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: Shield,
      content: [
        {
          subtitle: "Platform Ownership",
          text: "The platform and its original content, features, and functionality are owned by ECommerce and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of any content you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content."
        },
        {
          subtitle: "Trademarks",
          text: "All trademarks, service marks, and trade names used on the platform are the property of their respective owners."
        }
      ]
    },
    {
      title: "Payment and Transactions",
      icon: FileText,
      content: [
        {
          subtitle: "Payment Methods",
          text: "We accept various payment methods including credit cards, cryptocurrency, and digital wallets. All payments must be made in the currency specified on the platform."
        },
        {
          subtitle: "Transaction Processing",
          text: "All transactions are processed securely through our payment partners. We are not responsible for any issues arising from payment processing."
        },
        {
          subtitle: "Refunds and Returns",
          text: "Refund and return policies are subject to our return policy and applicable laws. Please review our return policy for specific details."
        }
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
                      <FileText className="h-12 w-12 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
          These terms and conditions govern your use of our platform and services. 
          Please read them carefully before using our website.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Important Notice */}
      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-orange-800 mb-2">Important Notice</h2>
              <p className="text-orange-700">
                By using our platform, you agree to these terms and conditions. If you do not agree with any part of these terms, 
                please do not use our services. These terms constitute a legally binding agreement between you and ECommerce.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            Welcome to ECommerce. These Terms of Service ("Terms") govern your use of our website, mobile applications, 
            and services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-600">
            If you are using our Platform on behalf of a company or other legal entity, you represent that you have the authority 
            to bind such entity to these Terms.
          </p>
        </CardContent>
      </Card>

      {/* Terms Sections */}
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

      {/* Additional Terms */}
      <div className="mt-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
              which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-600">
              By using our Platform, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, ECommerce shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including but not limited to loss of profits, data, or use.
            </p>
            <p className="text-gray-600">
              Our total liability to you for any claims arising from your use of the Platform shall not exceed the amount 
              you paid us in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Disclaimers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. 
              We do not warrant that the Platform will be uninterrupted, secure, or error-free.
            </p>
            <p className="text-gray-600">
              We disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular 
              purpose, and non-infringement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless ECommerce and its officers, directors, employees, and agents from and 
              against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Platform 
              or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of New York, 
              without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-600">
              Any disputes arising from these Terms or your use of the Platform shall be resolved in the courts of New York, 
              and you consent to the jurisdiction of such courts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Severability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or 
              eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Entire Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire 
              agreement between you and ECommerce regarding your use of the Platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>• Email: legal@ecommerce.com</p>
              <p>• Phone: +1 (800) 123-4567</p>
              <p>• Address: 123 Commerce St, New York, NY 10001</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>
          These Terms of Service are effective as of {lastUpdated} and will remain in effect except with respect to any changes 
          in their provisions in the future, which will be in effect immediately after being posted on this page.
        </p>
      </div>
    </div>
  )
}
