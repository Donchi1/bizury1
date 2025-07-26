"use client"

import { useState } from "react"
import { Save, Upload, Download, Globe, Mail, Shield, CreditCard, Bell, Palette, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "E-Commerce Platform",
    site_description: "Your one-stop shop for everything",
    site_url: "https://ecommerce.example.com",
    admin_email: "admin@example.com",
    support_email: "support@example.com",
    timezone: "UTC",
    currency: "USD",
    language: "en",
    maintenance_mode: false,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    stripe_enabled: true,
    stripe_public_key: "pk_test_...",
    stripe_secret_key: "sk_test_...",
    paypal_enabled: true,
    paypal_client_id: "paypal_client_id",
    paypal_secret: "paypal_secret",
    crypto_enabled: true,
    crypto_btc_enabled: true,
    crypto_usdt_enabled: true,
    crypto_eth_enabled: false,
    minimum_order_amount: 10.0,
    maximum_order_amount: 10000.0,
    tax_rate: 8.5,
    shipping_fee: 9.99,
    free_shipping_threshold: 100.0,
  })

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_username: "noreply@example.com",
    smtp_password: "app_password",
    smtp_encryption: "tls",
    from_name: "E-Commerce Platform",
    from_email: "noreply@example.com",
    order_confirmation_enabled: true,
    shipping_notification_enabled: true,
    marketing_emails_enabled: true,
    newsletter_enabled: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_required: true,
    session_timeout: 30,
    max_login_attempts: 5,
    lockout_duration: 15,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: true,
    ip_whitelist_enabled: false,
    ip_whitelist: "",
    fraud_detection_enabled: true,
    auto_block_threshold: 90,
    manual_review_threshold: 70,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    new_order_notifications: true,
    low_stock_notifications: true,
    new_user_notifications: true,
    security_alert_notifications: true,
    system_maintenance_notifications: true,
    daily_reports: true,
    weekly_reports: true,
    monthly_reports: true,
    slack_webhook_url: "",
    discord_webhook_url: "",
    telegram_bot_token: "",
    telegram_chat_id: "",
  })

  const handleSaveSettings = async (settingsType: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings Saved",
        description: `${settingsType} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  const handleBackupDatabase = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Backup Created",
        description: "Database backup has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create database backup.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackupDatabase}>
            <Database className="h-4 w-4 mr-2" />
            Backup Database
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={generalSettings.site_name}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    value={generalSettings.site_url}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, site_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={generalSettings.admin_email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, admin_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={generalSettings.site_description}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={generalSettings.maintenance_mode}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenance_mode: checked })}
                />
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              </div>
              <Button onClick={() => handleSaveSettings("General")}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="stripe_enabled"
                    checked={paymentSettings.stripe_enabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, stripe_enabled: checked })}
                  />
                  <Label htmlFor="stripe_enabled" className="text-lg font-medium">
                    Stripe
                  </Label>
                </div>
                {paymentSettings.stripe_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripe_public_key">Public Key</Label>
                      <Input
                        id="stripe_public_key"
                        value={paymentSettings.stripe_public_key}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_public_key: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe_secret_key">Secret Key</Label>
                      <Input
                        id="stripe_secret_key"
                        type="password"
                        value={paymentSettings.stripe_secret_key}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_secret_key: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* PayPal Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="paypal_enabled"
                    checked={paymentSettings.paypal_enabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, paypal_enabled: checked })}
                  />
                  <Label htmlFor="paypal_enabled" className="text-lg font-medium">
                    PayPal
                  </Label>
                </div>
                {paymentSettings.paypal_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="paypal_client_id">Client ID</Label>
                      <Input
                        id="paypal_client_id"
                        value={paymentSettings.paypal_client_id}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, paypal_client_id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal_secret">Secret</Label>
                      <Input
                        id="paypal_secret"
                        type="password"
                        value={paymentSettings.paypal_secret}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, paypal_secret: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Crypto Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="crypto_enabled"
                    checked={paymentSettings.crypto_enabled}
                    onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, crypto_enabled: checked })}
                  />
                  <Label htmlFor="crypto_enabled" className="text-lg font-medium">
                    Cryptocurrency
                  </Label>
                </div>
                {paymentSettings.crypto_enabled && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="crypto_btc_enabled"
                        checked={paymentSettings.crypto_btc_enabled}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, crypto_btc_enabled: checked })
                        }
                      />
                      <Label htmlFor="crypto_btc_enabled">Bitcoin (BTC)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="crypto_usdt_enabled"
                        checked={paymentSettings.crypto_usdt_enabled}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, crypto_usdt_enabled: checked })
                        }
                      />
                      <Label htmlFor="crypto_usdt_enabled">Tether (USDT)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="crypto_eth_enabled"
                        checked={paymentSettings.crypto_eth_enabled}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, crypto_eth_enabled: checked })
                        }
                      />
                      <Label htmlFor="crypto_eth_enabled">Ethereum (ETH)</Label>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
                    <Input
                      id="minimum_order_amount"
                      type="number"
                      step="0.01"
                      value={paymentSettings.minimum_order_amount}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          minimum_order_amount: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximum_order_amount">Maximum Order Amount</Label>
                    <Input
                      id="maximum_order_amount"
                      type="number"
                      step="0.01"
                      value={paymentSettings.maximum_order_amount}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          maximum_order_amount: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.1"
                      value={paymentSettings.tax_rate}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, tax_rate: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_fee">Shipping Fee</Label>
                    <Input
                      id="shipping_fee"
                      type="number"
                      step="0.01"
                      value={paymentSettings.shipping_fee}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, shipping_fee: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free_shipping_threshold">Free Shipping Threshold</Label>
                    <Input
                      id="free_shipping_threshold"
                      type="number"
                      step="0.01"
                      value={paymentSettings.free_shipping_threshold}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          free_shipping_threshold: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("Payment")}>
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={emailSettings.smtp_username}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_encryption">Encryption</Label>
                  <Select
                    value={emailSettings.smtp_encryption}
                    onValueChange={(value) => setEmailSettings({ ...emailSettings, smtp_encryption: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("Email")}>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="order_confirmation_enabled"
                    checked={emailSettings.order_confirmation_enabled}
                    onCheckedChange={(checked) =>
                      setEmailSettings({ ...emailSettings, order_confirmation_enabled: checked })
                    }
                  />
                  <Label htmlFor="order_confirmation_enabled">Order Confirmation Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shipping_notification_enabled"
                    checked={emailSettings.shipping_notification_enabled}
                    onCheckedChange={(checked) =>
                      setEmailSettings({ ...emailSettings, shipping_notification_enabled: checked })
                    }
                  />
                  <Label htmlFor="shipping_notification_enabled">Shipping Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="marketing_emails_enabled"
                    checked={emailSettings.marketing_emails_enabled}
                    onCheckedChange={(checked) =>
                      setEmailSettings({ ...emailSettings, marketing_emails_enabled: checked })
                    }
                  />
                  <Label htmlFor="marketing_emails_enabled">Marketing Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="newsletter_enabled"
                    checked={emailSettings.newsletter_enabled}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, newsletter_enabled: checked })}
                  />
                  <Label htmlFor="newsletter_enabled">Newsletter</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="two_factor_required"
                  checked={securitySettings.two_factor_required}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, two_factor_required: checked })
                  }
                />
                <Label htmlFor="two_factor_required">Require Two-Factor Authentication</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={securitySettings.session_timeout}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, session_timeout: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, max_login_attempts: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout_duration"
                    type="number"
                    value={securitySettings.lockout_duration}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, lockout_duration: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Minimum Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={securitySettings.password_min_length}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, password_min_length: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("Security")}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="fraud_detection_enabled"
                  checked={securitySettings.fraud_detection_enabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, fraud_detection_enabled: checked })
                  }
                />
                <Label htmlFor="fraud_detection_enabled">Enable Fraud Detection</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auto_block_threshold">Auto-Block Threshold</Label>
                  <Input
                    id="auto_block_threshold"
                    type="number"
                    value={securitySettings.auto_block_threshold}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        auto_block_threshold: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual_review_threshold">Manual Review Threshold</Label>
                  <Input
                    id="manual_review_threshold"
                    type="number"
                    value={securitySettings.manual_review_threshold}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        manual_review_threshold: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new_order_notifications"
                    checked={notificationSettings.new_order_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, new_order_notifications: checked })
                    }
                  />
                  <Label htmlFor="new_order_notifications">New Order Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="low_stock_notifications"
                    checked={notificationSettings.low_stock_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, low_stock_notifications: checked })
                    }
                  />
                  <Label htmlFor="low_stock_notifications">Low Stock Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="security_alert_notifications"
                    checked={notificationSettings.security_alert_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, security_alert_notifications: checked })
                    }
                  />
                  <Label htmlFor="security_alert_notifications">Security Alert Notifications</Label>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("Notification")}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack_webhook_url">Slack Webhook URL</Label>
                <Input
                  id="slack_webhook_url"
                  value={notificationSettings.slack_webhook_url}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, slack_webhook_url: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discord_webhook_url">Discord Webhook URL</Label>
                <Input
                  id="discord_webhook_url"
                  value={notificationSettings.discord_webhook_url}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, discord_webhook_url: e.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Favicon Upload</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Favicon
                  </Button>
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("Appearance")}>
                <Save className="h-4 w-4 mr-2" />
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
