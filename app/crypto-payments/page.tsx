"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bitcoin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CryptoPaymentsPage() {
  const router = useRouter()
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <section className="text-center space-y-2">
        <Bitcoin className="mx-auto h-10 w-10 text-yellow-500" />
        <h1 className="text-3xl md:text-4xl font-bold">Crypto Payments</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Pay securely with Bitcoin, USDT, and other cryptocurrencies. Fast, global, and secure payments for your orders.
        </p>
        <Button size="lg" className="mt-2" onClick={() => router.push("/dashboard/recharge")}>Go to Crypto Recharge</Button>
      </section>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">How Crypto Payments Work</h2>
          <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
            <li>Choose your preferred cryptocurrency at checkout or in your dashboard.</li>
            <li>Send the exact amount to the provided wallet address or QR code.</li>
            <li>Your balance will be updated after network confirmation.</li>
            <li>Crypto payments are fast, borderless, and secure.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 