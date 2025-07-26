"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Store, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useCustomerMessageStore, CustomerMessage } from "@/lib/store/customerMessageStore"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/lib/store/auth"
import { Loading } from "@/components/ui/loading"

export default function MessagesPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    markAsRead,
    subscribeToMessages,
    unsubscribe,
  } = useCustomerMessageStore()
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [merchantProfiles, setMerchantProfiles] = useState<Record<string, any>>({})
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [localLoading, setLocalLoading] = useState(true)

  // Redirect merchants
  // useEffect(() => {
  //   if (profile?.role === "merchant" || profile?.role === "admin" || profile?.role === "manager") {
  //     router.push("/dashboard/shop/messages")
  //   }
  // }, [profile, router])

  // Fetch messages and subscribe
  useEffect(() => {
    if (!profile) return
      const fetchMessagesAndSubscribe = async () => {
        setLocalLoading(true)
        await fetchMessages(profile.id)
        subscribeToMessages(profile.id)
        setLocalLoading(false)
      }
      fetchMessagesAndSubscribe()
      return () => unsubscribe()
  }, [profile?.id])

  // Group messages by merchant (other party)
  const merchantConvos = messages
    .filter(m => m.sender_role === "merchant" || m.receiver_role === "merchant")
    .map(m => (m.sender_role === "merchant" ? m.sender_id : m.receiver_id))
  const uniqueMerchants = Array.from(new Set(merchantConvos))

  // Fetch merchant profiles for sidebar
  useEffect(() => {
    const fetchProfiles = async () => {
      const ids = uniqueMerchants.filter(id => !merchantProfiles[id])
      if (ids.length > 0) {
        const { data, error } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", ids)
        if (!error && data) {
          setMerchantProfiles(prev => ({ ...prev, ...Object.fromEntries(data.map((p: any) => [p.id, p])) }))
        }
      }
    }
    fetchProfiles()
    // eslint-disable-next-line
  }, [uniqueMerchants.join(",")])

  // Filter messages for selected merchant
  const chatMessages = selectedMerchant
    ? messages.filter(
        m =>
          (m.sender_id === selectedMerchant && m.receiver_id === profile?.id) ||
          (m.receiver_id === selectedMerchant && m.sender_id === profile?.id)
      )
    : []

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length])

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() || !selectedMerchant || !profile) return
    await sendMessage({
      sender_id: profile.id,
      receiver_id: selectedMerchant,
      sender_role: "customer",
      receiver_role: "merchant",
      message: messageInput.trim(),
      order_id: undefined,
      store_id: undefined,
    })
    setMessageInput("")
  }

  // Mark as read when opening chat
  useEffect(() => {
    if (selectedMerchant) {
      chatMessages.forEach(m => {
        if (!m.is_read && m.receiver_id === profile?.id) markAsRead(m.id)
      })
    }
    // eslint-disable-next-line
  }, [selectedMerchant, chatMessages.length])

  // UI
  if (localLoading) return <Loading text="Loading messages..." />

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
      {/* Sidebar: Conversations */}
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/50 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Merchants</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin" /></div>
        ) : uniqueMerchants.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="mx-auto mb-2 h-8 w-8" />
            <div>No merchant messages yet.</div>
          </div>
        ) : (
          <ul className="space-y-2">
            {uniqueMerchants.map(mid => {
              const merchant = merchantProfiles[mid]
              const unread = messages.some(m => !m.is_read && m.sender_id === mid && m.receiver_id === profile?.id)
              return (
                <li key={mid}>
                  <button
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-primary/10 ${selectedMerchant === mid ? "bg-primary/10" : ""}`}
                    onClick={() => setSelectedMerchant(mid)}
                  >
                    <Avatar className="mr-3">
                      <AvatarImage src={merchant?.avatar_url || undefined} alt={merchant?.full_name || "Merchant"} />
                      <AvatarFallback>{merchant?.full_name?.[0] || "M"}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left">{merchant?.full_name || "Merchant"}</span>
                    {unread && <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full">
        {selectedMerchant ? (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center border-b px-4 py-3 bg-background/80">
              <Avatar className="mr-3">
                <AvatarImage src={merchantProfiles[selectedMerchant]?.avatar_url || undefined} alt={merchantProfiles[selectedMerchant]?.full_name || "Merchant"} />
                <AvatarFallback>{merchantProfiles[selectedMerchant]?.full_name?.[0] || "M"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{merchantProfiles[selectedMerchant]?.full_name || "Merchant"}</div>
                <div className="text-xs text-muted-foreground">Merchant</div>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-background" style={{ minHeight: 0 }}>
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  <div>No messages yet. Start the conversation!</div>
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.sender_id === profile?.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <div className="text-sm whitespace-pre-line">{msg.message}</div>
                        <div className="text-xs text-muted-foreground mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message input */}
            <form
              className="flex items-center border-t px-4 py-3 bg-background"
              onSubmit={e => {
                e.preventDefault()
                handleSend()
              }}
            >
              <input
                className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring"
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                disabled={loading}
                autoFocus
              />
              <Button type="submit" disabled={loading || !messageInput.trim()} size="icon">
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div>
              <MessageSquare className="mx-auto mb-2 h-10 w-10" />
              <div>Select a merchant to start chatting.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
