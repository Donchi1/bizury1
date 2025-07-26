"use client"

import { useState, useEffect } from "react"
import { Mail, MapPin, Phone, Mail as MailIcon, MessageSquare, DollarSign, QrCode, Save, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useContentStore } from "@/lib/store/admin/contentStore"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/lib/store/auth"
import InnerLoading from "@/components/layout/InnerLoading"
import { FileUpload } from "@/components/FileUpload"
import Link from "next/link"
import { ButtonLoading } from "@/components/ui/loading"

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("notifications")
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)

  const [filePreviews, setFilePreviews] = useState<{
    usdt_wallet_trc20?: { file: File; preview: string };
    usdt_wallet_erc20?: { file: File; preview: string };
    qr_paypal?: { file: File; preview: string };
    btc_wallet?: { file: File; preview: string };
    eth_wallet?: { file: File; preview: string };

  }>({});

  const {
    notifications,
    selectedNotification,
    isEditing,
    contactInfo,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    setSelectedNotification,
    setIsEditing,
    isLoading,
    fetchContactInfo,
    updateContactInfo,
    setContactInfo
  } = useContentStore()

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "announcement",
    target: "all_users"
  })

  useEffect(() => {
    LoadNotificationsAndContactInfo()
  }, [fetchNotifications, fetchContactInfo])

  const LoadNotificationsAndContactInfo = async () => {
    try {
      setLocalLoading(true)
      await fetchNotifications()
      await fetchContactInfo()
      setLocalLoading(false)
    } catch (error) {
      toast.error('Failed to load notifications and contact info')
      setLocalLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      // Clean up object URLs to avoid memory leaks
      Object.values(filePreviews).forEach(preview => {
        if (preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [filePreviews])

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { target, ...rest } = notificationForm
      if (isEditing && selectedNotification?.id) {
        await updateNotification(selectedNotification.id, { ...rest, data: { target } })
      } else {
        await createNotification({ ...rest, data: { target }, user_id: user?.id! })
        setNotificationForm({
          title: "",
          message: "",
          type: "announcement",
          target: "all_users"
        })
      }
      setIsEditing(false)
      setSelectedNotification(null)
    } catch (error) {
      toast.error('Failed to submit notification')
    }
  }

  const handleEditNotification = (notification: any) => {
    setSelectedNotification(notification)
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      target: notification.target
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedNotification(null)
    setNotificationForm({
      title: "",
      message: "",
      type: "announcement",
      target: "all_users"
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should be less than 2MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviews(prev => ({
      ...prev,
      [field]: { file, preview: previewUrl }
    }));
  };


  const handleContactInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let updatedInfo = { ...contactInfo };

      // Upload new files if any
      for (const [field, fileData] of Object.entries(filePreviews)) {
        if (fileData) {
          const filePath = `qr-codes/${field}_${Date.now()}.${fileData.file.name.split('.').pop()}`;

          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('contacts')
            .upload(filePath, fileData.file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('contacts')
            .getPublicUrl(filePath);

          // Update the corresponding field
          updatedInfo = {
            ...updatedInfo,
            [`${field}`]: publicUrl
          };

          // Clean up the preview URL
          URL.revokeObjectURL(fileData.preview);
        }
      }

      // Update contact info with all changes
      await updateContactInfo(updatedInfo);

      // Clear file previews
      setFilePreviews({});

      toast.success('Contact information updated successfully');
    } catch (error) {
      toast.error('Failed to update contact information');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "read":
        return "bg-green-100 text-green-800"
      case "unread":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (localLoading) return <InnerLoading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600">Manage notifications and company contact information</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 h-auto ">
          <TabsTrigger value="contact">
            <MapPin className="h-4 w-4 mr-2" />
            Contact Information
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Mail className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Contact Information</CardTitle>
              <CardDescription>Update your company's contact details and payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Address</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <Input
                        value={contactInfo?.address}
                        onChange={(e) => setContactInfo({ ...contactInfo!, address: e.target.value })}
                        placeholder="Company Address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <Input
                        value={contactInfo?.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo!, phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <Input
                        type="email"
                        value={contactInfo?.email}
                        onChange={(e) => setContactInfo({ ...contactInfo!, email: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp Number</label>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <Input
                        value={contactInfo?.whatsapp}
                        onChange={(e) => setContactInfo({ ...contactInfo!, whatsapp: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">USDT (TRC20) Address</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            value={contactInfo?.wallet_trc20_code}
                            onChange={(e) => setContactInfo({ ...contactInfo!, wallet_trc20_code: e.target.value })}
                            placeholder="TRC20 Wallet Address"
                          />
                        </div>
                      </div>
                      <FileUpload
                        id="usdt_wallet_trc20"
                        label="QR Code (TRC20)"
                        previewUrl={contactInfo?.usdt_wallet_trc20}
                        filePreview={filePreviews.usdt_wallet_trc20}
                        onFileChange={(e) => handleFileChange(e, 'usdt_wallet_trc20')}
                        onRemove={() => {
                          URL.revokeObjectURL(filePreviews.usdt_wallet_trc20?.preview || '');
                          setFilePreviews(prev => ({ ...prev, usdt_wallet_trc20: undefined }));
                          updateContactInfo({ ...contactInfo, usdt_wallet_trc20: '' });
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">USDT (ERC20) Address</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            value={contactInfo?.wallet_erc20_code}
                            onChange={(e) => setContactInfo({ ...contactInfo!, wallet_erc20_code: e.target.value })}
                            placeholder="ERC20 Wallet Address"
                          />
                        </div>
                      </div>
                      <FileUpload
                        id="usdt_wallet_erc20"
                        label="QR Code (ERC20)"
                        previewUrl={contactInfo?.usdt_wallet_erc20}
                        filePreview={filePreviews.usdt_wallet_erc20}
                        onFileChange={(e) => handleFileChange(e, 'usdt_wallet_erc20')}
                        onRemove={() => {
                          URL.revokeObjectURL(filePreviews.usdt_wallet_erc20?.preview || '');
                          setFilePreviews(prev => ({ ...prev, usdt_wallet_erc20: undefined }));
                          updateContactInfo({ ...contactInfo, usdt_wallet_erc20: '' });
                        }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">BTC Address</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            value={contactInfo?.btc_wallet_code}
                            onChange={(e) => setContactInfo({ ...contactInfo!, btc_wallet_code: e.target.value })}
                            placeholder="BTC Wallet Address"
                          />
                        </div>
                      </div>
                      <FileUpload
                        id="btc_wallet"
                        label="QR Code (BTC)"
                        previewUrl={contactInfo?.btc_wallet}
                        filePreview={filePreviews.btc_wallet}
                        onFileChange={(e) => handleFileChange(e, 'btc_wallet')}
                        onRemove={() => {
                          URL.revokeObjectURL(filePreviews.btc_wallet?.preview || '');
                          setFilePreviews(prev => ({ ...prev, btc_wallet: undefined }));
                          updateContactInfo({ ...contactInfo, btc_wallet: '' });
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ETH Address</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            value={contactInfo?.eth_wallet_code}
                            onChange={(e) => setContactInfo({ ...contactInfo!, eth_wallet_code: e.target.value })}
                            placeholder="ETH Wallet Address"
                          />
                        </div>
                      </div>
                      <FileUpload
                        id="eth_wallet"
                        label="QR Code (ETH)"
                        previewUrl={contactInfo?.eth_wallet}
                        filePreview={filePreviews.eth_wallet}
                        onFileChange={(e) => handleFileChange(e, 'eth_wallet')}
                        onRemove={() => {
                          URL.revokeObjectURL(filePreviews.eth_wallet?.preview || '');
                          setFilePreviews(prev => ({ ...prev, eth_wallet: undefined }));
                          updateContactInfo({ ...contactInfo, eth_wallet: '' });
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">PayPal Email/ID</label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            value={contactInfo?.paypal}
                            onChange={(e) => setContactInfo({ ...contactInfo!, paypal: e.target.value })}
                            placeholder="PayPal Email/ID"
                          />
                        </div>
                      </div>
                      <FileUpload
                        id="qr_paypal"
                        label="QR Code (PayPal)"
                        previewUrl={contactInfo?.qr_paypal}
                        filePreview={filePreviews.qr_paypal}
                        onFileChange={(e) => handleFileChange(e, 'qr_paypal')}
                        onRemove={() => {
                          URL.revokeObjectURL(filePreviews.qr_paypal?.preview || '');
                          setFilePreviews(prev => ({ ...prev, qr_paypal: undefined }));
                          updateContactInfo({ ...contactInfo, qr_paypal: '' });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit">
                    {isLoading ?
                      <ButtonLoading text="Saving..." />
                      :
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    }
                  </Button>

                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{isEditing ? 'Edit Notification' : 'Create New Notification'}</CardTitle>
                    <CardDescription>Send a notification to all users</CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit} className="space-y-4">

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Title</label>
                    <Input
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      placeholder="Enter notification title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      placeholder="Enter your message here..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="update">Update</option>
                        <option value="alert">Alert</option>
                        <option value="promotion">Promotion</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Audience</label>
                      <select
                        value={notificationForm.target}
                        onChange={(e) => setNotificationForm({ ...notificationForm, target: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="all_users">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="suspended">Suspended Users</option>
                        <option value="pending">Pending Users</option>
                        <option value="blocked">Blocked Users</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={isUploading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update' : 'Send'} Notification
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>View previously sent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start flex-col md:flex-row">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2 flex-col md:flex-row">
                            <Badge variant="outline">{notification.type}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {notification.data?.target || 'all_users'}
                            </Badge>
                            <Badge className={getStatusColor(notification.is_read ? 'Read' : 'Unread')} variant="secondary">
                              {notification.is_read ? 'Read' : 'Unread'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.created_at || '').toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => handleEditNotification(notification)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600"
                            onClick={() => deleteNotification(notification.id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/notifications">
                      View All Notifications
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
