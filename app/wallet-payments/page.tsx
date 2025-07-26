"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WalletPaymentsPage() {
  const router = useRouter()
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <section className="text-center space-y-2">
        <Wallet className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold">Wallet Payments</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Top up your Bizury wallet and pay for orders instantly. Enjoy seamless, secure, and fast payments with your wallet balance.
        </p>
        <Button size="lg" className="mt-2" onClick={() => router.push("/dashboard/billing")}>Go to Wallet & Billing</Button>
      </section>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">How Wallet Payments Work</h2>
          <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
            <li>Top up your wallet using crypto, card, or other supported methods.</li>
            <li>Pay for orders instantly with your wallet balance at checkout.</li>
            <li>Track your transactions and manage your balance in your dashboard.</li>
            <li>Wallet payments are secure and convenient for frequent shoppers.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 