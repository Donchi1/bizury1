"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Edit, Save, Lock, Shield, Eye, EyeOff, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store/auth"
import { profileSchema, type ProfileFormData } from "@/lib/validations"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { updateProfile, updatePassword } from "@/lib/auth"
import { formatDate } from "date-fns"
import { Factor, User } from "@supabase/supabase-js"
import InnerLoading from "@/components/layout/InnerLoading"
import { toast } from "sonner"



const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const { profile, setProfile } = useAuthStore()
  const { toast } = useToast()
  const [imageFile, setImageFile] = useState<File | null>(null)
  //const [previewUrl, setPreviewUrl] = useState<string | null>(null)


  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url,
      username: profile?.username || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      country: profile?.country || "",
      postal_code: profile?.postal_code || "",
      preferred_currency: profile?.preferred_currency || "",
      language: profile?.language || "",
      date_of_birth: profile?.date_of_birth || "",
      gender: profile?.gender || undefined,
    },
  })


  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)


    try {
      if (imageFile) {
        const { data: uploadData, error } = await supabase.storage
          .from("avatars")
          .upload(`user-${profile?.id}/${imageFile.name}`, imageFile, { upsert: true })

        if (error) {
          toast({ title: "Upload failed", description: error.message })
          setIsLoading(false)
          return
        }

        if (!uploadData) {
          toast({ title: "No upload data returned" })
          setIsLoading(false)
          return
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path)
        data.avatar_url = publicUrlData.publicUrl
      }

      // Save avatarUrlToSave to profile
      const updated = await updateProfile(profile?.id!, data)
      setProfile(updated)
      toast({ title: "Profile updated", description: "Your profile has been updated successfully" })
      setIsLoading(false)
      onClose()
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "An error occurred while updating the profile" })
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setImageFile(file)
      //setPreviewUrl(URL.createObjectURL(file))
      // Optionally, update the form value for immediate preview
      form.setValue("avatar_url", URL.createObjectURL(file))
    }
  }

  // Dynamic field config
  const profileFields = [
    { name: "full_name", label: "Full Name", placeholder: "Enter your full name", type: "text" },
    { name: "username", label: "Username", placeholder: "Enter your username", type: "text" },
    { name: "email", label: "Email Address", placeholder: "Enter your email", type: "email", disabled: true },
    { name: "phone", label: "Phone Number", placeholder: "Enter your phone number", type: "text" },
    // Address row
    [
      { name: "address", label: "Address", placeholder: "Address", type: "text", className: "flex-2" },
      { name: "city", label: "City", placeholder: "City", type: "text", className: "flex-1" },
      { name: "state", label: "State", placeholder: "State", type: "text", className: "flex-1" },
    ],
    [
      { name: "country", label: "Country", placeholder: "Country", type: "text", className: "flex-1" },
      { name: "postal_code", label: "Postal Code", placeholder: "Postal Code", type: "text", className: "flex-1" },
    ],
    { name: "preferred_currency", label: "Preferred Currency", placeholder: "e.g. USD, EUR, KHR", type: "text" },
    { name: "language", label: "Language", placeholder: "e.g. en, fr, zh", type: "text" },
    { name: "date_of_birth", label: "Date of Birth", placeholder: "", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: ["", "male", "female", "other"] },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] ">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal information and contact details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={form.watch("avatar_url")} />
                <AvatarFallback className="text-xl">{form.watch("full_name")?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm">
                  <label htmlFor="photo" className="flex items-center gap-2 cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                    <input type="file" id="photo" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </Button>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
            {/* Dynamic fields rendering */}
            <div className="space-y-4">
              {profileFields.map((field, idx) => {
                if (Array.isArray(field)) {
                  // Render horizontal row for grouped fields
                  return (
                    <div key={idx} className="flex flex-col lg:flex-row gap-4">
                      {field.map((f) => (
                        <FormField
                          key={f.name}
                          control={form.control}
                          name={f.name as any}
                          render={({ field }) => (
                            <FormItem className={f.className || "flex-1"}>
                              <FormLabel>{f.label}</FormLabel>
                              <FormControl>
                                <Input type={f.type} placeholder={f.placeholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )
                }
                if (field.type === "select") {
                  return (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name as any}
                      render={({ field: selectField }) => (
                        <FormItem>
                          <FormLabel>{field.label}</FormLabel>
                          <Select
                            onValueChange={selectField.onChange}
                            defaultValue={selectField.value || ""}
                          //value={typeof selectField.value === "boolean" ? "" : (typeof selectField.value === "string" ? selectField.value : (selectField.value ? String(selectField.value) : ""))}
                          //className="input input-bordered w-full"
                          >
                            <FormControl>
                              <SelectTrigger className="w-full ">
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
                return (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: inputField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            {...inputField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const profile = useAuthStore((state) => state.profile)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      if (!profile) {
        toast.error("Profile not found",{
          description: "Please log in again to change your password."
        })
        setIsLoading(false)
        return
      }

      await updatePassword(profile.email, data.currentPassword, data.newPassword, () => {
        setIsLoading(false)
        toast.success("Password changed",{
          description: "Your password has been successfully updated.",
        })
        form.reset()
        onClose()
      })

    } catch (error: any) {
      console.log(error)
      toast.error("Password change failed",{
        description: error.message || "Failed to change password. Please try again.",
      })
      setIsLoading(false)
      form.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Enter your current password and choose a new one</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function Disable2FAModal({ isOpen, onClose, onDisable, isLoading }: { isOpen: boolean; onClose: () => void; onDisable: () => void; isLoading: boolean }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Are you sure you want to disable 2FA? This will remove extra protection from your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="destructive" onClick={onDisable} disabled={isLoading}>
            {isLoading ? "Disabling..." : "Disable 2FA"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TwoFactorModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void, user: User }) {
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasExistingFactors, setHasExistingFactors] = useState(false)




  // Start enrollment when modal opens
  useEffect(() => {
    if (isOpen && step === "setup") {
      (async () => {
        setIsLoading(true)
        try {
          // 1. List factors
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const allFactors = factorsData?.all || [];
          setHasExistingFactors(allFactors.length > 0);
          // for (const factor of allFactors) {
          //   await supabase.auth.mfa.unenroll({ factorId: factor.id });
          // }
          // 3. Enroll new TOTP
          const uniqueName = `Authenticator ${Date.now()}`;
          const { data, error } = await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: uniqueName,
          });
          if (error) throw error
          setQrCode(data.totp.qr_code)
          setTotpSecret(data.totp.secret)
          setFactorId(data.id)
        } catch (error: any) {
          toast.error("2FA Setup Failed",{
            description: error.message || "Could not start 2FA enrollment."
          })
          onClose()
        } finally {
          setIsLoading(false)
        }
      })()
    } else if (!isOpen) {
      setQrCode(null)
      setTotpSecret(null)
      setFactorId(null)
      setVerificationCode("")
      setStep("setup")
      setIsLoading(false)
      setHasExistingFactors(false)
    }
  }, [isOpen, step, onClose])

  const handleVerify = async (callback: () => void) => {
    if (!factorId) return;
    if (verificationCode.length !== 6) {
      toast.error("Invalid code",{
        description: "Please enter a 6-digit verification code" });
      return;
    }
    setIsLoading(true);
    try {
      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        throw challengeError
      }
      callback()
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) {
        toast("Verification failed",{
          description: verifyError.message || "Invalid verification code. Please try again.",
        });
        return; // This is OK, because finally will still run
      }

    } catch (error: any) {
      toast("Verification failed",{
        description: error.message || "Invalid verification code. Please try again.",
      });
    } finally {
      setIsLoading(false); // This will always run, even after a return in try/catch
    }
  };

  // Copy secret to clipboard
  const handleCopySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret)
      toast("Copied!", {description: "Authenticator code copied to clipboard." })
    }
  }
  const verifyCallback = async () => {
    setIsLoading(false)
    toast("2FA enabled",{
      description: "Two-factor authentication has been successfully enabled.",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {hasExistingFactors ? "Update Two-Factor Authentication" : "Enable Two-Factor Authentication"}
          </DialogTitle>
          <DialogDescription>
            {step === "setup"
              ? hasExistingFactors
                ? "You already have 2FA enabled. You can update your authenticator app by setting up a new one."
                : "Scan the QR code with your authenticator app"
              : "Enter the verification code from your authenticator app"}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" ? (
          <div className="space-y-4">
            <div className="text-center">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
              ) : (
                <div className="h-32 flex items-center justify-center">Loading QR...</div>
              )}
              <p className="text-sm text-gray-600 mb-2">
                Scan this QR code with Google Authenticator, Authy, or another TOTP app
              </p>
              {totpSecret && (
                <div className="flex flex-col items-center mt-2">
                  <span className="text-xs text-gray-500 mb-1">Can't scan? Enter this code manually:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 py-[11px] px-2 rounded text-xs font-mono select-all">{totpSecret}</code>
                    <Button type="button" size="icon" variant={"ghost"} className="bg-gray-100" onClick={handleCopySecret}>
                      <Copy />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={() => setStep("verify")} className="w-full" disabled={!qrCode || isLoading}>
              {hasExistingFactors ? "Update 2FA" : "Setup 2FA"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep("setup")} className="flex-1" disabled={isLoading}>
                Back
              </Button>
              <Button onClick={() => handleVerify(verifyCallback)} disabled={isLoading || verificationCode.length !== 6} className="flex-1">
                {isLoading ? (hasExistingFactors ? "Updating..." : "Verifying...") : (hasExistingFactors ? "Update 2FA" : "Verify & Enable")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function WithdrawalPinModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [pin, setPin] = useState(["", "", "", ""])
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""])
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [isLoading, setIsLoading] = useState(false)
  const { profile, setProfile } = useAuthStore()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const currentPin = isConfirm ? [...confirmPin] : [...pin]
    currentPin[index] = value

    if (isConfirm) {
      setConfirmPin(currentPin)
    } else {
      setPin(currentPin)
    }

    if (value && index < 3) {
      const nextInput = inputRefs.current[index + 1 + (isConfirm ? 4 : 0)]
      nextInput?.focus()
    }

    if (index === 3 && value && currentPin.every((digit) => digit)) {
      if (!isConfirm && step === "enter") {
        setTimeout(() => setStep("confirm"), 100)
      }
      // Removed auto-submit for confirm step
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm = false) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      const prevInput = inputRefs.current[index - 1 + (isConfirm ? 4 : 0)]
      prevInput?.focus()
    }
  }

  const handleSubmit = async () => {
    const pinString = pin.join("")
    const confirmPinString = confirmPin.join("")

    if (pinString.length !== 4) {
      toast.error("Invalid PIN",{
        description: "PIN must be 4 digits"
      })
      return
    }

    if (step === "confirm" && pinString !== confirmPinString) {
      toast("PINs don't match",{
        description: "Please make sure both PINs are identical"
      })
      setStep("enter")
      setPin(["", "", "", ""])
      setConfirmPin(["", "", "", ""])
      return
    }

    setIsLoading(true)
    try {
      const data = await updateProfile(profile?.id!, { withdrawal_pin: pinString })
      if (data) {
        setProfile(data)
      }
      toast("PIN set successfully",{
        description: "Your withdrawal PIN has been set and is now active.",
      })
      setPin(["", "", "", ""])
      setConfirmPin(["", "", "", ""])
      setStep("enter")
      onClose()
    } catch (error: any) {
      toast( "Failed to set PIN",{
        description: error?.message || "Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Set Withdrawal PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {step === "enter" && (
            <>
              <p className="text-sm text-gray-600">Enter a 4-digit PIN for withdrawals</p>
              <div className="flex space-x-2 justify-center">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-2xl text-center border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={digit}
                    onChange={e => handlePinChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </>
          )}
          {step === "confirm" && (
            <>
              <p className="text-sm text-gray-600">Confirm your 4-digit PIN</p>
              <div className="flex space-x-2 justify-center">
                {confirmPin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx + 4] = el }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-2xl text-center border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={digit}
                    onChange={e => handlePinChange(idx, e.target.value, true)}
                    onKeyDown={e => handleKeyDown(idx, e, true)}
                    disabled={isLoading}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || confirmPin.some((digit) => !digit)}
                >
                  {isLoading ? "Setting PIN..." : "Confirm PIN"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AccountPage() {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const { profile, user, loading, setProfile } = useAuthStore()
  const [disable2FAModalOpen, setDisable2FAModalOpen] = useState(false);
  const [disable2FALoading, setDisable2FALoading] = useState(false);
  const [totpFactors, setTotpFactors] = useState<Factor[]>([])



  useEffect(() => {
    if(!user) return 
    (async () => {
      const { error, data } = await supabase.auth.mfa.listFactors()
      if (error) throw new Error(error.message);
      const verifiedFactors = data.totp.filter(
        (f) => f.status === "verified"
      );
      setTotpFactors(verifiedFactors);

    })()
  }, [profile?.id, user?.updated_at, user?.factors?.length, twoFactorModalOpen, disable2FAModalOpen, totpFactors.length])



  const handleDisable2FA = async () => {
    setDisable2FALoading(true);
    try {
      if (totpFactors.length < 1) throw new Error("No user or factors found");
      for (const factor of totpFactors) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) {
          toast("Error", {description: error.message });
          setDisable2FAModalOpen(false);
          return;
        }
      }
      toast.success( "2FA Disabled", {description: "Two-factor authentication has been disabled." });
      setDisable2FAModalOpen(false);
    } catch (error: any) {
      toast.error("Error", {description: error.message });
      setDisable2FAModalOpen(false)
    } finally {
      setDisable2FALoading(false);
    }
  };

  if (loading) return <InnerLoading />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Account Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accountStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </div>
            <Button onClick={() => setEditModalOpen(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">{profile?.full_name || "User"}</h3>
                <p className="text-gray-600">{profile?.username}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                    {profile?.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {profile?.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg">{profile?.full_name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg">{profile?.phone || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <p className="text-lg">{profile?.is_verified ? "Verified" : "Pending Verification"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-600">Last changed {formatDate(new Date(profile?.updated_at! || new Date()), "PPP")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (totpFactors.length > 0) {
                  setDisable2FAModalOpen(true);
                } else {
                  setTwoFactorModalOpen(true);
                }
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              {totpFactors.length > 0 ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">4-Digit Withdrawal PIN</h4>
              <p className="text-sm text-gray-600">
                {profile?.withdrawal_pin ? "PIN is set and active" : "No PIN set - withdrawals disabled"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPinModalOpen(true)}>
              {profile?.withdrawal_pin ? "Change PIN" : "Set PIN"}
            </Button>
          </div>

          {profile?.withdrawal_pin && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>PIN Active:</strong> Your withdrawal PIN is set and required for all withdrawal requests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />
      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <TwoFactorModal user={user!} isOpen={twoFactorModalOpen} onClose={() => setTwoFactorModalOpen(false)} />
      <WithdrawalPinModal isOpen={pinModalOpen} onClose={() => setPinModalOpen(false)} />
      <Disable2FAModal
        isOpen={disable2FAModalOpen}
        onClose={() => setDisable2FAModalOpen(false)}
        onDisable={handleDisable2FA}
        isLoading={disable2FALoading}
      />
    </div>
  )
}
