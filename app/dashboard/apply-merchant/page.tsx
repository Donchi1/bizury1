"use client"

import { JSX, Suspense, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth"
import { useSellingStore } from "@/lib/store/sellingStore"
import { Clock, CheckCircle2, XCircle} from "lucide-react"
import MerchantForm from "@/components/MerchantForm"
import { Loading } from "@/components/ui/loading"





export function ApplyMerchant() {
    const { user, profile } = useAuthStore()
    const { store, fetchStoreByUser, createStore, loading } = useSellingStore()
    const [merchantStatus, setMerchantStatus] = useState<"none" | "pending" | "approved" | "rejected">("none")

    // For image previews

    const [localLoading, setLocalLoading] = useState(false)

    // Check merchant status on mount
    useEffect(() => {
        if (!user) return;
        (async () => {
            setLocalLoading(true)
            try {
                await fetchStoreByUser(user.id)
                setLocalLoading(false)
            } catch (error: any) {
                toast.error(error?.message || "Something went wrong. Please try again.")
                setLocalLoading(false)
            }

        })()
    }, [user?.id, fetchStoreByUser])


    useEffect(() => {
        if (store) {
            // Use store.status if available, otherwise fallback to "pending"
            setMerchantStatus((store.status as any) || "pending")
        } else {
            setMerchantStatus("none")
        }
    }, [store])


    if (store) {
        let statusColor = "text-yellow-600"
        let statusText = "Your application is under review."
        let statusIcon = <Clock className="h-8 w-8 text-yellow-500" />
        let statusBg = "bg-yellow-50 border-yellow-200"
        let statusTitle = "Application Under Review"
        let dateText = store.created_at ? new Date(store.created_at).toLocaleString() : "-"
        let extraNote: JSX.Element | undefined = <span className="text-xs text-gray-500">Estimated review time: 24 hours</span>
        if (store.status === "active") {
            statusColor = "text-green-600"
            statusText = "Congratulations! Your merchant application has been approved. You can now access merchant features from your dashboard."
            statusIcon = <CheckCircle2 className="h-8 w-8 text-green-500" />
            statusBg = "bg-green-50 border-green-200"
            statusTitle = "Application Approved"
            extraNote = undefined
        } else if (store.status === "suspended" || store.status === "blocked") {
            statusColor = "text-red-600"
            statusText = "Your application was rejected or blocked. Please contact support for more information."
            statusIcon = <XCircle className="h-8 w-8 text-red-500" />
            statusBg = "bg-red-50 border-red-200"
            statusTitle = "Application Rejected/Blocked"
            extraNote = undefined
        }
        return (
            <Card className="w-full mx-auto mt-10 border-0 shadow-none">
                <CardHeader className="pb-2">
                    <CardTitle>Merchant Application</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`rounded-xl border ${statusBg} p-6 flex flex-col sm:flex-row items-center gap-6 mb-4`}>
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            {statusIcon}
                            <span className={`font-semibold ${statusColor}`}>{statusTitle}</span>
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-lg mb-1">Store: <span className="font-bold">{store.name}</span></div>
                            <div className="mb-1">Status: <span className={`font-bold capitalize ${statusColor}`}>{store.status || "pending"}</span></div>
                            <div className="mb-1 flex items-center gap-2 text-gray-500 text-sm">
                                <Clock className="h-4 w-4 inline-block mr-1" />
                                Applied: <span className="font-medium text-gray-700">{dateText}</span>
                            </div>
                            <div className="text-gray-600 mb-1">{statusText}</div>
                            {extraNote}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (localLoading) return <Loading text="Loading..." variant="pulse" />

    return (
        <Card className="w-full mt-10">
            <CardHeader>
                <CardTitle>Apply to Become a Merchant/Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <MerchantForm createStore={createStore} loading={loading} onSuccess={() => {
                 setMerchantStatus("pending")
              }} />
            </CardContent>
        </Card>
    )
}

export default function ApplyMerchantPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApplyMerchant />
        </Suspense>
    )
} 