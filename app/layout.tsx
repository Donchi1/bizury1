import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/layout/AuthProvider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Bizury - Amazon-Style ECommerce Platform",
    template: "%s | Bizury"
  },
  description:
    "Bizury is a modern, full-stack e-commerce platform offering a seamless Amazon-style shopping experience, secure crypto payments, seller dashboard, and more.",
  generator: "Bizury Platform",
  keywords: [
    "ecommerce",
    "shopping",
    "crypto payments",
    "marketplace",
    "online store",
    "seller dashboard",
    "modern UI",
    "Bizury",
    "Amazon style"
  ],
  openGraph: {
    title: "Bizury - Amazon-Style ECommerce Platform",
    description:
      "Shop millions of products, pay with crypto, and manage your store with Bizury's advanced seller dashboard.",
    url: "https://bizury.info/",
    siteName: "Bizury",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 512,
        height: 512,
        alt: "Bizury Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {



  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
         {children}
        <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
