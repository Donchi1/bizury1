"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, MoreHorizontal, Send, Paperclip, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store/auth"
import { format } from "date-fns"
import { useSellingStore } from "@/lib/store/sellingStore"
import { Loading } from "@/components/ui/loading"
import { Sheet, SheetContent,SheetTitle,SheetTrigger } from "@/components/ui/sheet"

export default function StoreMessagesPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [localLoading, setLocalLoading] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const {
    messages,
    fetchMessagesByStore,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    store,
    markMessageRead

  } = useSellingStore();


  // Get unique customers from messages
  const customers = Array.from(new Set(
    messages
      .filter(msg => msg.sender_id !== profile?.id)
      .map(msg => ({
        id: msg.sender_id,
        name: msg.sender_role === 'customer' ? `Customer ${msg.sender_id.slice(0, 5)}` : 'Merchant',
        lastMessage: msg.message,
        timestamp: msg.created_at,
        unread: !msg.is_read && msg.receiver_id === profile?.id
      }))
  ))

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get messages for selected customer
  const customerMessages = selectedCustomer
    ? messages.filter(
      msg =>
        (msg.sender_id === selectedCustomer && msg.receiver_id === profile?.id) ||
        (msg.receiver_id === selectedCustomer && msg.sender_id === profile?.id)
    )
    : []

  // Set first customer as selected by default
  useEffect(() => {
    if (filteredCustomers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(filteredCustomers[0].id)
    }
  }, [filteredCustomers, selectedCustomer])

  // Fetch messages and subscribe to updates
  useEffect(() => {
    if (!store) return
    const fetchMessages = async () => {
      setLocalLoading(true)
      await fetchMessagesByStore(store.id);
      await subscribeToMessages(store.id);
      setLocalLoading(false)
    }
    fetchMessages()
    return () => unsubscribeFromMessages();
  }, [store?.id]);

  console.log(store)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [customerMessages])

  // Mark messages as read when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      customerMessages
        .filter(msg => !msg.is_read && msg.receiver_id === profile?.id)
        .forEach(msg => markMessageRead(msg.id))
    }
  }, [selectedCustomer, customerMessages, markMessageRead, profile?.id])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || !profile?.id) return

    await sendMessage({
      sender_id: profile.id,
      receiver_id: selectedCustomer,
      sender_role: "merchant",
      receiver_role: "customer",
      message: newMessage,
      store_id: store?.id!
    })

    setNewMessage("")
  }

  if (localLoading) return <Loading text="Loading messages..." />
  return (
    <div className="flex h-[calc(100vh-8rem)] relative bg-white rounded-lg border">
      {/* Sidebar */}

      <div className="w-80 border-r flex-col hidden lg:flex">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`flex items-center p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedCustomer === customer.id ? 'bg-muted/30' : ''
                }`}
              onClick={() => setSelectedCustomer(customer.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{customer.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(customer.timestamp), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{customer.lastMessage}</p>
              </div>
              {customer.unread && (
                <div className="ml-2 w-2.5 h-2.5 bg-primary rounded-full"></div>
              )}
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            
            variant="outline"
            className="size-10 rounded-full left-0 top-[50%] -translate-y-1/2 translate-x-1/2 fixed bottom-[50%] shadow-lg z-10 lg:hidden flex items-center justify-center"
          >
            <Menu  />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          {/* Sidebar content copied here for mobile */}
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <SheetTitle className="text-xl font-semibold">Messages</SheetTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`flex items-center p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedCustomer === customer.id ? 'bg-muted/30' : ''
                    }`}
                  onClick={() => {
                    setSelectedCustomer(customer.id)
                    setIsMobileSidebarOpen(false) // Close sheet on select
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{customer.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(customer.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{customer.lastMessage}</p>
                  </div>
                  {customer.unread && (
                    <div className="ml-2 w-2.5 h-2.5 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations found
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>


      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {customers.find(c => c.id === selectedCustomer)?.name.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-medium">
                    {customers.find(c => c.id === selectedCustomer)?.name || 'Customer'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {customerMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${message.sender_id === profile?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                      }`}
                  >
                    <p>{message.message}</p>
                    <p
                      className={`text-xs mt-1 text-right ${message.sender_id === profile?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                        }`}
                    >
                      {format(new Date(message.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}