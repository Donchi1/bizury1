"use client"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const isAdmin = pathname.includes("/admin")
  return (
    <footer className={`${isAdmin && "hidden"} bg-[#232F3E] text-white`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Get to Know Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-orange-400">
                  About Us
                </Link>
              </li>
              {/* <li>
                <Link href="/careers" className="hover:text-orange-400">
                  Careers
                </Link>
              </li> */}
              <li>
                <Link href="/press" className="hover:text-orange-400">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href="/investor" className="hover:text-orange-400">
                  Investor Relations
                </Link>
              </li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sell" className="hover:text-orange-400">
                  Sell on ECommerce
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-orange-400">
                  Become an Affiliate
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-orange-400">
                  Advertise Products
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="hover:text-orange-400">
                  Wholesale Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Shipping */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment & Shipping</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/crypto-payments" className="hover:text-orange-400">
                  Crypto Payments
                </Link>
              </li>
              <li>
                <Link href="/wallet-payments" className="hover:text-orange-400">
                  Wallet Balance
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-orange-400">
                  Shipping Rates
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-orange-400">
                  Returns & Replacements
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-orange-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-orange-400">
                  Track Your Order
                </Link>
              </li>
              {/* <li>
                <Link href="/manage-content" className="hover:text-orange-400">
                  Manage Your Content
                </Link>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-orange-400 text-black px-3 py-1 rounded font-bold text-xl">BZ</div>
              <span className="text-xl font-bold">Bizury</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="#" className="hover:text-orange-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-orange-400">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-orange-400">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-orange-400">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 mt-4">
            <p>&copy; 2024 Bizury Platform. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link href="/privacy-policy" className="hover:text-orange-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-orange-400">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-orange-400">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
